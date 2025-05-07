const nodemailer = require('nodemailer');

const sendEmail = async options => {
  try {
    // Create a transporter
    let transporter;
    
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      // For development, use Ethereal (fake SMTP service)
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
      
      console.log('Using Ethereal test account for email');
    } else {
      // For production, use Gmail
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
      from: `TeamSync <${process.env.EMAIL_USERNAME}>`,
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
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = sendEmail;