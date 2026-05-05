// Fast2SMS with Variables Route - Better for OTP, avoids spam filter
// Uses template variables instead of direct message

export async function sendOTP(mobile, otp) {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      throw new Error('FAST2SMS_API_KEY not configured');
    }

    console.log('\n=== Fast2SMS OTP Request ===');
    console.log('Mobile:', mobile);
    console.log('OTP:', otp);

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        flash: '0',
        numbers: mobile,
      }),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('============================\n');
    
    if (data.return === true) {
      console.log('✓ OTP sent successfully');
      return data;
    }
    
    // Handle errors
    let errorMsg = 'Failed to send OTP';
    if (data.errors_keys?.includes('spam_sms')) {
      errorMsg = 'Spam filter triggered. Contact Fast2SMS support to whitelist your account.';
    } else if (data.message) {
      errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
    
    throw new Error(errorMsg);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}
