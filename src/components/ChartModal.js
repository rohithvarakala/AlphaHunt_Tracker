import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import TradingViewChart from './TradingViewChart';

const ChartModal = ({ symbol, stockName, onClose }) => {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="m-2 sm:m-4 flex-1 bg-gray-900 border border-gray-700 rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">{symbol.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{symbol}</h2>
              {stockName && (
                <p className="text-gray-500 text-sm">{stockName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0">
          <TradingViewChart symbol={symbol} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChartModal;
