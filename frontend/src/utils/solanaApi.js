import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
export async function fetchSolanaTokenData(tokenAddress) {
  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const pubKey = new PublicKey(tokenAddress);
    const balance = await connection.getBalance(pubKey);
    return { balance: balance / LAMPORTS_PER_SOL };
  } catch (error) {
    console.error('Solana API Error:', error);
    throw error;
  }
}
