// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate OTP expiration time (default: 5 minutes)
export function getOTPExpiration(minutes: number = 5): Date {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + minutes);
  return expiration;
}

// Format phone number to international format (Ghana: +233)
export function formatPhoneNumber(phoneNumber: string): string {
  let formatted = phoneNumber.replace(/\s/g, '').replace(/-/g, '');
  
  if (formatted.startsWith("0")) {
    formatted = "233" + formatted.substring(1);
  } else if (!formatted.startsWith("233")) {
    formatted = "233" + formatted;
  }
  
  return formatted;
}
