import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { getMarKet } from '../../../../axios/getMarket';
import { useWallet } from '@hooks/useWallet';
import IconLoading from '@components/IconLoading';
import ContentMarket from './Components/ContentMarket';
import { WrapperContentMarket, WrapperLoading } from './Market.style';
import { Label } from '../Orders/Components/ContentOrder/ContentOrder.style';
import Draggable from 'react-draggable';
import {RxDragHandleHorizontal} from 'react-icons/rx'
function Market() {
  const { productSelect, dataPnL, accountSelect } = useWallet();
  const refTimeout = useRef(null);
  const [dataMarket, setDataMarket] = useState([]);
  const [loading, setLoading] = useState(false);

  const refInterVal = useRef();

  useEffect(() => {
    if (refTimeout.current) {
      window.clearTimeout(refTimeout.current);
    }
    refTimeout.current = setTimeout(() => {
      refTimeout.current = null;
      getMarKet(productSelect)
        .then((res) => {
          if (res?.status !== 200) {
            throw res;
          }
          const data = res?.data?.fills;
          setDataMarket(data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }, 1000);

    if (!dataPnL?.walletAddress) {
      refInterVal.current = setInterval(() => {
        getMarKet(productSelect)
          .then((res) => {
            if (res?.status !== 200) {
              throw res;
            }
            const data = res?.data?.fills;
            setDataMarket(data || []);
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }, 5000);
    } else {
      window.clearInterval(refInterVal.current);
    }
    return () => {
      window.clearInterval(refInterVal.current);
    };
  }, [productSelect, dataPnL]);

  useEffect(() => {
    setLoading(true);
    setDataMarket([]);
  }, [productSelect]);

  const renderContentMarket = useMemo(() => {
    return (
      <ContentMarket
        dataMarket={dataMarket}
        accountSelect={accountSelect}
        productSelect={productSelect}
      />
    );
  }, [JSON.stringify(dataMarket), accountSelect, productSelect]);

  return (
    <Draggable
        // allowAnyClick='true'
        axis="both"
        handle=".handle"
        defaultPosition={{ x: 0, y: 0 }}
        position={null}
        grid={[25, 25]}
        scale={1}
        
      >
    <WrapperContentMarket style={{resize:'both', overflow:'auto'}}>
      <Label>Market Trades <RxDragHandleHorizontal className='handle' color='white' size={24} style={{ background:"gray", borderRadius:"5px", right:"4",position:"fixed", cursor:'grab'}} /></Label>
      {renderContentMarket}
      {loading && (
        <WrapperLoading>
          <IconLoading isWhite />
        </WrapperLoading>
      )}
    </WrapperContentMarket>
    </Draggable>
  );
}

export default memo(Market);
