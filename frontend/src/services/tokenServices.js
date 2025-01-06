import { TokenListProvider } from '@solana/spl-token-registry';

export const fetchTokenList = async (network = 'mainnet-beta') => {
  try {
    const tokens = await new TokenListProvider().resolve();
    
    const networkMap = {
      'mainnet': 'mainnet-beta',
      'devnet': 'devnet',
      'testnet': 'testnet'
    };
    const tokenList = tokens.filterByClusterSlug(networkMap[network] || 'mainnet-beta').getList();
    return tokenList.map(token => ({
      symbol: `${token.symbol}/USDC`,
      name: token.name, 
      address: token.address,
      logoURI: token.logoURI,
      network
    }));
  } catch (error) {
    console.error(`Error fetching ${network} token list:`, error);
    return [];
  }
};

export const fetchAllNetworkTokens = async () => {
  try {
    const networks = ['mainnet', 'devnet', 'testnet'];
    const allTokens = await Promise.all(
      networks.map(network => fetchTokenList(network))
    );
    return allTokens.flat();
  } catch (error) {
    console.error('Error fetching all network tokens:', error);
    return [];
  }
};