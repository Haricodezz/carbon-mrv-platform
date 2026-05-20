'use client';

import dynamic from 'next/dynamic';

const WalletProvider = dynamic(
  () => import('./WalletProvider'),
  {
    ssr: false,
    loading: () => null,
  }
);

import { AuthProvider } from './AuthProvider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AuthProvider>
  );
}