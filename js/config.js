/**
 * TruthStamp configuration
 *
 * Edit this file to point to your Supabase project + deployed contract.
 *
 * IMPORTANT: This file is loaded by every page. The values here become
 * publicly visible in the browser. That's OK — the Supabase anon key is
 * meant to be public (RLS protects your data). NEVER put service_role
 * keys, contract owner private keys, or any other secret here.
 */

window.TRUTHSTAMP_CONFIG = {
  // Supabase project URL — find at: Supabase Dashboard → Settings → API
  SUPABASE_URL: 'https://stlfgfaaukrgiwwkwceb.supabase.co',

  // Supabase anon (publishable) key — safe to expose publicly
  SUPABASE_ANON_KEY: 'sb_publishable_oH-0vSs8t4ghRuRJ-LcCaA_sHikte9b',

  // TruthStamp smart contract — deployed on MegaETH testnet
  CONTRACT_ADDRESS: '0xD8beDEa4DdaCBF681CCca5DBFa90b04bB654d0B7',
  CONTRACT_NETWORK: 'megaeth',
  CONTRACT_CHAIN_ID: 4326,
  CONTRACT_RPC_URL: 'https://mainnet.megaeth.com/rpc',
  CONTRACT_EXPLORER: 'https://mega.etherscan.io/',

  // Where users are sent after successful auth
  POST_AUTH_REDIRECT: 'dashboard.html',

  //Wallet Connect
  WALLETCONNECT_PROJECT_ID: '0e3055deec7af463ce29d476c2ba634d',
  // Where users are sent if they visit a protected page without auth
  LOGIN_REDIRECT: 'auth.html'
};
