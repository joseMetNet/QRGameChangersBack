import axios from "axios";
import FormData from "form-data"
import { buildQrEmailBody } from "./product.controller";
import { getMailgunConfig } from "../helpers/mailgun";

export const sendCheckInEmailMailgun = async (
  token: string,
  email: string,
  name: string
) => {
  try {
    const emailBody = buildQrEmailBody(token, name);

    // Lee configuración centralizada
    const { endpoint, apiKey, from } = getMailgunConfig();

    // Recomendado: aportar una parte de texto plano para Hotmail/Outlook
    const textFallback = emailBody
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim() || `Acceso de ${name}`;

    const params = new URLSearchParams();
    params.append('from', from); // en sandbox debe ser postmaster@<sandbox>
    params.append('to', `${name} <${email}>`);
    params.append('subject', '🎟 ¡Tu acceso al Gospel Manizales está listo!');
    params.append('html', emailBody);
    params.append('text', textFallback);

    // Opcionales: tracking y List-Unsubscribe (mejora entregabilidad Hotmail/Gmail)
    // params.append('h:List-Unsubscribe', '<mailto:baja@tudominio.com?subject=unsubscribe>');
    // params.append('h:List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
    // params.append('o:tracking-opens', 'yes');
    // params.append('o:tracking-clicks', 'no');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    // Mailgun normalmente responde JSON; si no, leemos como texto
    const raw = await res.text();
    let data: any = {};
    try { data = JSON.parse(raw); } catch { data = raw; }

    if (!res.ok) {
      console.error('❌ Error enviando correo (Mailgun):', {
        status: res.status, statusText: res.statusText, data
      });
      return null;
    }

    console.log('✅ Mailgun envió el correo:', data);
    return data;
  } catch (err) {
    console.error('Error enviando correo (Mailgun):', err);
    return null;
  }
};


