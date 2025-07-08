export interface ProductResponse {
    results: Product[];
}

export interface Self {
    href: string | null;
}

export interface OrderDB {
    reference: string;
    quantity: string;
}

export interface Product {
    code: string;
    taxes: Tax[];
    prices: Price[];
}

export interface AccountGroup {
    id: number;
    name: string;
}

export interface AdditionalFields {
    barcode: string;
}

export interface Metadata {
    created: Date;
    last_updated: Date;
}

export interface Price {
    currency_code: string;
    price_list: PriceList[];
}

export interface PriceList {
    position: number;
    name: string;
    value: number;
}

export interface Tax {
    id: number;
    name: string;
    type: string;
    percentage: number;
}

export interface Unit {
    code: string;
    name: string;
}

export interface Warehouse {
    id: number;
    name: string;
    quantity: number;
}

export interface Customer {
    identification: string;
    name: string[];
    address: Address;
    phones: Phone[];
    contacts: Contact[];
}

export interface Address {
    address: string;
    city: City;
    postal_code: string;
}

export interface Stamp {
    send: boolean;
}

export interface Mail {
    send: boolean;
}

export interface Document {
    id: number;
}

export interface OrderJson {
    document: Document;
    date: string;
    customer: Customer;
    seller: number;
    stamp: Stamp;
    mail: Mail;
    observations: string;
    items: Item[];
    payments: Payment[];
}

export interface City {
    country_code: string;
    country_name: string;
    state_code: string;
    state_name: string;
    city_code: string;
    city_name: string;
}

export interface Phone {
    indicative: string;
    number: string;
    extension: string;
}

export interface Contact {
    first_name: string;
    last_name: string;
    email: string;
    phone: Phone;
}

export interface Payment {
    id: number;
    value: number;
}

export interface Item {
    taxes?: any;
    taxId?: number;
    percentage?: number;
    code: string;
    quantity: number;
    price: number;
    discount?: number;
    warehouse?: any;
}

export interface Taxes {
    id: number;
}

export interface SiigoToken {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

export interface CityDto {
    country_code: string;
    country_name: string;
    state_code: string;
    state_name: string;
    city_code: string;
    city_name: string;
}

export interface AddressDto {
    address: string;
    city: CityDto;
    postal_code: string;
}

export interface ISeller {
    idCostCenter: number;
    idWarehouse: number;
    idSeller: number;
} 