function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  privyAppId: required('NEXT_PUBLIC_PRIVY_APP_ID'),
  privyClientId: required('NEXT_PUBLIC_PRIVY_CLIENT_ID'),
  birdeyeApiKey: required('NEXT_PUBLIC_BIRDEYE_API_KEY'),
  alchemyRpc: required('NEXT_PUBLIC_ALCHEMY_RPC'),
  apiUrl: optional('NEXT_PUBLIC_API_URL', 'http://localhost:3001'),
  nodeEnv: optional('NODE_ENV', 'development'),
} as const;

export function isDev() { return env.nodeEnv === 'development'; }
export function isProd() { return env.nodeEnv === 'production'; }
