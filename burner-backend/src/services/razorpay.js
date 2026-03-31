/**
 * Razorpay signature verification (HMAC-SHA256)
 * Runs entirely in Cloudflare's Web Crypto API – no Node.js required.
 */

export async function verifyRazorpaySignature(orderId, paymentId, signature, keySecret) {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const expectedHex = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedHex === signature;
}
