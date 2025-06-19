import { createHash } from 'crypto';
import { QueryTypes, Sequelize } from 'sequelize';
import { IGlobalPayWebhookService, GlobalPayWebhook } from './GlobalPayDTO';
import { SiigoDAL } from "../SiigoNode/SiigoDAL";

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
    private readonly connectionString: string;
    private readonly appKey: string;
    private readonly siigoService: SiigoDAL;

    constructor(config: any, siigoService: SiigoDAL) {
        this.appKey = config.GlobalPay?.AppKey || 'TU_APP_KEY';
        this.connectionString = config.connectionStrings?.DefaultConnection;
        this.siigoService = siigoService;
    }

    public verifyStoken(payload: GlobalPayWebhook): boolean {
        if (!payload?.transaction || !payload?.user) {
            return false;
        }

        const concatenated = `${payload.transaction.id}${payload.transaction.application_code}${payload.user.id}${this.appKey}`;
        const stokenGenerated = createHash('md5')
            .update(concatenated)
            .digest('hex');

        return stokenGenerated === payload.transaction.stoken?.toLowerCase();
    }

    public async processWebhook(payload: GlobalPayWebhook): Promise<void> {
        try {
            Logger.info('Processing webhook payload', payload);

            if (payload.transaction.status === "1") {
                Logger.info('Transaction successful, creating invoice', {
                    transactionId: payload.transaction.id,
                    reference: payload.transaction.dev_reference
                });

                const response = await this.createInvoice(payload.transaction.dev_reference);

                Logger.success('Invoice created successfully', {
                    orderId: payload.transaction.dev_reference,
                    siigoResponse: response
                });
            } else {
                Logger.info('Transaction not successful, skipping invoice creation', {
                    status: payload.transaction.status,
                    transactionId: payload.transaction.id
                });
            }
        } catch (error) {
            Logger.error('Error processing webhook', {
                error: error,
                payload: payload
            });
            throw error;
        }
    }

    private async createInvoice(idOrder: string): Promise<string> {
        try {
            const sequelize = new Sequelize(this.connectionString);
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
            let idStore = -1;
            let shippingCost = '';
            let categoryShipping = '';
            let numberDocument = '';

            const query = `
                SELECT DISTINCT
                    qq.idOrder,
                    hh.reference,
                    cl.address AS direccion,
                    cl.phone AS telefono,
                    cl.mail AS correo,
                    cl.Name AS nombre,
                    cl.LastName apellido,
                    cl.numberDocument,
                    cl.idTypeDocument,
                    cl.idClient,
                    c.City AS ciudad,
                    c.code AS city_code,
                    d.code AS state_code,
                    d.nameDepartment AS departamento,
                    o.idStore AS idStore,
                    ng.shippingCost,
                    qq.quantity oQuantity,
                    ng.categoryShipping,
                    ed.idNeighborhood
                FROM
                    TB_ProductOrder AS qq
                LEFT JOIN
                    TB_Product AS hh ON hh.idProduct = qq.idProduct
                LEFT JOIN
                    TB_OrderShipping AS dd ON dd.idOrder = qq.idOrder
                LEFT JOIN
                    TB_NeighborhoodShipping AS ed ON ed.idNeighborhood = dd.idNeighborhoodShipping
                LEFT JOIN
                    TB_Order AS o ON o.idOrder = qq.idOrder
                LEFT JOIN
                    TB_NeighborhoodShipping AS ng ON ng.idNeighborhoodShipping = ed.idNeighborhoodShipping
                LEFT JOIN
                    TB_Neighborhood AS nd ON nd.idNeighborhood = ng.idNeighborhood
                LEFT JOIN
                    TB_Promotion AS ot ON ot.idProduct = hh.idProduct
                LEFT JOIN
                    TB_Client cl ON cl.idClient = o.idClient
                INNER JOIN
                    TB_City c ON c.idCity = cl.idCity
                INNER JOIN
                    TB_Department d ON d.idDepartment = c.idDepartment
                WHERE
                    qq.idOrder = :idOrder
            `;

            const [results] = await sequelize.query(query, {
                replacements: { idOrder: parseInt(idOrder) },
                type: QueryTypes.SELECT
            });

            if (Array.isArray(results)) {
                results.forEach((row: any) => {
                    orderList.push({
                        Reference: row.reference,
                        Quantity: row.oQuantity
                    });

                    if (!city) city = row.ciudad;
                    if (!department) department = row.departamento;
                    if (!address) address = row.direccion;
                    if (!phone) phone = row.telefono;
                    if (!mail) mail = row.correo;
                    if (!name) name = row.nombre;
                    if (!lastName) lastName = row.apellido;
                    if (!state_code) state_code = row.state_code;
                    if (!city_code) city_code = row.city_code;
                    if (idStore === -1) idStore = row.idStore;
                    if (!shippingCost) shippingCost = row.shippingCost;
                    if (!categoryShipping) categoryShipping = row.categoryShipping;
                    if (!numberDocument) numberDocument = row.numberDocument;
                });
            }

            const processOrder = async (orderDb: OrderDB) => {
                const productResult = await this.siigoService.findSiigoProductAsync(orderDb.Reference.split('-')[0]);
                const seller = this.siigoService.getSeller(idStore);
                const quantity = orderDb.Quantity ? parseFloat(orderDb.Quantity) : 0;

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
                        warehouse: seller.idWarehouse,
                        taxId: p.taxes[0].id,
                        percentage: taxRate,
                        taxes: p.taxes.map(tax => ({ id: tax.id }))
                    };
                });
            };

            const itemGroups = await Promise.all(orderList.map(processOrder));
            const itemGroup = this.siigoService.addNewSiigoItem(categoryShipping, parseFloat(shippingCost), itemGroups);
            const items = itemGroup
                .flat()
                .filter(item => item.quantity > 0);

            const [siigoAddressExist, siigoAddress] = await this.siigoService.findSiigoClient(numberDocument);

            const stateCode = siigoAddressExist ? siigoAddress?.city.state_code : state_code.padStart(2, '0');
            const stateName = siigoAddressExist ? siigoAddress?.city.state_name : department;
            const cityCode = siigoAddressExist ? siigoAddress?.city.city_code : this.siigoService.buildCompleteCityCode(state_code, city_code);
            const cityName = siigoAddressExist ? siigoAddress?.city.city_name : city;

            const baseJson = {
                document: { id: 4361 },
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
                seller: this.siigoService.getSeller(idStore).idSeller,
                cost_center: this.siigoService.getSeller(idStore).idCostCenter,
                stamp: { send: true },
                mail: { send: true },
                observations: "Producto comprado desde web",
                items: items,
                payments: items.map(item => ({
                    id: 7236,
                    value: Math.round(item.price * item.quantity * (item.percentage! + 1) * 100) / 100
                }))
            };

            const json = JSON.stringify(baseJson);
            Logger.info('Invoice JSON generated', { json });

            const siigoResponse = await this.siigoService.createInvoiceAsync(json);
            Logger.success('Siigo invoice created', { siigoResponse });

            return siigoResponse;
        } catch (error) {
            Logger.error('Error creating invoice', error);
            throw error;
        }
    }
} 