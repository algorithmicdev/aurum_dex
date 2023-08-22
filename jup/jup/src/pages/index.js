import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

import { Connection, Keypair, VersionedTransaction,asLegacyTransaction , LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import fetch from 'cross-fetch';
// import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorWallet,useWallet } from '@solana/wallet-adapter-react';
require('@solana/wallet-adapter-react-ui/styles.css')


import { useEffect, useState, useCallback } from 'react';
import { AnchorProvider as SolanaProvider } from "@project-serum/anchor";
import { getBalance } from "../utils/helpers";
export default function Home() {

  const connection = new Connection('https://attentive-crimson-research.solana-mainnet.discover.quiknode.pro/09dcd24d8a59f8998c8539b9c9ed519b7245c3d1/');

  const {publicKey, wallet, signTransaction} = useWallet();
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const [swappableTokenList, setSwappableTokenList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToken, setSelectedToken] = useState({
    address: '',
    chainId: 0,
    decimals: 0,
    logoURI: '',
    name: '',
    symbol: ''
  });
  const [filteredOptions, setFilteredOptions] = useState([]);

  const[amount,setAmount]=useState(0);

  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    const filtered = swappableTokenList.filter((option) =>
      option.name.toLowerCase().includes(newSearchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  };
// useEffect(() => 
// {
//   const fetchData = async () => {
  const anchorWallet = useAnchorWallet();
  const getSolanaWalletProvider = async () => {
    if (!anchorWallet) {
      return null;
    }

    const provider = new SolanaProvider(connection, anchorWallet, {
      skipPreflight: true,
    });

    return provider;
  };

// // 4. Retrieve the route map
// // Retrieve the `indexed-route-map`
// const indexedRouteMap = await (await fetch('https://quote-api.jup.ag/v6/indexed-route-map')).json();
// const getMint = (index) => indexedRouteMap["mintKeys"][index];
// const getIndex = (mint) => indexedRouteMap["mintKeys"].indexOf(mint);

// // Generate the route map by replacing indexes with mint addresses
// var generatedRouteMap = {};
// Object.keys(indexedRouteMap['indexedRouteMap']).forEach((key, index) => {
//   generatedRouteMap[getMint(key)] = indexedRouteMap["indexedRouteMap"][key].map((index) => getMint(index))
// });

// // List all possible input tokens by mint address
// const allInputMints = Object.keys(generatedRouteMap);

// // List all possition output tokens that can be swapped from the mint address for SOL.
// // SOL -> X
// const swappableOutputForSOL = generatedRouteMap['So11111111111111111111111111111111111111112'];
// // console.log({ allInputMints, swappableOutputForSOL })
useEffect(() => {
  (async () => {
    //fetch token list,
    const tokenList = await fetch("https://token.jup.ag/strict").then(
      (response) => response.json()
    );

    // retrieve indexed routed map
    const indexedRouteMap = await (
      await fetch("https://quote-api.jup.ag/v4/indexed-route-map")
    ).json();

    const getMint = (index) => indexedRouteMap["mintKeys"][index];

    // generate route map by replacing indexes with mint addresses
    var generatedRouteMap = {};
    Object.keys(indexedRouteMap["indexedRouteMap"]).forEach((key, index) => {
      generatedRouteMap[getMint(key)] = indexedRouteMap["indexedRouteMap"][
        key
      ].map((index) => getMint(index));
    });

    const swappableOutputForUSDC = generatedRouteMap[USDC_MINT];
    const getIndexInUSDCSwappableOutput = (mint) =>
      swappableOutputForUSDC.indexOf(mint);

    tokenList.filter(
      (token) => getIndexInUSDCSwappableOutput(token.address) != -1
    );
    setSwappableTokenList(tokenList);
    // console.log(tokenList);
  })();
}, []);


// // 5. Get the route for a swap
// // Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
// const { data } = await (
//   await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\
// &outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
// &amount=${0.001*LAMPORTS_PER_SOL}\
// &slippageBps=10`
//   )
// ).json();
// const quoteResponse = data;
// console.log(quoteResponse)
async function getQuote(amount, inputMint) {
    
  console.log((amount * 1e6));
  console.log(Math.ceil(amount * 1e6));
  
  const { data } = await (
    await fetch(
      `https://quote-api.jup.ag/v4/quote?inputMint=${inputMint}&outputMint=${USDC_MINT}&amount=${
        (amount * 1e6)
      }&slippageBps=10&swapMode=ExactOut`
    )
  ).json();
  return data;
}


// //   6. Get the serialized transactions to perform the swap
//   // get serialized transactions for the swap
//   const transaction = await (
//     await fetch('https://quote-api.jup.ag/v6/swap', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         // quoteResponse from /quote api
//         quoteResponse,
//         // user public key to be used for the swap
//         userPublicKey: publicKey?.toString(),
//         // auto wrap and unwrap SOL. default is true
//         wrapUnwrapSOL: true,
//         // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
//         // feeAccount: "fee_account_public_key"
//       })
//     })
//   ).json();
  
//   const { swapTransaction } = transaction;
async function getSwapTransaction(routes, wallet) {
  // get serialized transactions for the swap
  const transactions = await (
    await fetch("https://quote-api.jup.ag/v4/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // route from /quote api
        route: routes[0],
        // user public key to be used for the swap
        userPublicKey: wallet,
        // auto wrap and unwrap SOL. default is true
        wrapUnwrapSOL: true,
        // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
        // This is the ATA account for the output token where the fee will be sent to. If you are swapping from SOL->USDC then this would be the USDC ATA you want to collect the fee.
        // feeAccount: "fee_account_public_key"
      }),
    })
  ).json();

  const { swapTransaction } = transactions;

  return swapTransaction;
}


