import FingerprintJS from "@fingerprintjs/fingerprintjs";

/**
 * Generate a unique device fingerprint
 */
export async function getDeviceFingerprint(): Promise<string> {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

/**
 * Get user agent string
 */
export function getUserAgent(): string {
  return navigator.userAgent;
}

/**
 * Get client IP address (using external service)
 */
export async function getIPAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to get IP address:", error);
    return "unknown";
  }
}

/**
 * Get complete device information
 */
export async function getDeviceInfo() {
  const [fingerprint, ipAddress] = await Promise.all([
    getDeviceFingerprint(),
    getIPAddress(),
  ]);

  return {
    fingerprint,
    ipAddress,
    userAgent: getUserAgent(),
  };
}
