import { Router } from "express";
import { GlobalPayWebhook } from "../controllers/siigo/GlobalPayNode/GlobalPayDTO";
import { GlobalPayWebhookService } from "../controllers/siigo/GlobalPayNode/GlobalPayDAL";
import { SiigoDAL } from "../controllers/siigo/SiigoNode/SiigoDAL";

const siigoRouter = Router();

// Initialize services
const siigoService = new SiigoDAL();
const webhookService = new GlobalPayWebhookService(siigoService);

// Webhook endpoint for Siigo
siigoRouter.post("/webhook", async (req, res) => {
    try {
        const payload = req.body as GlobalPayWebhook;

        if (!payload?.transaction || !payload?.user) {
            console.warn('Payload inválido.');
            res.status(400).json({ message: 'Payload inválido.' });
            return;
        }

        console.info(`Webhook válido recibido. Transacción ID: ${payload.transaction.id}, Estado: ${payload.transaction.status}`);

        // Process the webhook
        await webhookService.processWebhook(payload);

        res.status(200).send();
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default siigoRouter;