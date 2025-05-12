import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const templateDir = join(__dirname, '../../../email-templates');
        console.log('Template directory:', templateDir);

        return {
          transport: {
            host: config.get('SMTP_HOST'),
            secure: true,
            auth: {
              user: config.get('SMTP_MAIL'),
              pass: config.get('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: 'Event Booking',
          },
          template: {
            dir: templateDir,
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
