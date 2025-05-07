const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create a test account if we're in development
  let transporter;
  
  if (process.env.NODE_ENV === 'development') {
    // Use ethereal for testing in development
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else {
    // Use Gmail in production
    transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Define the email options
  const mailOptions = {
    from: 'TeamSync Support <konudulanithin234@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || undefined
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  
  // Log the test URL if in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

module.exports = sendEmail;