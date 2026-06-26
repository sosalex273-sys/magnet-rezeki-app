import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Globe, Search, ArrowUpRight } from 'lucide-react';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState([]);
  const [usdRate, setUsdRate] = useState(16350); // Fallback rate
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // 1. Ambil kurs USD/IDR (Menggunakan USDT sebagai proksi atau data simple price)
      const rateResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=idr');
      const rateData = await rateResponse.json();
      if (rateData.tether && rateData.tether.idr) {
        setUsdRate(rateData.tether.idr);
      }

      // 2. Ambil data pasar top 50 koin
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setMarketData(data);
        setLastUpdate(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = marketData.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase()) || 
    item.symbol.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="card bg-white border-gray-200 dark:bg-dark-900/70 dark:border-white/10 p-0 overflow-hidden flex flex-col h-[600px]">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center relative">
              <Globe className="w-6 h-6 text-primary-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-900 animate-ping"></div>
            </div>
            <div>
              <h4 className="font-bold text-dark-900 dark:text-white">Pasar Global (Top 50)</h4>
              <p className="text-[10px] text-dark-500 dark:text-white/40 font-medium uppercase tracking-widest">Live Updates</p>
            </div>
          </div>
          <button 
            onClick={fetchMarketData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-dark-700 dark:text-white/70 hover:shadow-soft transition-all active:scale-95"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input 
            type="text" 
            placeholder="Cari aset (BTC, ETH, dll)..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-950/50 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Asset List Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {loading && marketData.length === 0 ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredData.map((asset) => (
              <div 
                key={asset.id} 
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={asset.image} 
                      alt={asset.name} 
                      className="w-10 h-10 rounded-full shadow-soft-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Dot Indikator yang "Hidup" */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-900 shadow-lg animate-pulse ${
                      asset.price_change_percentage_24h >= 0 
                        ? 'bg-emerald-500 shadow-emerald-500/50' 
                        : 'bg-rose-500 shadow-rose-500/50'
                    }`}></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-dark-900 dark:text-white">{asset.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-dark-500 dark:text-white/50 font-bold uppercase">{asset.symbol}</span>
                    </div>
                    <p className="text-[10px] text-dark-500 dark:text-white/40 font-medium">Rank #{asset.market_cap_rank}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-black text-dark-900 dark:text-white leading-tight">
                    Rp {asset.current_price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-dark-500 dark:text-white/50 font-bold mb-1">
                    $ {(asset.current_price / usdRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center justify-end gap-1 text-[11px] font-bold ${asset.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {asset.price_change_percentage_24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Status */}
      <div className="p-4 bg-gray-50 dark:bg-white/5 flex items-center justify-between text-[10px] border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-dark-500 dark:text-white/40">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Sistem Online
        </div>
        <p className="text-dark-400 dark:text-white/20 italic">Update terakhir: {lastUpdate || '...'}</p>
      </div>
    </div>
  );
};

export default MarketOverview;
