import * as dotenv from "dotenv";
dotenv.config();

class Config {
  // Siigo configuration
  private readonly siigoUsername: string;
  private readonly siigoAccessKey: string;
  private readonly siigoPartnerId: string;
  private readonly mailgunApiKey: string;

  constructor() {
    // Siigo configuration
    this.siigoUsername = this.getEnvVariable("SIIGO_USERNAME");
    this.siigoAccessKey = this.getEnvVariable("SIIGO_ACCESS_KEY");
    this.siigoPartnerId = this.getEnvVariable("SIIGO_PARTNER_ID");
    this.mailgunApiKey = this.getEnvVariable("MAILGUN_API_KEY");
  }

  private getEnvVariable(name: string): string {
    const env = process.env[name];
    if (!env) {
      throw new Error(`Environment variable ${name} not found`);
    }
    return env;
  }

  // Siigo getters
  get SIIGO_USERNAME(): string {
    return this.siigoUsername;
  }

  get SIIGO_ACCESS_KEY(): string {
    return this.siigoAccessKey;
  }

  get SIIGO_PARTNER_ID(): string {
    return this.siigoPartnerId;
  }

  get MAILGUN_API_KEY(): string {
    return this.mailgunApiKey;
  }
}

export const EnvConfig = Object.freeze(new Config());
