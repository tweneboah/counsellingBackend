const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter using Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    console.log(`🔧 EMAIL SERVICE - CHECKING CONFIGURATION:`);
    console.log(`   📧 EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
    console.log(`   🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
    console.log(`   🌐 FRONTEND_URL: ${process.env.FRONTEND_URL ? '✅ Set' : '❌ Missing'}`);
    
    try {
      await this.transporter.verify();
      console.log('✅ EMAIL SERVICE - Connection verified! Ready to send messages');
    } catch (error) {
      console.error('❌ EMAIL SERVICE - Connection failed:', error.message);
      console.error('   📊 Error details:', error);
    }
  }

  async sendPasswordResetEmail(email, resetToken, userType, fullName) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&userType=${userType}`;
    
    console.log(`📋 EMAIL SERVICE - PREPARING EMAIL:`);
    console.log(`   📧 From: ${process.env.EMAIL_USER}`);
    console.log(`   📧 To: ${email}`);
    console.log(`   🔗 Reset URL: ${resetURL}`);
    console.log(`   🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    
    const mailOptions = {
      from: {
        name: 'AI-Powered Counseling Platform',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Password Reset Request - AI-Powered Counseling Platform',
      html: this.getPasswordResetEmailTemplate(fullName, resetURL, userType),
      text: this.getPasswordResetEmailText(fullName, resetURL, userType),
    };

    console.log(`📮 EMAIL SERVICE - SENDING EMAIL...`);
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ EMAIL SERVICE - EMAIL SENT SUCCESSFULLY!`);
      console.log(`   📨 Message ID: ${info.messageId}`);
      console.log(`   📧 To: ${email}`);
      console.log(`   📊 Response: ${info.response}`);
      console.log(`   📝 Accepted: ${info.accepted}`);
      console.log(`   ❌ Rejected: ${info.rejected}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(`❌ EMAIL SERVICE - FAILED TO SEND EMAIL:`);
      console.error(`   📧 To: ${email}`);
      console.error(`   ⚠️  Error Message: ${error.message}`);
      console.error(`   📊 Error Code: ${error.code}`);
      console.error(`   📊 Full Error:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  getPasswordResetEmailTemplate(fullName, resetURL, userType) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            background: #06b6d4;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background: #1e293b;
            color: #94a3b8;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            border-radius: 0 0 8px 8px;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            color: #92400e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧠 AI-Powered Counseling Platform</h1>
          <p>Password Reset Request</p>
        </div>
        
        <div class="content">
          <h2>Hello ${fullName},</h2>
          
          <p>We received a request to reset your password for your ${userType === 'student' ? 'Student' : 'Counselor'} account on the AI-Powered Counseling Platform.</p>
          
          <p>If you requested this password reset, please click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetURL}" class="button">Reset Your Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">
            ${resetURL}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This password reset link will expire in 10 minutes</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>For security reasons, never share this link with anyone</li>
            </ul>
          </div>
          
          <p>If you're having trouble with your account or didn't request this reset, please contact our support team immediately.</p>
          
          <p>Stay well,<br>
          <strong>The AI-Powered Counseling Platform Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 AI-Powered Counseling Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailText(fullName, resetURL, userType) {
    return `
AI-Powered Counseling Platform - Password Reset Request

Hello ${fullName},

We received a request to reset your password for your ${userType === 'student' ? 'Student' : 'Counselor'} account on the AI-Powered Counseling Platform.

If you requested this password reset, please visit the following link to create a new password:
${resetURL}

IMPORTANT:
- This password reset link will expire in 10 minutes
- If you didn't request this password reset, please ignore this email
- For security reasons, never share this link with anyone

If you're having trouble with your account or didn't request this reset, please contact our support team immediately.

Stay well,
The AI-Powered Counseling Platform Team

© 2024 AI-Powered Counseling Platform. All rights reserved.
This is an automated message, please do not reply to this email.
    `;
  }

  async sendWelcomeEmail(email, fullName, userType) {
    const mailOptions = {
      from: {
        name: 'AI-Powered Counseling Platform',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Welcome to AI-Powered Counseling Platform! 🌟',
      html: this.getWelcomeEmailTemplate(fullName, userType),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't throw error for welcome emails as they're not critical
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getWelcomeEmailTemplate(fullName, userType) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
          }
          .footer {
            background: #1e293b;
            color: #94a3b8;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            border-radius: 0 0 8px 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 Welcome to AI-Powered Counseling Platform!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${fullName},</h2>
          
          <p>Welcome to the AI-Powered Counseling Platform! We're excited to have you join our community as a ${userType === 'student' ? 'student' : 'counselor'}.</p>
          
          <p>Our platform provides:</p>
          <ul>
            <li>🤖 AI-powered counseling sessions</li>
            <li>📅 Easy appointment scheduling</li>
            <li>📝 Personal journaling tools</li>
            <li>🔒 Secure and confidential conversations</li>
            <li>🇬🇭 Culturally relevant support for Ghanaian students</li>
          </ul>
          
          <p>You can now log in to your account and start exploring the platform. If you have any questions or need assistance, our support team is here to help.</p>
          
          <p>Take care of your mental health - we're here to support you every step of the way.</p>
          
          <p>Best regards,<br>
          <strong>The AI-Powered Counseling Platform Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 AI-Powered Counseling Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService(); 