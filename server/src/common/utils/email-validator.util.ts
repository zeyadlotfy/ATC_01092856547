import * as dns from 'dns';
import { promisify } from 'util';

export class EmailValidator {
  /**
   * Validates if an email is potentially real by checking:
   * 1. Basic email format (regex)
   * 2. If the domain exists and has valid MX records
   *
   * @param email The email to validate
   * @returns Promise<boolean> true if email is potentially valid
   */
  static async isValidEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    const domain = email.split('@')[1];

    try {
      const resolveMx = promisify(dns.resolveMx);
      const mxRecords = await resolveMx(domain);

      return mxRecords && mxRecords.length > 0;
    } catch (error) {
      return false;
    }
  }
}
