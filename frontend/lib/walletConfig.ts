'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai } from 'wagmi/chains';

export const walletConfig = getDefaultConfig({
  appName: 'Carbon MRV Platform',
  projectId: 'e12e556d543500c48235000807848a00',
  chains: [polygon, polygonMumbai],

  // IMPORTANT:
  // Default connectors trigger MetaMask SDK SSR issues.
  // Disable SSR fully.
  ssr: false,

  // REMOVE custom connectors completely for now
  // until stable deployment.
});