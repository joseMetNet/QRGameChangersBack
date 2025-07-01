import { createHash } from 'crypto';
import { QueryTypes, Sequelize } from 'sequelize';
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
            if (payload.query.x_respuesta === "Aceptada") {
                Logger.info('Transaction successful, creating invoice', {
                    response: payload.query.x_response_reason_text,
                });

                const orderId = (payload.query.x_description).split('#')[1]?.trim();
                if (!orderId) {
                    Logger.error('Order ID not found in description', {
                        description: payload.query.x_description
                    });
                    throw new Error('Order ID not found in description');
                }

                const response = await this.createInvoice(orderId);

                await this.sendEmail(response);

            } else {
                await this.sendEmail(`Transaction failed: ${JSON.stringify(payload)}`);
            }
        } catch (err: any) {
            await this.sendEmail(`Error processing webhook$ ${JSON.stringify(err)}`);
        }
    }

    private async createInvoice(idOrder: string): Promise<string> {
        try {
            Logger.info(`Starting invoice creation for order ID: ${idOrder}`);

            let orderList: OrderDB[] = [];
            let city = '';
            let department = '';
            let address = '';
            let phone = '';
            let mail = '';
            let name = '';
            let lastName = '';
            let city_code = '';
            let state_code = '';
            let shippingCost = '';
            let categoryShipping = '';
            let numberDocument = '';

            const query = `
            SELECT
                tbo.idOrder,
                tbo.nombres firstName,
                tbo.apellidos lastName,
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
                replacements: { idOrder: parseInt(idOrder) },
                type: QueryTypes.SELECT
            }) as any[];


            if (results && results.length > 0) {
                results.forEach((row: any) => {
                    orderList.push({
                        Reference: row.reference,
                        Quantity: row.quantity
                    });

                    if (!city) city = row.city;
                    if (!department) department = row.department;
                    if (!address) address = row.address;
                    if (!phone) phone = row.phone;
                    if (!mail) mail = row.email;
                    if (!name) name = row.firstName;
                    if (!lastName) lastName = row.lastName;
                    if (!state_code) state_code = row.state_code;
                    if (!city_code) city_code = row.city_code;
                    if (!shippingCost) shippingCost = row.shippingCost;
                    if (!categoryShipping) categoryShipping = row.categoryShipping;
                    if (!numberDocument) numberDocument = row.documentNumber;
                });
            }

            const processOrder = async (orderDb: OrderDB) => {
                try {
                    Logger.info(`Processing product with reference: ${orderDb.Reference}`);
                    const productResult = await this.siigoService.findSiigoProductAsync(orderDb.Reference);
                    const quantity = orderDb.Quantity ? parseFloat(orderDb.Quantity) : 0;

                    if (!productResult.results || productResult.results.length === 0) {
                        Logger.error(`No product found for reference: ${orderDb.Reference}`);
                        return [];
                    }

                    return productResult.results.map(p => {
                        const basePrice = p.prices[0].price_list[0].value;
                        const taxRate = p.taxes[0].percentage / 100;
                        const priceP = Math.round((basePrice / (1 + taxRate)) * 100) / 100;

                        console.log(`price $${basePrice} with tax multiplier ${taxRate}`);

                        return {
                            code: p.code,
                            quantity: quantity,
                            price: priceP,
                            discount: 0,
                        };
                    });
                } catch (error) {
                    Logger.error(`Error processing order ${orderDb.Reference}:`, error);
                    return [];
                }
            };

            const itemGroups = await Promise.all(orderList.map(processOrder));
            const items = itemGroups
                .flat()
                .filter(item => item.quantity > 0);

            const [siigoAddressExist, siigoAddress] = await this.siigoService.findSiigoClient(numberDocument);

            Logger.info('Debug - Siigo client lookup result', {
                numberDocument,
                siigoAddressExist,
                siigoAddress: siigoAddress
            });

            const stateCode = siigoAddressExist ? siigoAddress?.city.state_code : String(state_code).padStart(2, '0');
            const stateName = siigoAddressExist ? siigoAddress?.city.state_name : department;
            const cityCode = siigoAddressExist ? siigoAddress?.city.city_code : this.siigoService.buildCompleteCityCode(String(state_code), String(city_code));
            const cityName = siigoAddressExist ? siigoAddress?.city.city_name : city;

            const baseJson = {
                document: { id: 27290 },
                date: new Date().toISOString().split('T')[0],
                customer: {
                    person_type: "Person",
                    id_type: "13",
                    identification: numberDocument.replace(/[.\s]/g, ''),
                    branch_office: 0,
                    name: [name, lastName],
                    address: {
                        address: address,
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
                        number: phone,
                        extension: "132"
                    }],
                    contacts: [{
                        first_name: name,
                        last_name: lastName,
                        email: mail,
                        phone: {
                            indicative: "57",
                            number: phone,
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
                payments: items.map(item => ({
                    id: 9625,
                    due_date: new Date().toISOString().split('T')[0],
                    value: Math.round(item.price * item.quantity)//* (item.percentage! + 1) * 100) / 100
                }))
            };

            const json = JSON.stringify(baseJson);
            Logger.info('Invoice JSON generated', { baseJson });

            const siigoResponse = await this.siigoService.createInvoiceAsync(json);
            return siigoResponse;
        } catch (err: any) {
            Logger.error('Error creating invoice', err.message || err);
            throw err;
        }
    }

    private async sendEmail(response: string): Promise<void> {
        try {
            const emailBody = `Invoice created successfully:
                Response from Siigo:
                ${response}
                Timestamp: ${new Date().toISOString()}
            `;

            const data = await this.mailgun.messages.create(this.fromDomain, {
                from: this.fromEmail,
                to: ["efpalaciosmo@unal.edu.co"],
                subject: "Invoice Created - GlobalPay Transaction",
                text: emailBody,
            });

            Logger.success('Invoice email sent successfully', data);
        } catch (error) {
            Logger.error('Error sending invoice email', error);
            throw error;
        }
    }
} 