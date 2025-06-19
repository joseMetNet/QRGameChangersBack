import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { GlobalPayWebhook, IGlobalPayWebhookService } from "./GlobalPayNode/GlobalPayDTO";

export class GlobalPayController {
    private readonly webhookService: IGlobalPayWebhookService;
    private readonly appKey: string;

    constructor(webhookService: IGlobalPayWebhookService, appKey: string) {
        this.webhookService = webhookService;
        this.appKey = appKey;
    }

    public webhook = async (req: Request, res: Response): Promise<void> => {
        const payload = req.body as GlobalPayWebhook;

        if (!payload?.transaction || !payload?.user) {
            console.warn('Payload inválido.');
            res.status(400).json({ message: 'Payload inválido.' });
            return;
        }

        console.info(`Webhook válido recibido. Transacción ID: ${payload.transaction.id}, Estado: ${payload.transaction.status}`);

        // Procesar el webhook
        await this.webhookService.processWebhook(payload);

        res.status(200).send();
    };
}