// Fast2SMS Quick SMS API - No verification required
// Route 'q' works without website verification or DLT

export async function sendOTP(mobile, otp) {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      throw new Error('FAST2SMS_API_KEY not configured');
    }

    console.log('\n=== Fast2SMS Quick SMS ===');
    console.log('Mobile:', mobile);
    console.log('OTP:', otp);

    // Ultra-simple message - just the OTP number
    const message = otp;

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        numbers: mobile,
      }),
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('==========================\n');
    
    if (data.return === true) {
      console.log('✓ OTP sent successfully');
      return data;
    }
    
    // Handle errors
    let errorMsg = 'Failed to send OTP';
    
    if (data.errors_keys) {
      errorMsg = Array.isArray(data.errors_keys) ? data.errors_keys.join(', ') : data.errors_keys;
    } else if (data.message) {
      errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
    
    throw new Error(errorMsg);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}
