// Fast2SMS Quick SMS Route - Alternative implementation
// Use this if OTP route doesn't work

export async function sendOTPQuick(mobile, otp) {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      throw new Error('FAST2SMS_API_KEY not configured');
    }

    console.log('\n=== Fast2SMS Quick SMS Request ===');
    console.log('Mobile:', mobile);
    console.log('OTP:', otp);

    // Very simple message to avoid spam filter
    const message = `${otp} is your OTP`;

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
    console.log('Fast2SMS Response:', JSON.stringify(data, null, 2));
    console.log('============================\n');
    
    if (data.return === true) {
      console.log('✓ OTP sent successfully');
      return data;
    }
    
    throw new Error(data.message || 'Failed to send OTP');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}
