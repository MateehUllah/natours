const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlTotext = require('html-to-text');
const SendinBlue = require('nodemailer-sendinblue-transport');
//new Email(user,url(reset url).sendWelcom())

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Mateeh Ullah <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    //yahan check krain gay kis enviroment mai hain prod ya dev
    //agar dev mai hain to hum nodemailer trap use krain gay
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: process.env.SENDBLUE_LOGIN,
          pass: process.env.SENDBLUE_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    //send actual email

    //1)Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2)Define Email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlTotext.htmlToText(html), //this will convert html to text it increase delivery rate
      //and for spam folders
    };

    //3)create Transport
    //3)Actually send the emaill
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (Valid for 10 minutes)'
    );
  }
};
