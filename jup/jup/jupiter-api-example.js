import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

const connection = new Connection('https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));


// 4. Retrieve the route map
// Retrieve the `indexed-route-map`
const indexedRouteMap = await (await fetch('https://quote-api.jup.ag/v6/indexed-route-map')).json();
const getMint = (index) => indexedRouteMap["mintKeys"][index];
const getIndex = (mint) => indexedRouteMap["mintKeys"].indexOf(mint);

// Generate the route map by replacing indexes with mint addresses
var generatedRouteMap = {};
Object.keys(indexedRouteMap['indexedRouteMap']).forEach((key, index) => {
  generatedRouteMap[getMint(key)] = indexedRouteMap["indexedRouteMap"][key].map((index) => getMint(index))
});

// List all possible input tokens by mint address
const allInputMints = Object.keys(generatedRouteMap);

// List all possition output tokens that can be swapped from the mint address for SOL.
// SOL -> X
const swappableOutputForSOL = generatedRouteMap['So11111111111111111111111111111111111111112'];
// console.log({ allInputMints, swappableOutputForSOL })


// 5. Get the route for a swap
// Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
const { data } = await (
    await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
  &outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
  &amount=100000000\
  &slippageBps=50'
    )
  ).json();
  const quoteResponse = data;
  // console.log(quoteResponse)



//   6. Get the serialized transactions to perform the swap
  // get serialized transactions for the swap
const transaction = await (
    await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // quoteResponse from /quote api
        quoteResponse,
        // user public key to be used for the swap
        userPublicKey: wallet.publicKey.toString(),
        // auto wrap and unwrap SOL. default is true
        wrapUnwrapSOL: true,
        // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
        // feeAccount: "fee_account_public_key"
      })
    })
  ).json();
  
  const { swapTransaction } = transaction;


//   7. Deserialize and sign the transaction
  // deserialize the transaction
const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
var transaction1 = VersionedTransaction.deserialize(swapTransactionBuf);
console.log(transaction);

// sign the transaction
transaction1.sign([wallet.payer]);


// 8. Execute the transaction
// Execute the transaction
const rawTransaction = transaction.serialize()
const txid = await connection.sendRawTransaction(rawTransaction, {
  skipPreflight: true,
  maxRetries: 2
});
await connection.confirmTransaction(txid);
console.log(`https://solscan.io/tx/${txid}`);