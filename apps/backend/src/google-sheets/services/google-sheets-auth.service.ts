import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsAuthService {
  constructor(private readonly config: ConfigService) {}

  async getSheetsClient(): Promise<sheets_v4.Sheets> {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.config.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        private_key: this.config
          .get<string>('GOOGLE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  }
}
