import { Router } from "express";
import { GlobalPayWebhook } from "../controllers/siigo/GlobalPayNode/GlobalPayDTO";
import { GlobalPayWebhookService } from "../controllers/siigo/GlobalPayNode/GlobalPayDAL";
import { SiigoDAL } from "../controllers/siigo/SiigoNode/SiigoDAL";

const siigoRouter = Router();

// Initialize services with dependency injection
const siigoService = new SiigoDAL();
const webhookService = new GlobalPayWebhookService(siigoService);

// Webhook endpoint for Siigo
siigoRouter.post("/webhook", async (req, res) => {
    try {
        // Create payload from query parameters
        const payload: GlobalPayWebhook = {
            query: req.query as any
        };

        // Basic validation
        if (!payload.query.x_description || !payload.query.x_respuesta) {
            console.warn('Invalid payload - missing required fields.');
            res.status(400).json({ message: 'Invalid payload - missing required fields.' });
            return;
        }

        const response = await webhookService.processWebhook(payload);

        res.status(200).json({ message: response });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default siigoRouter;