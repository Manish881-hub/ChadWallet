import { PrivyClient, type LinkedAccount } from '@privy-io/node';

type PrivyServerConfig = {
  appId: string;
  appSecret: string;
  jwtVerificationKey?: string;
};

type AuthorizationResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; title: string; detail: string };

let cachedClient: PrivyClient | null = null;

export function getPrivyServerConfig(): PrivyServerConfig | null {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET ?? process.env.PRIVY_API_SECRET;
  const jwtVerificationKey = process.env.PRIVY_JWT_VERIFICATION_KEY ?? process.env.PRIVY_VERIFICATION_KEY;

  if (!appId || !appSecret) return null;
  return { appId, appSecret, jwtVerificationKey };
}

export function isPrivyServerConfigured(): boolean {
  return getPrivyServerConfig() !== null;
}

function createPrivyServerClient(): PrivyClient {
  const config = getPrivyServerConfig();
  if (!config) {
    throw new Error('Privy server auth is not configured. Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET.');
  }

  cachedClient ??= new PrivyClient({
    appId: config.appId,
    appSecret: config.appSecret,
    jwtVerificationKey: config.jwtVerificationKey,
  });

  return cachedClient;
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  const [scheme, token] = authorization?.split(' ') ?? [];
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function sameWalletAddress(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();

  if (left.startsWith('0x') && right.startsWith('0x')) {
    return left.toLowerCase() === right.toLowerCase();
  }

  return left === right;
}

function accountMatchesWallet(account: LinkedAccount, walletAddress: string): boolean {
  if ('address' in account && typeof account.address === 'string') {
    return sameWalletAddress(account.address, walletAddress);
  }

  if (account.type === 'cross_app') {
    return [...account.embedded_wallets, ...account.smart_wallets].some(wallet =>
      sameWalletAddress(wallet.address, walletAddress),
    );
  }

  return false;
}

export async function requirePrivyWallet(request: Request, walletAddress: string): Promise<AuthorizationResult> {
  if (!isPrivyServerConfigured()) {
    return {
      ok: false,
      status: 503,
      title: 'Privy Server Auth Not Configured',
      detail: 'Set PRIVY_APP_SECRET in the server environment to enable secure profile updates.',
    };
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return {
      ok: false,
      status: 401,
      title: 'Unauthorized',
      detail: 'Profile updates require a Privy access token.',
    };
  }

  try {
    const privy = createPrivyServerClient();
    const claims = await privy.utils().auth().verifyAccessToken(accessToken);
    const user = await privy.users()._get(claims.user_id);
    const ownsWallet = user.linked_accounts.some(account => accountMatchesWallet(account, walletAddress));

    if (!ownsWallet) {
      return {
        ok: false,
        status: 403,
        title: 'Forbidden',
        detail: 'The authenticated Privy user does not own this wallet address.',
      };
    }

    return { ok: true, userId: claims.user_id };
  } catch (error) {
    console.warn('Privy profile authorization failed', error);
    return {
      ok: false,
      status: 401,
      title: 'Unauthorized',
      detail: 'The Privy access token could not be verified.',
    };
  }
}
