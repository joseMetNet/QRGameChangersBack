import { Router } from "express";
import { GlobalPayWebhook } from "../controllers/siigo/GlobalPayNode/GlobalPayDTO";
import { GlobalPayWebhookService } from "../controllers/siigo/GlobalPayNode/GlobalPayDAL";

const siigoRouter = Router();
// You need to provide the required config and siigoService instances here
import { SiigoDAL } from "../controllers/siigo/SiigoNode/SiigoDAL";

const siigoService = new SiigoDAL();
const webhookService = new GlobalPayWebhookService(siigoService);
// Aquí puedes definir las rutas específicas para Siigo
siigoRouter.post("/webhook", (req, res) => {
    // Aquí iría la lógica para manejar el webhook de Siigo
        const payload = req.body as GlobalPayWebhook;

        if (!payload?.transaction || !payload?.user) {
            console.warn('Payload inválido.');
            res.status(400).json({ message: 'Payload inválido.' });
            return;
        }

        console.info(`Webhook válido recibido. Transacción ID: ${payload.transaction.id}, Estado: ${payload.transaction.status}`);

        // Procesar el webhook
        await webhookService.processWebhook(payload);

        res.status(200).send();
});