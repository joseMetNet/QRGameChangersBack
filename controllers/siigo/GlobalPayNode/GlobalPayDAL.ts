import { QueryTypes } from 'sequelize';
import { IGlobalPayWebhookService, GlobalPayWebhook } from './GlobalPayDTO';
import { SiigoDAL } from "../SiigoNode/SiigoDAL";
import db from "../../../database/connection";
import Mailgun from "mailgun.js";
import FormData from "form-data";
import { EnvConfig } from "../../../config/config";

interface OrderDB {
    Reference: string;
    Quantity: string;
}

interface OrderQueryResult {
    idOrder: number;
    firstName: string;
    lastName: string;
    email: string;
    documentNumber: string;
    phone: string;
    address: string;
    city: string;
    quantity: number;
    city_code: string;
    state_code: string;
    department: string;
    reference: string;
}

interface ProcessedItem {
    code: string;
    quantity: number;
    price: number;
    discount: number;
}

interface Item {
    code: string;
    quantity: number;
    price: number;
    discount: number;
    warehouse: string;
    taxId: string;
    percentage: number;
    taxes: Array<{ id: string }>;
}

// Simple logger utility
class Logger {
    static info(message: string, data?: any): void {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }

    static error(message: string, error?: any): void {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) {
            console.error(error);
        }
    }

    static success(message: string, data?: any): void {
        console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

export class GlobalPayWebhookService implements IGlobalPayWebhookService {
    private readonly appKey: string;
    private readonly siigoService: SiigoDAL;
    private readonly mailgun: ReturnType<Mailgun['client']>;
    private readonly fromDomain: string;
    private readonly fromEmail: string;

    constructor(siigoService: SiigoDAL) {
        this.appKey = 'OWJjYmU3YjAtM2FmOS00ZDI5LWFiNmQtNWY2MmZkNDI2MzdmOjRzcnpZfjIlY1c=';
        this.siigoService = siigoService;

        // Initialize Mailgun
        const mailgunClient = new Mailgun(FormData);
        this.mailgun = mailgunClient.client({
            username: "api",
            key: EnvConfig.MAILGUN_API_KEY,
        });
        this.fromDomain = "sandbox6bc14d54c50844d98489030220066478.mailgun.org";
        this.fromEmail = `GlobalPay Webhook <postmaster@${this.fromDomain}>`;
    }

    public async processWebhook(payload: GlobalPayWebhook): Promise<void> {
        try {
            // Validate payload structure
            if (!payload?.query) {
                throw new Error('Invalid webhook payload: missing query object');
            }

            const { query } = payload;

            if (query.x_respuesta === "Aceptada") {
                Logger.info('Transaction successful, creating invoice', {
                    response: query.x_response_reason_text,
                    amount: query.x_amount,
                    transactionId: query.x_ref_payco
                });

                // Extract and validate order ID
                const orderId = this.extractOrderId(query.x_description);
                if (!orderId) {
                    throw new Error(`Order ID not found in description: ${query.x_description}`);
                }

                const response = await this.createInvoice(orderId);

                // Send success notification
                await this.sendSuccessEmail(JSON.stringify(response), orderId, query.x_ref_payco);

            } else {
                Logger.error('Transaction failed', {
                    response: query.x_respuesta,
                    reason: query.x_response_reason_text,
                    amount: query.x_amount
                });

                await this.sendFailureEmail(payload, 'Transaction was not accepted');
            }
        } catch (err: any) {
            Logger.error('Error processing webhook', err);

            // Send error notification but don't let email failures mask the original error
            try {
                await this.sendErrorEmail(err, payload);
            } catch (emailError) {
                Logger.error('Failed to send error notification email', emailError);
            }

            // Re-throw the original error for proper error handling upstream
            throw err;
        }
    }

    private extractOrderId(description: string): string | null {
        Logger.info('Extracting order ID from description', { description });
        if (!description) {
            return null;
        }

        const parts = description.split('#');
        if (parts.length < 2) {
            return null;
        }

        const orderId = parts[1]?.trim();
        return orderId || null;
    }

    private async createInvoice(idOrder: string): Promise<string> {
        try {
            Logger.info(`Starting invoice creation for order ID: ${idOrder}`);

            // Validate order ID
            const orderIdNum = parseInt(idOrder);
            if (isNaN(orderIdNum)) {
                throw new Error(`Invalid order ID format: ${idOrder}`);
            }

            // Initialize variables with proper typing
            const orderData = {
                orderList: [] as OrderDB[],
                city: '',
                department: '',
                address: '',
                phone: '',
                mail: '',
                name: '',
                lastName: '',
                city_code: '',
                state_code: '',
                numberDocument: ''
            };

            const query = `
            SELECT
                tbo.idOrder,
                tbo.nombres as firstName,
                tbo.apellidos as lastName,
                tbo.email,
                tbo.cedula as documentNumber,
                tbo.telefono as phone,
                tbo.direccion as address,
                tbc.city,
                SUM(tbp.quantity) as quantity,
                tbc.code as city_code,
                tbd.code as state_code,
                tbd.nameDepartment as department,
                tbel.reference
            FROM TB_ORDER AS tbo
            LEFT JOIN productos AS tbp ON tbp.idOrder = tbo.idOrder
            LEFT JOIN TB_EventLocation as tbel ON tbel.idEventLocation=tbp.idEventLocation
            LEFT JOIN TB_City AS tbc ON tbc.idCity = tbo.idCity
            LEFT JOIN TB_Department AS tbd ON tbd.idDepartment = tbo.idDepartment
            WHERE tbo.idOrder = :idOrder
            GROUP BY tbo.idOrder, tbo.nombres, tbo.apellidos, tbo.email, tbo.cedula, tbo.telefono, tbo.direccion, tbc.city, tbc.code, tbd.code, tbd.nameDepartment, tbel.reference;
            `;

            const results = await db.query(query, {
                replacements: { idOrder: orderIdNum },
                type: QueryTypes.SELECT
            }) as OrderQueryResult[];

            // Validate that we found the order
            if (!results || results.length === 0) {
                throw new Error(`Order not found with ID: ${idOrder}`);
            }

            // Process the results and populate order data
            this.populateOrderData(results, orderData);

            // Validate required fields
            this.validateOrderData(orderData);

            // Process each product in the order
            const items = await this.processOrderItems(orderData.orderList);

            if (items.length === 0) {
                throw new Error('No valid items found for invoice creation');
            }

            // Get customer address information
            const [siigoAddressExist, siigoAddress] = await this.siigoService.findSiigoClient(orderData.numberDocument);

            Logger.info('Customer address lookup result', {
                numberDocument: orderData.numberDocument,
                siigoAddressExist,
                hasExistingAddress: !!siigoAddress
            });

            // Build the invoice payload
            const invoicePayload = this.buildInvoicePayload(orderData, items, siigoAddressExist, siigoAddress);

            const json = JSON.stringify(invoicePayload);
            Logger.info('Invoice payload prepared', {
                itemCount: items.length,
                totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            });

            const siigoResponse = await this.siigoService.createInvoiceAsync(json);
            Logger.success('Invoice created successfully', { orderId: idOrder });

            return siigoResponse;
        } catch (err: any) {
            Logger.error('Error creating invoice', {
                orderId: idOrder,
                error: err.message || err
            });
            throw err;
        }
    }

    private populateOrderData(results: OrderQueryResult[], orderData: any): void {
        results.forEach((row) => {
            orderData.orderList.push({
                Reference: row.reference,
                Quantity: row.quantity.toString()
            });

            // Only set values if they're not already set (first row wins)
            if (!orderData.city) orderData.city = row.city;
            if (!orderData.department) orderData.department = row.department;
            if (!orderData.address) orderData.address = row.address;
            if (!orderData.phone) orderData.phone = row.phone;
            if (!orderData.mail) orderData.mail = row.email;
            if (!orderData.name) orderData.name = row.firstName;
            if (!orderData.lastName) orderData.lastName = row.lastName;
            if (!orderData.state_code) orderData.state_code = row.state_code;
            if (!orderData.city_code) orderData.city_code = row.city_code;
            if (!orderData.numberDocument) orderData.numberDocument = row.documentNumber;
        });
    }

    private validateOrderData(orderData: any): void {
        const requiredFields = ['name', 'lastName', 'mail', 'numberDocument', 'address', 'phone'];
        const missingFields = requiredFields.filter(field => !orderData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required customer data: ${missingFields.join(', ')}`);
        }

        if (orderData.orderList.length === 0) {
            throw new Error('No products found in order');
        }
    }

    private async processOrderItems(orderList: OrderDB[]): Promise<ProcessedItem[]> {
        const processOrder = async (orderDb: OrderDB): Promise<ProcessedItem[]> => {
            try {
                Logger.info(`Processing product with reference: ${orderDb.Reference}`);

                if (!orderDb.Reference) {
                    Logger.error('Missing product reference');
                    return [];
                }

                const productResult = await this.siigoService.findSiigoProductAsync(orderDb.Reference);
                const quantity = orderDb.Quantity ? parseFloat(orderDb.Quantity) : 0;

                if (quantity <= 0) {
                    Logger.error(`Invalid quantity for product ${orderDb.Reference}: ${quantity}`);
                    return [];
                }

                if (!productResult.results || productResult.results.length === 0) {
                    Logger.error(`No product found for reference: ${orderDb.Reference}`);
                    return [];
                }

                return productResult.results.map(p => {
                    // Validate product structure
                    if (!p.prices?.[0]?.price_list?.[0]?.value || !p.taxes?.[0]?.percentage) {
                        Logger.error(`Invalid product data structure for ${orderDb.Reference}`);
                        return null;
                    }

                    const basePrice = p.prices[0].price_list[0].value;
                    const taxRate = p.taxes[0].percentage / 100;
                    const priceWithoutTax = Math.round((basePrice / (1 + taxRate)) * 100) / 100;

                    Logger.info(`Price calculation for ${p.code}`, {
                        basePrice,
                        taxRate: p.taxes[0].percentage,
                        priceWithoutTax
                    });

                    return {
                        code: p.code,
                        quantity: quantity,
                        price: priceWithoutTax,
                        discount: 0,
                    };
                }).filter(item => item !== null) as ProcessedItem[];
            } catch (error) {
                Logger.error(`Error processing order ${orderDb.Reference}:`, error);
                return [];
            }
        };

        const itemGroups = await Promise.all(orderList.map(processOrder));
        return itemGroups
            .flat()
            .filter(item => item.quantity > 0);
    }

    private buildInvoicePayload(orderData: any, items: ProcessedItem[], siigoAddressExist: boolean, siigoAddress: any): any {
        const stateCode = siigoAddressExist
            ? siigoAddress?.city.state_code
            : String(orderData.state_code).padStart(2, '0');

        const stateName = siigoAddressExist
            ? siigoAddress?.city.state_name
            : orderData.department;

        const cityCode = siigoAddressExist
            ? siigoAddress?.city.city_code
            : this.siigoService.buildCompleteCityCode(String(orderData.state_code), String(orderData.city_code));

        const cityName = siigoAddressExist
            ? siigoAddress?.city.city_name
            : orderData.city;

        // Calculate total payment value correctly
        const totalPaymentValue = items.reduce((sum, item) => {
            return sum + Math.round(item.price * item.quantity * 100) / 100;
        }, 0);

        return {
            document: { id: 27290 },
            date: new Date().toISOString().split('T')[0],
            customer: {
                person_type: "Person",
                id_type: "13",
                identification: orderData.numberDocument.replace(/[.\s]/g, ''),
                branch_office: 0,
                name: [orderData.name, orderData.lastName],
                address: {
                    address: orderData.address,
                    city: {
                        country_code: "Co",
                        country_name: "Colombia",
                        state_code: stateCode,
                        state_name: stateName,
                        city_code: cityCode,
                        city_name: cityName
                    },
                    postal_code: "110911"
                },
                phones: [{
                    indicative: "57",
                    number: orderData.phone,
                    extension: "132"
                }],
                contacts: [{
                    first_name: orderData.name,
                    last_name: orderData.lastName,
                    email: orderData.mail,
                    phone: {
                        indicative: "57",
                        number: orderData.phone,
                        extension: "132"
                    }
                }]
            },
            seller: 894,
            cost_center: 634,
            stamp: { send: true },
            mail: { send: false },
            observations: "Abstenerse de realizar Retefuente. Empresa con beneficio de Renta Exenta otorgado por el Min. de Cultura, Res. 1568 del 22 de Octubre de 2021 \nAbstenerse de RETEICA.  Act. económica 9004  no gravada con el ICA, de conformidad la res. No. SHD-000265 del 13 de abril del 2021 en su artículo 2 Parágrafo 2.",
            items: items,
            payments: [{
                id: 9625,
                due_date: new Date().toISOString().split('T')[0],
                value: Math.round(totalPaymentValue * 100) / 100
            }]
        };
    }

    private async sendSuccessEmail(response: string, orderId: string, transactionId: string): Promise<void> {
        const emailBody = `Invoice created successfully for Order #${orderId}

Transaction Details:
- Order ID: ${orderId}
- Transaction ID: ${transactionId}
- Timestamp: ${new Date().toISOString()}

Siigo Response:
${response}
        `;

        await this.sendEmailNotification(
            "Invoice Created Successfully - GlobalPay Transaction",
            emailBody
        );
    }

    private async sendFailureEmail(payload: GlobalPayWebhook, reason: string): Promise<void> {
        const emailBody = `Transaction failed: ${reason}

Transaction Details:
- Description: ${payload.query.x_description}
- Amount: ${payload.query.x_amount}
- Response: ${payload.query.x_respuesta}
- Reason: ${payload.query.x_response_reason_text}
- Timestamp: ${new Date().toISOString()}

Full Payload:
${JSON.stringify(payload, null, 2)}
        `;

        await this.sendEmailNotification(
            "Transaction Failed - GlobalPay Webhook",
            emailBody
        );
    }

    private async sendErrorEmail(error: any, payload: GlobalPayWebhook): Promise<void> {
        const emailBody = `Error processing GlobalPay webhook

Error Details:
- Message: ${error.message || 'Unknown error'}
- Stack: ${error.stack || 'No stack trace available'}
- Timestamp: ${new Date().toISOString()}

Webhook Payload:
${JSON.stringify(payload, null, 2)}
        `;

        await this.sendEmailNotification(
            "Error Processing Webhook - GlobalPay",
            emailBody
        );
    }

    private async sendEmailNotification(subject: string, body: string): Promise<void> {
        try {
            const data = await this.mailgun.messages.create(this.fromDomain, {
                from: this.fromEmail,
                to: ["efpalaciosmo@unal.edu.co"],
                subject: subject,
                text: body,
            });

            Logger.success('Email notification sent successfully', {
                subject,
                messageId: data.id
            });
        } catch (error) {
            Logger.error('Error sending email notification', {
                subject,
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }
} 