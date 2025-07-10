import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailProps {
  to: string;
  name: string;
  verificationCode: string;
  universityName: string;
}

/**
 * Sends a verification email using Resend
 * In development, emails will be sent to the Resend test domain (@resend.dev)
 * and can be viewed in the Resend dashboard
 */
export async function sendVerificationEmail({
  to,
  name,
  verificationCode,
  universityName,
}: SendVerificationEmailProps) {
  // For development, ensure we're using a test domain
  const recipientEmail = process.env.NODE_ENV === 'development' 
    ? 'test@resend.dev'  // Replace with your test email
    : to;

  try {
    console.log(`Sending verification email to: ${recipientEmail}`);
    
    const { data, error } = await resend.emails.send({
      from: 'Vouchly <onboarding@resend.dev>', // Using Resend's test domain
      to: [recipientEmail],
      subject: `[TEST] Verify your ${universityName} email`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>🔐 Verify Your University Email</h1>
          <p>Hello ${name},</p>
          <p>Thank you for signing up with Vouchly! To complete your registration, please verify your ${universityName} email address by entering the following code:</p>
          
          <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 4px; font-weight: bold; border: 1px solid #bae6fd; border-radius: 8px;">
            ${verificationCode}
          </div>
          
          <p>This code will expire in 24 hours.</p>
          <p><em>This is a test email. In production, this would be sent to: ${to}</em></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Vouchly Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    console.log('✅ Verification email sent successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error in sendVerificationEmail:', error);
    // In development, log the error but don't block the flow
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing in development mode despite email error');
      return { success: true, data: { id: 'test-email-id' } };
    }
    throw error;
  }
}
