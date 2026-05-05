import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'FAST2SMS_API_KEY not found in environment variables',
        solution: 'Add FAST2SMS_API_KEY to .env.local file'
      }, { status: 500 });
    }

    // Test API with a simple request
    const params = new URLSearchParams({
      authorization: apiKey,
    });

    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
      method: 'GET',
    });

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      message: 'Fast2SMS API connection test',
      apiKeyConfigured: true,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      apiResponse: data,
      note: 'If you see "message or numbers is required" - API key is valid but parameters missing (expected)'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
