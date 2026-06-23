'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import OAuthCallbackHandler from './OAuthCallbackHandler';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
      config={{
        loginMethods: ['google'],
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <OAuthCallbackHandler />
      {children}
    </PrivyProvider>
  );
}