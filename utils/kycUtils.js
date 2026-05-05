import KYC from '@/models/KYC';

export async function checkKYCStatus(userId) {
  const kyc = await KYC.findOne({ userId });
  
  if (!kyc) {
    return { hasKYC: false, status: null, approved: false };
  }
  
  return {
    hasKYC: true,
    status: kyc.status,
    approved: kyc.status === 'approved'
  };
}
