import { Resend } from 'resend';

// Initialize with your API key
const resend = new Resend('re_jHC9SKbi_Et2DhCd34buRDaZF5B7teUK8');

/**
 * Test function to send a verification email
 */
async function sendTestEmail() {
  try {
    console.log('Sending test email...');
    
    const { data, error } = await resend.emails.send({
      from: 'Vouchly <onboarding@resend.dev>',
      to: ['paulkwarteng12@gmail.com'],
      subject: 'Vouchly - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>✅ Vouchly Test Email</h1>
          <p>Hello there,</p>
          <p>This is a test email from Vouchly to verify that email sending is working correctly.</p>
          
          <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0; 
                     font-size: 24px; letter-spacing: 4px; font-weight: bold; 
                     border: 1px solid #bae6fd; border-radius: 8px;">
            TEST-1234
          </div>
          
          <p>If you received this email, your Resend integration is working correctly!</p>
          <p>Best regards,<br>The Vouchly Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error sending test email:', error);
      return;
    }

    console.log('✅ Test email sent successfully!');
    console.log('Email ID:', data?.id);
    console.log('Check your email or the Resend dashboard.');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
  }
}

// Run the test
sendTestEmail();
