export function getMailgunConfig() {
  const domain = process.env.MAILGUN_DOMAIN?.trim();
  const apiKey = (process.env.MAILGUN_API_KEY_NOTIFICATION || process.env.MAILGUN_API_KEY || '').trim();
  const region = (process.env.MAILGUN_REGION || 'us').toLowerCase();
  const baseUrl = region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
  const from = (process.env.DEFAULT_EMAIL_FROM || '').trim();

  if (!domain) throw new Error('MAILGUN_DOMAIN no está configurado');
  if (!apiKey) throw new Error('MAILGUN_API_KEY_NOTIFICATION/MAILGUN_API_KEY no está configurada');
  if (!from)   throw new Error('DEFAULT_EMAIL_FROM no está configurado');

  return {
    domain,
    apiKey,
    endpoint: `${baseUrl}/v3/${domain}/messages`,
    from,
  };
}