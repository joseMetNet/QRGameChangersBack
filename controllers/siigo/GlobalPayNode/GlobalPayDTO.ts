export interface IGlobalPayWebhookService {
    verifyStoken(payload: GlobalPayWebhook): boolean;
    processWebhook(payload: GlobalPayWebhook): Promise<void>;
}

export interface GlobalPayWebhook {
    transaction: TransactionNg;
    user: UserNg;
}

export interface TransactionNg {
    // Required fields
    status: string;
    date: string;
    message: string;
    dev_reference: string;
    amount: string;
    stoken: string;

    // Optional fields
    id?: string;
    order_description?: string;
    authorization_code?: string;
    status_detail?: string;
    carrier_code?: string;
    paid_date?: string;
    installments?: string;
    ltp_id?: string;
    application_code?: string;
    terminal_code?: string;
}

export interface UserNg {
    // Required fields
    id: string;
    email: string;
} 