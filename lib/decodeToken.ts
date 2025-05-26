export async function decodeToken(token: string): Promise<{ userId: string } | null> {
  try {
    // Force dynamic import and safely cast the result to a callable function
    const jwt_decode = (await import('jwt-decode')).default as unknown as (token: string) => any;
    const decoded = jwt_decode(token);

    return {
      userId: decoded.userId,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}
