/* eslint-disable no-irregular-whitespace */
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import IconLoading from '@components/IconLoading';
import Draggable from 'react-draggable';
import {RxDragHandleHorizontal} from 'react-icons/rx'

let tvScriptLoadingPromise;
const ChartView = ({ productSelect }) => {
  const containerId = useRef(
    `tv_container_${Math.random().toString(36).substring(7)}`
  );

  const handleReturnCoin = (product) => {
    if (!product) {
      return 'BTCUSD';
    }
    if (`${product}`.toLowerCase().includes('eth')) {
      return 'ETHUSD';
    }
    if (`${product}`.toLowerCase().includes('sol')) {
      return 'SOLUSD';
    }
    return 'BTCUSD';
  };

  const disabledFeatures = [
    'use_localstorage_for_settings',
    // "timeframes_toolbar",
    // "left_toolbar", // left sidebar
    'header_undo_redo', // ​​undo, redo button
    'header_fullscreen_button', // ​​full screen button
    // 'header_chart_type', // chart type button
    // "header_screenshot", // screenshot button
    // "header_symbol_search", // ​​head search button
    'header_compare', // ​​compare button
    // "header_indicators", // ​​display indicator button
    // "header_saveload", // ​​save, load button
    'header_settings', // setting button
    // 'header_widget_dom_node', // top toolbar
    // 'border_around_the_chart', // border surround
    'countdown', // countdown
    // "compare_symbol",
    'symbol_info', // ​​product information
    // "main_series_scale_menu",
    // "study_dialog_search_control",
    'control_bar', // ​​associated with the navigation button at the bottom of the chart
    // 'hide_left_toolbar_by_default', // ​​hide the left toolbar when the user opens the chart for the first time
    'go_to_date', // ​​lower left date range
    // "edit_buttons_in_legend",
  ];

  const defaultConfig = {
    theme: 'Dark',
    colorTheme: '#00000',
    debug: true,
    autosize: true,
    disabled_features: disabledFeatures,
    hidevolume: true,
    locale: 'en',
    enabled_features: ['hide_left_toolbar_by_default'],
    time_frames: [
      { text: '1m', resolution: '1', description: '1 Minute' },
      { text: '5m', resolution: '5', description: '5 Minutes' },
    ],
    toolbar_bg: '#000000',
  };

  const onLoadScriptRef = useRef();
  const tradingViewWidget = useRef();

  function removeWidget() {
    try {
      tradingViewWidget.current?.remove();
    } catch (e) {
      console.log(e);
    }
  }

  function createWidget() {
    if (
      document.getElementById(containerId.current) &&
      'TradingView' in window
    ) {
      removeWidget();
      tradingViewWidget.current = new window.TradingView.widget({
        ...defaultConfig,
        studies_overrides: {
          'Overlay.candleStyle.upColor': '#00fa53',
          'Overlay.candleStyle.downColor': 'rgb(255, 0, 221)',
          'Overlay.candleStyle.barColorsOnPrevClose': true,
        },
        overrides: {
          'mainSeriesProperties.candleStyle.upColor': '#00fa53',
          'mainSeriesProperties.candleStyle.downColor': '#f81717',
          'mainSeriesProperties.candleStyle.borderColor': '#378658',
          'mainSeriesProperties.candleStyle.borderUpColor': '#00fa53',
          'mainSeriesProperties.candleStyle.borderDownColor': '#f81717',
          'mainSeriesProperties.candleStyle.wickUpColor': '#00fa53',
          'mainSeriesProperties.candleStyle.wickDownColor': '#f81717',
          'mainSeriesProperties.candleStyle.barColorsOnPrevClose': true,

          'paneProperties.vertGridProperties.color': '#262c2e',
          'paneProperties.horzGridProperties.color': '#262c2e',
          // 'scalesProperties.lineColor': '#262c2e',
        },
        symbol: `PYTH:${handleReturnCoin(productSelect)}`,
        interval: '1',
        container_id: containerId.current,
        backgroundColor: '#14081f',
      });
    }
  }

  useEffect(() => {
    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    tvScriptLoadingPromise.then(createWidget);
    return () => {
      onLoadScriptRef.current = null;
      removeWidget();
    };
  }, []);

  useEffect(createWidget, [productSelect]);

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
    <WrapperChart style={{resize:'both', overflow:'auto'}}>
      <Chart >
      <RxDragHandleHorizontal className='handle ' color='white' size={24} style={{ background:"gray", borderRadius:"5px", right:"50",top:"6",position:'fixed', zIndex:'10', cursor:'grab'}} />
        <div id={containerId.current} className="tradingview"></div>
        <IconLoading className="icon-loading-chart" isWhite />
      </Chart>
    </WrapperChart>
    </Draggable>
  );
};

export default ChartView;

const WrapperChart = styled.div`
  width: 71.5%;
  min-width: 706px;
  height: 100%;
  border: 1px solid #262c2e;
  position: relative;
  overflow: hidden;
  border-radius:10px;
  margin:2px;
  

  article {
    z-index: 2;
  }
`;

const Chart = styled.div`
  position: absolute;
  width: calc(100%);
  height: calc(100%);
  top: 0px;
  left: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000000;

  .icon-loading-chart {
    position: absolute;
    z-index: 1;
    width: 60px;
    height: 60px;
    margin: auto;
  }
  .tradingview {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
  }
`;
