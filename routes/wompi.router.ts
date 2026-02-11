import { Router, Request, Response } from "express";
import * as crypto from "crypto";

const router = Router();

function generateSignature(reference: string, amountInCents: number, currency: string, integritySecret: string): string {
  const text = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash("sha256").update(text).digest("hex");
}

router.post("/wompi/generate-signature", (req: Request, res: Response) => {
    try {
        const { reference, amountInCents, currency } = req.body;

        if (!reference || !amountInCents || !currency) {
            return res.status(400).json({ error: "Parámetros incompletos" });
        }

        const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "test_integrity_xxxxx";

        const signature = generateSignature(reference, amountInCents, currency, integritySecret);
        res.json({ signature });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generando firma" });
    }
});
export default router;
