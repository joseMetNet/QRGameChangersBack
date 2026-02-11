export interface IGlobalPayWebhookService {
    processWebhook(payload: GlobalPayWebhook): Promise<void>;
}

export interface GlobalPayWebhook {
    query: GlobalPayQuery;
}

export interface GlobalPayQuery {
    x_cust_id_cliente: string;
    x_ref_payco: string;
    x_id_factura: string;
    x_id_invoice: string;
    x_description: string;
    x_amount: string;
    x_amount_country: string;
    x_amount_ok: string;
    x_tax: string;
    x_amount_base: string;
    x_currency_code: string;
    x_respuesta: string;
    x_response: string;
    x_fecha_transaccion: string;
    x_transaction_date: string;
    x_cod_respuesta: string;
    x_cod_response: string;
    x_response_reason_text: string;
    x_customer_doctype: string;
    x_customer_document: string;
    x_customer_name: string;
    x_customer_lastname: string;
    x_customer_email: string;
    x_customer_phone: string;
    x_customer_movil: string;
    x_customer_ind_pais: string;
    x_customer_country: string;
    x_customer_city: string;
    x_customer_address: string;
    x_signature: string;
} 