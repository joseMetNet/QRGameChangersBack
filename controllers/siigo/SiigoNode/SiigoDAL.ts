import axios from 'axios';
import {
    ProductResponse,
    SiigoToken,
    AddressDto,
    ISeller,
    Item
} from './SiigoDTO';
import { EnvConfig } from '../../../config/config';

interface SiigoConfig {
    UserName: string;
    AccessKey: string;
    PartnerId: string;
}

export class SiigoDAL {
    private readonly configuration: SiigoConfig;
    private readonly httpClient: ReturnType<typeof axios.create>;
    private token: string | null = null;
    private tokenExpiry: Date = new Date();
    private tokenRefreshPromise: Promise<string> | null = null;

    constructor(config?: SiigoConfig) {
        this.httpClient = axios.create({
            timeout: 30000, // 30 seconds timeout
        });

        // Initialize configuration from parameter or environment variables
        this.configuration = config || {
            UserName: EnvConfig.SIIGO_USERNAME,
            AccessKey: EnvConfig.SIIGO_ACCESS_KEY,
            PartnerId: EnvConfig.SIIGO_PARTNER_ID
        };

        this.validateConfiguration();
    }

    private validateConfiguration(): void {
        if (!this.configuration.UserName || !this.configuration.AccessKey || !this.configuration.PartnerId) {
            throw new Error('Siigo configuration is incomplete. Please provide UserName, AccessKey, and PartnerId.');
        }
    }

    public async getTokenAsync(): Promise<string> {
        // Quick check without lock for most cases
        if (this.token && this.tokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
            return this.token;
        }

        // If token refresh is already in progress, wait for it
        if (this.tokenRefreshPromise) {
            return await this.tokenRefreshPromise;
        }

        // Start token refresh process
        this.tokenRefreshPromise = this.refreshToken();

        try {
            const token = await this.tokenRefreshPromise;
            return token;
        } finally {
            this.tokenRefreshPromise = null;
        }
    }

    private async refreshToken(): Promise<string> {
        try {
            // Check again once inside the refresh process
            if (this.token && this.tokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
                return this.token;
            }

            const authPayload = {
                username: this.configuration.UserName,
                access_key: this.configuration.AccessKey
            };

            const response = await this.httpClient.post('https://api.siigo.com/auth', authPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Partner-Id': this.configuration.PartnerId
                }
            });

            const tokenResponse = response.data as SiigoToken;
            this.token = tokenResponse.access_token;
            this.tokenExpiry = this.decodeJwtExpiry(this.token);
            console.info('Siigo token successfully refreshed.');
            return this.token;
        } catch (error) {
            console.error('Error retrieving Siigo token during refresh:', error);
            throw new Error(`Failed to refresh Siigo token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findSiigoProductAsync(reference: string): Promise<ProductResponse> {
        const token = await this.getTokenAsync();
        try {
            const response = await this.httpClient.get(`https://api.siigo.com/v1/products?code=${reference}`, {
                headers: {
                    'Partner-Id': this.configuration.PartnerId,
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data as ProductResponse;
        } catch (error) {
            console.error(`Error fetching product for reference: ${reference}`, error);
            throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async findSiigoClient(identification: string): Promise<[boolean, AddressDto | null]> {
        const token = await this.getTokenAsync();
        try {
            const response = await this.httpClient.get(`https://api.siigo.com/v1/customers?identification=${identification}`, {
                headers: {
                    'Partner-Id': this.configuration.PartnerId,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status !== 200) {
                console.warn(`No se pudo consultar el cliente con identificación ${identification}. Código de estado: ${response.status}`);
                return [false, null];
            }

            const responseData = response.data as any;
            const results = responseData.results;
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
            const response = await this.httpClient.post('https://api.siigo.com/v1/invoices', body, {
                headers: {
                    'Content-Type': 'application/json',
                    'Partner-Id': this.configuration.PartnerId,
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(`Invoice created successfully: ${response.data}`);

            return response.data as string;
        } catch (err: any) {
            console.error('Error creating invoice:', err.message);
            throw new Error(`Failed to create invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    public buildCompleteCityCode(stateCode: string, cityCode: string): string {
        const formattedStateCode = stateCode ? stateCode.padStart(2, '0') : '';
        const formattedCityCode = cityCode ? cityCode.padStart(3, '0') : '';
        return formattedStateCode + formattedCityCode;
    }

    private decodeJwtExpiry(token: string): Date {
        try {
            const parts = token.split('.');
            if (parts.length < 2) {
                console.warn('Invalid JWT token format');
                return new Date(Date.now() + 3600 * 1000); // Default to 1 hour from now
            }

            const payload = Buffer.from(parts[1], 'base64').toString();
            const json = JSON.parse(payload);

            if (json.exp) {
                return new Date(json.exp * 1000);
            }

            console.warn('JWT token does not contain expiry information');
            return new Date(Date.now() + 3600 * 1000); // Default to 1 hour from now
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            return new Date(Date.now() + 3600 * 1000); // Default to 1 hour from now
        }
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