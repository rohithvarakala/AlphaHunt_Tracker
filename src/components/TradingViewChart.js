import React, { useEffect, useRef, memo } from 'react';

const TradingViewChart = memo(({ symbol }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const containerId = `tradingview_${Date.now()}`;
    const widgetDiv = document.createElement('div');
    widgetDiv.id = containerId;
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    containerRef.current.appendChild(widgetDiv);

    const createWidget = () => {
      if (!containerRef.current) return;
      try {
        widgetRef.current = new window.TradingView.widget({
          symbol: symbol,
          theme: 'dark',
          style: '1',
          interval: 'D',
          timezone: 'America/New_York',
          locale: 'en',
          autosize: true,
          toolbar_bg: '#111827',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
          studies: ['Volume@tv-basicstudies'],
          withdateranges: true,
          hide_volume: false,
          save_image: false,
        });
      } catch (err) {
        console.error('TradingView widget error:', err);
      }
    };

    if (window.TradingView) {
      createWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    }

    return () => {
      widgetRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
});

TradingViewChart.displayName = 'TradingViewChart';

export default TradingViewChart;