//   //   7. Deserialize and sign the transaction
//   // deserialize the transaction
// const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
// var transaction1 = asLegacyTransaction.deserialize(swapTransactionBuf);
// console.log(transaction);

// // sign the transaction
// transaction1.sign([wallet.payer]);
const placePosition = useCallback(
  async (amount) => {
    if (!publicKey) {
      console.error("Send Transaction: Wallet not connected!");
      return;
    }

    const provider = await getSolanaWalletProvider();

    let transactionId = "";

    try {
      const balanceOfUSDC = await getBalance(
        connection,
        publicKey,
        false,
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
      );

      const amountOfUSDCToBuy = Number(amount);

      if (amountOfUSDCToBuy > 0) {
        const routes = await getQuote(
          amountOfUSDCToBuy,
          selectedToken.address
        );

        const swapTransaction = await getSwapTransaction(
          routes,
          publicKey.toBase58()
        );

        console.log(swapTransaction);

        // deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        var transaction =
          VersionedTransaction.deserialize(swapTransactionBuf);

        // get address lookup table accounts
        // const addressLookupTableAccounts = await Promise.all(
        //   transaction.message.addressTableLookups.map(async (lookup) => {
        //     return new AddressLookupTableAccount({
        //       key: lookup.accountKey,
        //       state: AddressLookupTableAccount.deserialize(
        //         await connection
        //           .getAccountInfo(lookup.accountKey)
        //           .then((res) => {
        //             return res.data;
        //           })
        //       ),
        //     });
        //   })
        // );
        // // decompile transaction message and add transfer instruction
        // var message = TransactionMessage.decompile(transaction.message, {
        //   addressLookupTableAccounts: addressLookupTableAccounts,
        // });

        // let placePositionIx =
        //   await parimutuelWeb3.getPlacePositionInstruction(
        //     wallet as WalletSigner,
        //     new PublicKey(pariPubkey),
        //     parseFloat(amount) * 1e6,
        //     side,
        //     Date.now()
        //   );
        // message.instructions.push(...placePositionIx);

        // compile the message and update the transaction
        // transaction.message = message.compileToV0Message(
        //   addressLookupTableAccounts
        // );

        // sign the transaction
        transactionId = await provider.sendAndConfirm(transaction);
      }

      if (transactionId) {
        console.log(`Transaction: https://solscan.io/tx/${transactionId}`);
        // notify({
        //   type: "success",
        //   message: `Placed ${
        //     side === PositionSideEnum.LONG ? "LONG" : "SHORT"
        //   } Position`,
        //   txid: transactionId,
        // });
      }
    } catch (error) {
      console.error(`Transaction failed! ${error.message}`, transactionId);
      // setShowModal(false);
      return;
    }
  },
  [publicKey, connection, signTransaction]
);



// // 8. Execute the transaction
// // Execute the transaction
// const rawTransaction = transaction.serialize()
// const txid = await connection.sendRawTransaction(rawTransaction, {
//   skipPreflight: true,
//   maxRetries: 2
// });
// await connection.confirmTransaction(txid);
// console.log(`https://solscan.io/tx/${txid}`);
//   }

// fetchData();
// }, []); 



  return (
   <>
   <h1>
    
   SWAP TOKENS
   </h1>
       <WalletMultiButton/>
       <div className=" justify-center items-center flex overflow-x-hidden overflow-y-auto fixed z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-3xl">
          {/*content*/}
          <div className=" border-0 rounded-lg shadow-lg relative flex flex-col  bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
              <h3 className="text-3xl font-semibold text-black">
                Make payment
              </h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black bg-white  float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedToken(null);
                  setShowModal(false);
                }}
              >
                <h3 className="bg-transparent text-black  h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </h3>
              </button>
            </div>
            <input
  type="text"
  placeholder="Enter amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="w-full p-2 border text-slate-500 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
            {/*body*/}
            <div className="relative p-6 flex-auto">
              <p className="my-4 text-slate-500 text-lg leading-relaxed">
                {/* {side === PositionSideEnum.LONG ? "LONG" : "SHORT"}*/} {amount}{" "} 
                USDC?
              </p>
              <p className="my-4 text-slate-500 text-lg leading-relaxed">
                Make payment with
              </p>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-slate-500 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filteredOptions.length > 0 && (
                  <ul className="absolute left-0 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-md">
                    {filteredOptions.map((option) => (
                      <li
                        key={option.address}
                        className="px-4 py-2 cursor-pointer text-slate-500 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedToken(option);
                          setFilteredOptions([]);
                          setSearchTerm(option.symbol);
                        }}
                      >
                        {option.symbol}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedToken(null);
                  setShowModal(false);
                }}
              >
                Close
              </button>
              <button
                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => placePosition(amount)}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="opacity-25 fixed inset-0 z-40 bg-black"></div> */}
   </>
  )
}
