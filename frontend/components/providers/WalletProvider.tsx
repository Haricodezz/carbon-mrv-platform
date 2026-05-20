'use client';

import '@rainbow-me/rainbowkit/styles.css';

import {
  RainbowKitProvider,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';

import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

import {
  createConfig,
  WagmiProvider,
  http,
} from 'wagmi';

import { polygon } from 'wagmi/chains';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { useEffect, useState, useMemo } from 'react';

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useMemo(
    () => new QueryClient(),
    []
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = useMemo(() => {

    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [
            metaMaskWallet,
            walletConnectWallet,
            coinbaseWallet,
          ],
        },
      ],
      {
        appName: 'Carbon MRV Platform',
        projectId: 'e12e556d543500c48235000807848a00',
      }
    );

    return createConfig({
      chains: [polygon],
      connectors,
      transports: {
        [polygon.id]: http(),
      },
      ssr: false,
    });
  }, []);

  if (!mounted || !config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}