import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './../user/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(host: string, user: User, token: string) {
    const url = `${host}/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to EZWxBrief 2.0! Confirm your Email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.firstname,
        url,
      },
    });
  }

  async sendResetPasswordMail(host: string, user: User, token: string) {
    const url = `${host}/auth/reset?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Here are the instructions to reset your EZWxBrief password',
      template: './password-reset', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        firstname: user.firstname,
        url: url,
        SupportEmail: 'support@ezwxbrief.com',
        InstagramLink: 'https://instagram.com/ezwxbrief',
        FacebookLink: 'https://facebook.com/ezwxbrief',
        YoutubeLink: 'https://youtube.com/@ezwxbrief',
      },
    });
    return true;
  }
}
