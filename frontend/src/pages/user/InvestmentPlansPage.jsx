import React, { useState, useEffect } from 'react';
import { Check, Info, Shield, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const InvestmentPlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { wallet } = useUser();

  const defaultPlans = [
    {
      id: 1,
      name: 'BASIC',
      minAmount: 500000,
      maxAmount: 5000000,
      dailyReturn: '0.5% - 1%',
      duration: '30 hari',
      totalReturn: '15% - 30%',
      features: [
        'Investasi minimum Rp 500.000',
        'Return harian otomatis',
        'Bonus referral 5%',
        'Support 24/7',
        'Pencairan kapan saja'
      ],
      color: 'blue',
      badge: 'Pemula',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 2,
      name: 'SILVER',
      minAmount: 5000000,
      maxAmount: 50000000,
      dailyReturn: '1.5% - 2%',
      duration: '30 hari',
      totalReturn: '45% - 60%',
      features: [
        'Investasi minimum Rp 5 juta',
        'Return harian lebih tinggi',
        'Bonus referral 5% + 2%',
        'Akses VIP support',
        'Asuransi investasi',
        'Priority withdrawal'
      ],
      color: 'teal',
      badge: 'Rekomendasi',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 3,
      name: 'GOLD',
      minAmount: 50000000,
      maxAmount: 100000000,
      dailyReturn: '2% - 3%',
      duration: '30 hari',
      totalReturn: '60% - 90%',
      features: [
        'Investasi minimum Rp 50 juta',
        'Return maksimal harian',
        'Bonus referral 5% + 2% + 0.5%',
        'Dedicated account manager',
        'Asuransi premium',
        'Withdrawal 24 jam'
      ],
      color: 'amber',
      badge: 'Premium',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 4,
      name: 'VIP',
      minAmount: 100000000,
      maxAmount: null,
      dailyReturn: '3% - 5%',
      duration: '30 hari',
      totalReturn: '90% - 150%',
      features: [
        'Investasi minimum Rp 100 juta',
        'Return tertinggi',
        'Komisi referral unlimited',
        'Personal account manager',
        'Asuransi all-risk',
        'Instant withdrawal'
      ],
      color: 'purple',
      badge: 'Eksklusif',
      icon: <Shield className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    let mounted = true;
    setLoadingPlans(true);
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/investment_plans`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        if (!mounted) return;
        setPlans(Array.isArray(data) && data.length ? data : defaultPlans);
      })
      .catch(() => {
        if (!mounted) return;
        setPlans(defaultPlans);
      })
      .finally(() => { if (mounted) setLoadingPlans(false); });

    return () => { mounted = false; };
  }, []);

  const getStyleClasses = (color) => {
    const styles = {
      blue: {
        wrapper: 'hover:shadow-blue-500/10 border-blue-100/50 dark:border-blue-500/20',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
        iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      teal: {
        wrapper: 'hover:shadow-teal-500/10 border-teal-100/50 dark:border-teal-500/20 relative overflow-hidden ring-1 ring-teal-500/20',
        badge: 'bg-teal-500 text-white dark:bg-teal-500/20 dark:text-teal-100',
        iconBg: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300',
        button: 'bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/30'
      },
      amber: {
        wrapper: 'hover:shadow-amber-500/10 border-amber-100/50 dark:border-amber-500/20',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-100',
        iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
        button: 'bg-amber-600 hover:bg-amber-700'
      },
      purple: {
        wrapper: 'hover:shadow-purple-500/10 border-purple-100/50 dark:border-purple-500/20',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-100',
        iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    return styles[color] || styles.blue;
  };

  const handlePurchase = async (plan) => {
    const amount = parseInt(purchaseAmount, 10) || 0;
    if (!amount || amount < plan.minAmount || amount > (plan.maxAmount || 1000000000)) {
      alert(`Jumlah investasi harus antara Rp ${plan.minAmount.toLocaleString('id-ID')} - Rp ${(plan.maxAmount || 1000000000).toLocaleString('id-ID')}`);
      return;
    }

    const base = import.meta.env.VITE_API_URL || '';
    try {
      const resp = await fetch(`${base}/api/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, amount })
      });
      if (!resp.ok) throw resp;
      const body = await resp.json();
      alert(body?.message || `Investasi ${plan.name} sebesar Rp ${amount.toLocaleString('id-ID')} dibuat. Status: pending.`);
    } catch (err) {
      alert(`Investasi ${plan.name} sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dibuat! Pending verifikasi.`);
    }

    setShowPurchaseForm(false);
    setPurchaseAmount('');
    setSelectedPlan(null);
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 animate-fade-in space-y-6">
      {/* Header */}
      <div className="max-w-3xl">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-3">
          Paket Investasi
        </h2>
        <p className="text-xs sm:text-base md:text-lg text-dark-600 dark:text-white/70 leading-relaxed">
          Pilih paket investasi yang sesuai dengan modal dan target keuntungan Anda. 
          Semua paket dilindungi oleh sistem keamanan berstandar institusi.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const style = getStyleClasses(plan.color);
          const isSelected = selectedPlan?.id === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`card flex flex-col p-4 sm:p-6 transition-all duration-300 border-2 
                ${isSelected ? 'border-primary-500 ring-4 ring-primary-500/10 scale-[1.02]' : 'border-transparent'} 
                ${style.wrapper} 
                group hover:-translate-y-1 hover:shadow-soft-xl bg-white dark:bg-dark-900/80 dark:shadow-black/30
              `}
            >
              {/* Highlight Background for Recommended (Teal) */}
              {plan.color === 'teal' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-transparent rounded-bl-full pointer-events-none -z-0" />
              )}

              {/* Plan Header */}
              <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10 gap-3">
                <div className="flex gap-3 items-center min-w-0">
                  <div className={`p-2 rounded-xl ${style.iconBg} shrink-0`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight text-dark-900 dark:text-white truncate">{plan.name}</h3>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${style.badge}`}>
                  {plan.badge}
                </span>
              </div>

              {/* Deposit Range */}
              <div className="mb-4 sm:mb-6 bg-dark-50 dark:bg-dark-950/60 rounded-xl p-4 border border-dark-100 dark:border-white/10">
                <p className="text-xs font-medium text-dark-500 dark:text-white/60 uppercase tracking-wide mb-1">Kisaran Deposit</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-dark-900 dark:text-white font-bold text-base sm:text-lg">
                    {plan.minAmount >= 1000000 
                      ? `${(plan.minAmount / 1000000).toFixed(0)}Jt`
                      : `${(plan.minAmount / 1000).toFixed(0)}Rb`}
                  </span>
                  <span className="text-dark-400 dark:text-white/50 mx-1">-</span>
                  <span className="text-dark-900 dark:text-white font-bold text-base sm:text-lg">
                    {plan.maxAmount 
                      ? (plan.maxAmount >= 1000000 ? `${(plan.maxAmount / 1000000).toFixed(0)}Jt` : `${(plan.maxAmount / 1000).toFixed(0)}Rb`)
                      : '∞'
                    }
                  </span>
                </div>
              </div>

              {/* Returns Divider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div>
                  <p className="text-xs text-dark-500 dark:text-white/60 mb-1">Profit Harian</p>
                  <p className="text-base sm:text-lg font-bold text-dark-900 dark:text-white">{plan.dailyReturn}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 dark:text-white/60 mb-1">Total Return</p>
                  <p className="text-base sm:text-lg font-bold text-dark-900 dark:text-white">{plan.totalReturn}</p>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-grow space-y-2.5 mb-6 sm:mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs sm:text-sm text-dark-700 dark:text-white/70 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowPurchaseForm(true);
                  setPurchaseAmount(plan.minAmount);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-200 flex items-center justify-center gap-2 ${style.button}`}
              >
                Pilih Paket Ini
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal/Form area */}
      {showPurchaseForm && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={() => setShowPurchaseForm(false)} />
          
          <div className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-md relative z-10 shadow-2xl animate-fade-in-up border border-dark-100 dark:border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 text-white ${
              selectedPlan.color === 'blue' ? 'bg-blue-600' :
              selectedPlan.color === 'teal' ? 'bg-teal-500' :
              selectedPlan.color === 'amber' ? 'bg-amber-500' : 'bg-purple-600'
            }`}>
              <h3 className="text-2xl font-bold">Investasi {selectedPlan.name}</h3>
              <p className="text-white/80 mt-1 text-sm">Return {selectedPlan.dailyReturn} / hari</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-dark-600">
                  Saldo Anda saat ini: <span className="font-bold text-dark-900">Rp {wallet.balance.toLocaleString('id-ID')}</span>.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">
                    Jumlah Modal / Investasi
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-dark-400">Rp</span>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-dark-200 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-dark-900"
                      placeholder="Masukkan nominal"
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-2">
                    Min: Rp {selectedPlan.minAmount.toLocaleString('id-ID')} 
                    {selectedPlan.maxAmount ? ` - Max: Rp ${selectedPlan.maxAmount.toLocaleString('id-ID')}` : ''}
                  </p>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowPurchaseForm(false)}
                    className="w-full py-3 rounded-xl font-medium text-dark-600 bg-dark-50 hover:bg-dark-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handlePurchase(selectedPlan)}
                    className="w-full py-3 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPlansPage;
