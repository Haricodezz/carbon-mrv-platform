'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletButton() {
  return (
    <ConnectButton
      accountStatus="address"
      chainStatus="icon"
      showBalance={false}
    />
  );
}