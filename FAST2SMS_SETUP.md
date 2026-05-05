# Fast2SMS Quick SMS Setup Guide

## ✅ Ready to Use - No Verification Required!

The Quick SMS API is now configured and ready to send OTP messages immediately. No DLT registration or website verification needed.

## Current Configuration

### API Details
- **Endpoint**: `https://www.fast2sms.com/dev/bulkV2`
- **Method**: GET
- **Route**: `q` (Quick SMS)
- **API Key**: Configured in `.env.local`

### Features
✅ Instant OTP delivery
✅ No DLT registration required
✅ No website verification needed
✅ 6-digit OTP generation
✅ 10-minute OTP expiry
✅ 60-second resend cooldown

## How It Works

1. User enters mobile number in KYC form
2. Clicks "Send OTP"
3. System generates 6-digit OTP
4. Fast2SMS sends SMS via Quick SMS route
5. User receives OTP on mobile
6. User enters OTP and clicks "Verify"
7. System validates OTP
8. Mobile number verified ✓

## Testing

1. Start your server: `npm run dev`
2. Navigate to KYC form: `/user/kyc`
3. Enter a valid 10-digit Indian mobile number
4. Click "Send OTP"
5. Check your mobile for OTP SMS
6. Enter OTP and verify

## API Response Format

### Success Response
```json
{
  "return": true,
  "request_id": "lwdtp7cjyqxvfe9",
  "message": ["Message sent successfully"]
}
```

### Error Response
```json
{
  "return": false,
  "message": "Error description"
}
```

## Cost & Credits

- **Quick SMS Rate**: ₹0.15 - ₹0.25 per SMS (approx)
- **Check Balance**: Login to [Fast2SMS Dashboard](https://www.fast2sms.com)
- **Add Credits**: Dashboard → Recharge section
- **Recommended**: Start with ₹500 credits (~2000-3000 OTPs)

## Message Format

Current OTP message:
```
Your OTP for PPR Smart System KYC verification is {OTP}. Valid for 10 minutes. Do not share with anyone.
```

## Monitoring

### Check Delivery Status
1. Login to [Fast2SMS Dashboard](https://www.fast2sms.com)
2. Go to **Reports** section
3. View delivery status by request_id
4. Check failed messages and reasons

### Server Logs
Check your server console for:
- `OTP sent successfully: {request_id}`
- Any error messages from Fast2SMS API

## Troubleshooting

### OTP Not Received
1. **Check Credits**: Ensure sufficient balance in Fast2SMS account
2. **Verify Mobile**: Must be valid 10-digit Indian number
3. **Check Logs**: Look for error messages in server console
4. **API Status**: Visit Fast2SMS dashboard for API status

### Common Errors

| Error | Solution |
|-------|----------|
| Invalid API Key | Check `FAST2SMS_API_KEY` in `.env.local` |
| Insufficient Credits | Recharge Fast2SMS account |
| Invalid Mobile Number | Must be 10 digits, Indian number |
| Rate Limit Exceeded | Wait 60 seconds between requests |

## Security Best Practices

✅ OTP expires in 10 minutes
✅ One-time use only
✅ Stored securely in memory
✅ 60-second resend cooldown
✅ Mobile number locked after verification
✅ No OTP in client-side logs

## Upgrade to DLT (Optional)

For higher delivery rates and branded sender ID:

1. Complete DLT registration (see previous guide)
2. Change route from `q` to `dlt`
3. Add sender_id, entity_id, template_id
4. Better for high-volume production use

## Support

- **Fast2SMS Support**: support@fast2sms.com
- **Dashboard**: https://www.fast2sms.com
- **API Docs**: https://docs.fast2sms.com

## Implementation Files

- **OTP Service**: `lib/fast2sms.js`
- **Send OTP API**: `app/api/user/kyc/send-otp/route.js`
- **Verify OTP API**: `app/api/user/kyc/verify-otp/route.js`
- **KYC Form**: `app/(user)/user/kyc/page.js`
- **Environment**: `.env.local`

---

**Status**: ✅ Production Ready
**Last Updated**: 2024
**Version**: 1.0.0
