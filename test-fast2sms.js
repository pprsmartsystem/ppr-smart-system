// Test Fast2SMS OTP sending directly
// Run with: node test-fast2sms.js

const testOTP = async () => {
  const apiKey = 'ZYpFi3HBy5mC8NeTPIGxwhVWfRdE72KljMJOkSaL1Xn9cQrz408R04Uuc75q6eZazClEvYJnFsVtdfmB';
  const mobile = '9999999999'; // Replace with your test number
  const otp = '123456';
  
  const message = `Your OTP for PPR Smart System KYC verification is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  
  const params = new URLSearchParams({
    authorization: apiKey,
    message: message,
    route: 'q',
    numbers: mobile,
    flash: '0',
  });

  const url = `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`;
  
  console.log('Testing Fast2SMS...');
  console.log('URL:', url.substring(0, 100) + '...');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    console.log('Response Status:', response.status);
    
    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.return === true) {
      console.log('✓ SUCCESS - OTP sent!');
    } else {
      console.log('✗ FAILED - Check error message above');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testOTP();
