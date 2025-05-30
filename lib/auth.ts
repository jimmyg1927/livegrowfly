// ✅ Existing token method
export async function getToken(userId: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      console.error('Failed to fetch token:', res.status);
      return null;
    }

    const data = await res.json();
    return data.token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}

// ✅ Admin email whitelist
export const ADMIN_EMAILS = ['teddy@growfly.io', 'jimmy@growfly.io']

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
