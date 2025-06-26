import { Router } from "express";
import { GlobalPayWebhook } from "../controllers/siigo/GlobalPayNode/GlobalPayDTO";
import { GlobalPayWebhookService } from "../controllers/siigo/GlobalPayNode/GlobalPayDAL";
import { SiigoDAL } from "../controllers/siigo/SiigoNode/SiigoDAL";
import Mailgun from "mailgun.js";
import { EnvConfig } from "../config/config";

const siigoRouter = Router();

// Initialize services
const siigoService = new SiigoDAL();
const webhookService = new GlobalPayWebhookService(siigoService);
const mailgunClient = new Mailgun(FormData);
const mailgun = mailgunClient.client({
            username: "api",
            key: EnvConfig.MAILGUN_API_KEY,
        });

// Webhook endpoint for Siigo
siigoRouter.post("/webhook", async (req, res) => {
    try {
        //const payload = req.body as GlobalPayWebhook;

        //if (!payload?.transaction || !payload?.user) {
        //    console.warn('Payload inválido.');
        //    res.status(400).json({ message: 'Payload inválido.' });
        //    return;
        //}

        //console.info(`Webhook válido recibido. Transacción ID: ${payload.transaction.id}, Estado: ${payload.transaction.status}`);

        //// Process the webhook
        //await webhookService.processWebhook(payload);

        await sendWebhookEmail(req.body);

        res.status(200).send();
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

const sendWebhookEmail = async (requestBody: any): Promise<void> => {
        try {
            const emailBody = `Webhook received with the following data:
            ${JSON.stringify(requestBody, null, 2)}
                Timestamp: ${new Date().toISOString()}
            `;

            const data = await mailgun.messages.create("sandbox6bc14d54c50844d98489030220066478.mailgun.org", {
                from: "GlobalPay Webhook <postmaster@sandbox6bc14d54c50844d98489030220066478.mailgun.org>",
                to: ["efpalaciosmo@unal.edu.co"],
                subject: "GlobalPay Webhook Notification",
                text: emailBody,
            });

            console.log('Email sent successfully:', data);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

export default siigoRouter;