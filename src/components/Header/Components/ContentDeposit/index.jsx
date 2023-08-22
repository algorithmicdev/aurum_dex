import React, { memo, useState, useEffect,useCallback, useRef } from 'react';
import { traderFunction } from '@contexts/walletContext';
import Button from '@components/Button';
import SelectCoin from '../SelectCoin';
import {
  Label,
  LabelNote,
  Title,
  TitleRow,
  ValueRow,
  WrapperButtonConfirm,
  WrapperContentDeposit,
  // WrapperContentRows,
  WrapperRow,
  WrapperTitle,
} from './ContentDeposit.style';
import { useWallet, WalletProvider } from '../../../../hooks/useWallet';


// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet as useWallet2, useAnchorWallet } from '@solana/wallet-adapter-react';
// require('@solana/wallet-adapter-react-ui/styles.css')


// import { useEffect, useState, useCallback } from 'react';
import { AnchorProvider as SolanaProvider } from "@project-serum/anchor";
// import { getBalance } from "../utils/helpers";
// import DepositModal from './DepositModal';
import { Connection, Keypair, VersionedTransaction,asLegacyTransaction , LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getBalance } from "../../../../utils/helpers";
import bs58 from 'bs58';



function ContentDeposit({ onClose }) {
  
  const connection = new Connection('https://attentive-crimson-research.solana-mainnet.discover.quiknode.pro/09dcd24d8a59f8998c8539b9c9ed519b7245c3d1/');
  const { cashBalance, USDBalance, dataPnL, setLoading,
    loading, connectWallet} = useWallet();
  const [value, setValue] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const { signTransaction, wallet} = useWallet2();
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
  const [dataWallet, setDataWallet] = useState({});

  const refTimeOut = useRef();
  useEffect(() => {
    const provider = localStorage.getItem('provider');
    if (provider === 'phantom' || provider === 'solflare') {
      refTimeOut.current = setTimeout(() => {
        setLoading(true);
      }, 2000);
    }
    setDataWallet(dataPnL);

    if (Object.keys(dataPnL).length) {
      setLoading(false);
      window.clearTimeout(refTimeOut.current);
    }

    const handleDisConnect = () => {
      setLoading(false);
    };
    window.addEventListener('disconnect', handleDisConnect);
    return () => {
      window.clearTimeout(refTimeOut.current);
      window.removeEventListener('disconnect', handleDisConnect);
    };
  }, [dataPnL]);
  // const publicKey = dataPnL?.walletPubkey;

  // const[amount,setAmount]=useState(0);

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

 
  const publicKey= dataWallet?.walletPubkey;
  // const publicKey = new PublicKey(publicKeyCheck);
 console.log(publicKey)

  // const handleConfirm = async () => {
  //   const balanceOfUSDC = await getBalance(
  //     connection,
  //     publicKey,
  //     false,
  //     new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
  //   );
  //   if (balanceOfUSDC >= Number(amount)) {
  //     if (!value || `${value}`.includes('e')) {
  //       return;
  //     }
  //     try {
  //       await traderFunction.deposit(value, () => {
  //         onClose();
  //         traderFunction.trader.updateVarianceCache();
  //       });
  //     } catch (error) {
  //       onClose();
  //     }
      
  //   } else {
  //     setShowModal(true);
  //   }
  // };



  const placePosition = useCallback(
    async (value) => {
      if (!publicKey) {
        console.error("Send Transaction: Wallet not connected!");
        return;
      }
  
      const provider = await getSolanaWalletProvider();
  
      let transactionId = "";
  
      try {
        const balanceOfUSDC = await getBalance(
          connection,
          new PublicKey(publicKey),
          false,
          new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
        );
  
        const amountOfUSDCToBuy = Number(value);
  
        if (amountOfUSDCToBuy > 0) {
          const routes = await getQuote(
            amountOfUSDCToBuy,
            selectedToken.address
          );
  
          const swapTransaction = await getSwapTransaction(
            routes,
            publicKey
          );
  
          console.log(swapTransaction);
  
          // deserialize the transaction
          const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
          var transaction =
            VersionedTransaction.deserialize(swapTransactionBuf);
// const req=new PublicKey(publicKey);
            // sign the transaction
transaction.sign([dataWallet.walletPubkey]);
const rawTransaction = transaction.serialize()
const txid = await connection.sendRawTransaction(rawTransaction, {
  skipPreflight: true,
  maxRetries: 2
});
transactionId = await connection.confirmTransaction(txid,'confirmed');

          // transactionId = await provider.sendAndConfirm(transaction);
        }
  
        if (transactionId) {
          console.log(`Transaction: https://solscan.io/tx/${txid}`);
  
          setTimeout(() => {
            console.log('2 seconds over!')
          }, 5000);
  
          const balanceOfUSDC = await getBalance(
            connection,
            new PublicKey(publicKey),
            false,
            new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
          );
          if (balanceOfUSDC >= Number(value)) {
            if (!value || `${value}`.includes('e')) {
              return;
            }
            try {
              await traderFunction.deposit(value, () => {
                // onClose();
                traderFunction.trader.updateVarianceCache();
              });
            } catch (error) {
              onClose();
            }
            
          } else {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error(`Transaction failed! ${error.message}`, transactionId);
        // setShowModal(false);
        return;
      }
    },
    [publicKey, connection, signTransaction]
  );

 
  return (
    <>

{showModal && (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'hidden', overflowY: 'auto', position: 'fixed', inset: 0, zIndex: 50, outline: 'none', focus: 'outline', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
  <div style={{ position: 'relative', width: '100%', marginTop: '6rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: '48rem' }}>
    <div style={{ border: 'none', borderRadius: '0.5rem', boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#14081f', outline: 'none', focus: 'outline' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem 0.5rem 0 0' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: 600, color: 'white' }}>Swap & Deposit from Any Token!</h3>
        <button style={{ padding: '0.25rem', marginLeft: 'auto', backgroundColor: 'transparent', border: 'none', color: 'black', fontSize: '1.5rem', lineHeight: 1, fontWeight: 600, outline: 'none', focus: 'outline' }}
        onClick={() => {
          setSearchTerm("");
          setSelectedToken(null);
          setShowModal(false);
        }}>
          <h3 style={{ backgroundColor: 'transparent', color: 'white', height: '1.5rem', width: '1.5rem', fontSize: '1rem', display: 'block', outline: 'none', focus: 'outline' }}>x</h3>
        </button>
      </div>
      <div style={{ position: 'relative', padding: '1.5rem', flex: 1 }}>
        <p style={{ marginBottom: '1rem', color: '#718096', fontSize: '2rem', lineHeight: 0.5 }}>You are depositing ${value}</p>
        <p style={{ marginBottom: '2rem', color: '#718096', fontSize: '2rem', lineHeight: 0.5 }}>Select a Token to swap with:</p>
        <div style={{ }}>
        {/* <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="w-full p-2 border text-slate-500 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                /> */}
                 <input type="text" placeholder="Search..." value={searchTerm} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #CBD5E0', color: '#718096', borderRadius: '0.25rem', boxShadow: '0 0 0 2px transparent', outline: 'none', focus: 'ring-2 focus:ring-blue-500', fontSize:'1.2rem' }} />
                 <div style={{ display: 'flex', justifyContent: 'center' }}>
          {filteredOptions.length > 0 && (
            <ul style={{ position: 'absolute',  width: '95%', marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #CBD5E0', borderRadius: '0.25rem', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',listStyleType: 'none',maxHeight: '300px',
            overflowY: 'auto',  }}>
              
              {filteredOptions.map((option) => (
                <li key={option.address} style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: '#718096', backgroundColor: 'white', transition: 'background-color 0.2s',fontSize: '1.2rem',  }}
                onClick={() => {
                          setSelectedToken(option);
                          setFilteredOptions([]);
                          setSearchTerm(option.symbol);
                        }}>
                  <img src={option.logoURI} style={{width:"20px", height:"20px", borderRadius:"10px", marginRight:"20px", marginTop:"10px"}}/>
                  {option.symbol}
                </li>
              ))}
              
            </ul>
          )}
          </div>
          {/* {filteredOptions.length > 0 && (
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
                )} */}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.5rem', borderTop: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '0 0 0.5rem 0.5rem' }}>
        {/* <button style={{ color: '#EF4444', backgroundColor: 'transparent', fontWeight: 600, textTransform: 'uppercase', padding: '0.375rem 1.5rem', fontSize: '0.875rem', outline: 'none', focus: 'outline', marginRight: '0.25rem', marginBottom: '0.25rem', transition: 'all 0.15s ease' }}
         onClick={() => {
          setSearchTerm("");
          setSelectedToken(null);
          setShowModal(false);
        }}>
          Close
        </button> */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
  <button style={{ 
    backgroundColor: '#10B981', 
    color: 'white', 
    fontWeight: 600, 
    textTransform: 'uppercase', 
    padding: '0.75rem 1.5rem', 
    fontSize: '1.2rem', 
    borderRadius: '0.25rem', 
    boxShadow: '0 2px 4px 0 rgba(16, 185, 129, 0.15)', 
    outline: 'none', 
    focus: 'outline', 
    marginRight: '0.25rem', 
    marginBottom: '0.25rem', 
    transition: 'all 0.15s ease', 
  }}
  onClick={() => placePosition(value)}
  >
    Continue
  </button>
</div>
      </div>
    </div>
  </div>
</div>
<div style={{ opacity: 0.25, position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'black' }}></div>
      </>
    )}
    {/* <DepositModal
        amount={value}
        // pariPubkey={pariPubkey}
        setShowModal={setShowModal}
        showModal={showModal}
        connection={connection}
        publicKey={publicKey}
      /> */}

    <WrapperContentDeposit>
      {/* <Label>
        Deposited assets automatically earn yield through lending.{' '}
        <a href="/" className="link-more">
          Learn more.
        </a>
      </Label> */}

      <WrapperTitle>
        <Title>Transfer type and Amount</Title>
        {/* <LabelNote>Deposit APR 1.3015% </LabelNote> */}
      </WrapperTitle>
      <SelectCoin value={value} handleOnChange={setValue} />

      <WrapperRow>
        <TitleRow>Wallet Balance</TitleRow>
        <ValueRow>{(USDBalance * 1).toFixed(2)} USDC</ValueRow>
      </WrapperRow>
      {/* <WrapperRow>
          <TitleRow>Global USDC Deposits / Max</TitleRow>
          <ValueRow>2.12M / 10.0M</ValueRow>
        </WrapperRow> */}

      {/* <WrapperRow>
        <TitleRow>Cash balance</TitleRow>
        <ValueRow>{(cashBalance * 1).toFixed(2)} USDC</ValueRow>
      </WrapperRow> */}
      {/* <WrapperRow>
        <TitleRow>Net Account Balance (USD)</TitleRow>
        <ValueRow>$0.00</ValueRow>
      </WrapperRow> */}

      <WrapperButtonConfirm>
        <Button className={'button-confirm'} onClick={() => setShowModal(true)}>
          Confirm
        </Button>
      </WrapperButtonConfirm>
    </WrapperContentDeposit>
    </>
  );
}

export default memo(ContentDeposit);
