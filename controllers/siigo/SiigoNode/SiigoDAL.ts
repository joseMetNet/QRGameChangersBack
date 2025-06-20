import axios, { AxiosInstance } from 'axios';
import { 
    ProductResponse, 
    SiigoToken, 
    AddressDto, 
    ISeller, 
    Item 
} from './SiigoDTO';

export class SiigoDAL {
    private readonly configuration: any;
    private readonly httpClient: AxiosInstance;
    private token: string | null = null;
    private tokenExpiry: Date = new Date();
    private readonly tokenRefreshLock = new Promise<void>((resolve) => resolve());

    constructor() {
        this.httpClient = axios.create();
    }

    public async getTokenAsync(): Promise<string> {
        // Quick check without lock for most cases
        if (this.token && this.tokenExpiry > new Date(Date.now() - 5 * 60 * 1000)) {
            return this.token;
        }

        // If token is null or about to expire, enter critical section
        await this.tokenRefreshLock;
        try {
            // Check again once inside the lock
            if (this.token && this.tokenExpiry > new Date(Date.now() - 5 * 60 * 1000)) {
                return this.token;
            }

            const userName = this.configuration.Siigo?.UserName;
            const accessKey = this.configuration.Siigo?.AccessKey;
            const partnerId = this.configuration.Siigo?.PartnerId;

            const authPayload = {
                username: userName,
                access_key: accessKey
            };

            const response = await this.httpClient.post('https://api.siigo.com/auth', authPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Partner-Id': partnerId
                }
            });

            const tokenResponse = response.data as SiigoToken;
            this.token = tokenResponse.access_token;
            this.tokenExpiry = this.decodeJwtExpiry(this.token);
            console.info('Siigo token successfully refreshed.');
            return this.token;
        } catch (error) {
            console.error('Error retrieving Siigo token during refresh:', error);
            throw error;
        }
    }

    public async findSiigoProductAsync(reference: string): Promise<ProductResponse> {
        const token = await this.getTokenAsync();
        try {
            const partnerId = this.configuration.Siigo?.PartnerId;
            const response = await this.httpClient.get(`https://api.siigo.com/v1/products?code=${reference}`, {
                headers: {
                    'Partner-Id': partnerId,
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error fetching product for reference: ${reference}`, error);
            throw error;
        }
    }

    public async findSiigoClient(identification: string): Promise<[boolean, AddressDto | null]> {
        const token = await this.getTokenAsync();
        try {
            const partnerId = this.configuration.Siigo?.PartnerId;
            const response = await this.httpClient.get(`https://api.siigo.com/v1/customers?identification=${identification}`, {
                headers: {
                    'Partner-Id': partnerId,
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(response.data);

            if (response.status !== 200) {
                console.warn(`No se pudo consultar el cliente con identificación ${identification}. Código de estado: ${response.status}`);
                return [false, null];
            }

            const results = response.data.results;
            if (!results || results.length === 0) {
                console.warn(`No se encontraron resultados para el cliente con identificación ${identification}.`);
                return [false, null];
            }

            const address = results[0].address as AddressDto;
            return [true, address];
        } catch (error) {
            console.error(`Error al consultar cliente con identificación: ${identification}`, error);
            return [false, null];
        }
    }

    public async createInvoiceAsync(body: string): Promise<string> {
        const token = await this.getTokenAsync();
        try {
            const partnerId = this.configuration.Siigo?.PartnerId;
            const response = await this.httpClient.post('https://api.siigo.com/v1/invoices', body, {
                headers: {
                    'Content-Type': 'application/json',
                    'Partner-Id': partnerId,
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }

    public buildCompleteCityCode(stateCode: string, cityCode: string): string {
        const formattedStateCode = stateCode ? stateCode.padStart(2, '0') : '';
        const formattedCityCode = cityCode ? cityCode.padStart(3, '0') : '';
        return formattedStateCode + formattedCityCode;
    }

    private decodeJwtExpiry(token: string): Date {
        const parts = token.split('.');
        if (parts.length < 2) return new Date();

        const payload = Buffer.from(parts[1], 'base64').toString();
        const json = JSON.parse(payload);
        if (json.exp) {
            return new Date(json.exp * 1000);
        }

        return new Date();
    }

    public addNewSiigoItem(
        code: string,
        price: number,
        items: Item[][]
    ): Item[][] {
        const defaultQuantity = 1.0;

        if (!code) {
            return items;
        }

        const newItemGroup: Item[] = [{
            code: code,
            quantity: defaultQuantity,
            price: price,
            discount: 0,
            percentage: 0
        }];

        return [...items, newItemGroup];
    }

    public getSeller(idStore: number): ISeller {
        switch (idStore) {
            case 2: // Bucaramanga
                return { idCostCenter: 30, idWarehouse: 16, idSeller: 725 };
            case 3: // Medellin
                return { idCostCenter: 32, idWarehouse: 17, idSeller: 726 };
            case 4: // Bogota
                return { idCostCenter: 28, idWarehouse: 15, idSeller: 724 };
            default:
                throw new Error(`Unknown store ID: ${idStore}`);
        }
    }

    public findLocationCode(location: string): string | null {
        const locationMap: { [key: string]: string } = {
            'MEDELLIN': '05001',
            'BOGOTÁ DC': '11001',
            'BUCARAMANGA': '68001',
            'Santander': '68',
            'Antioquia': '05',
            'D. C. Santa Fe de Bogotá': '11'
        };

        return locationMap[location.toUpperCase()] || null;
    }
} 