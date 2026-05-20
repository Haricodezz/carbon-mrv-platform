export function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.ethereum;
}

export async function requestWalletAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error(
      'MetaMask is not installed. Please install and log into MetaMask first.'
    );
  }

  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[];

  if (!accounts?.length) {
    throw new Error('No wallet accounts available.');
  }

  return accounts;
}

export async function signWalletMessage(
  message: string,
  walletAddress: string
): Promise<string> {
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error('MetaMask is not installed.');
  }

  const signature = (await provider.request({
    method: 'personal_sign',
    params: [message, walletAddress],
  })) as string;

  if (!signature) {
    throw new Error('Wallet signature request was cancelled.');
  }

  return signature;
}
