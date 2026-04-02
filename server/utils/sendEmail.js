const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Utilizing Ethereal for testing purposes since explicit credentials were not provided
  try {
      const testAccount = await nodemailer.createTestAccount();
      
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || testAccount.user,
          pass: process.env.EMAIL_PASS || testAccount.pass,
        },
      });

      const message = {
        from: `${process.env.FROM_NAME || 'CampusCore System'} <${process.env.FROM_EMAIL || 'admin@campuscore.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
      };

      const info = await transporter.sendMail(message);
      console.log('=============================');
      console.log('📩 Email Successfully Dispatched');
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      console.log('=============================');
  } catch (error) {
    console.error("Email dispatch failed:", error);
  }
};

module.exports = sendEmail;
