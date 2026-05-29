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
  CONTRACT_ADDRESS: '0x8FEB092b7303c9419d8525C99a3113E7c299C584',
  CONTRACT_NETWORK: 'megaeth_testnet',
  CONTRACT_CHAIN_ID: 6343,
  CONTRACT_RPC_URL: 'https://carrot.megaeth.com/rpc',
  CONTRACT_EXPLORER: 'https://megaeth-testnet-v2.blockscout.com',

  // Where users are sent after successful auth
  POST_AUTH_REDIRECT: 'dashboard.html',

  //Wallet Connect
  WALLETCONNECT_PROJECT_ID: '0e3055deec7af463ce29d476c2ba634d',
  // Where users are sent if they visit a protected page without auth
  LOGIN_REDIRECT: 'auth.html'
};
