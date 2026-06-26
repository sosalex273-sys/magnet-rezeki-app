import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Users, CheckCircle, Zap, BarChart3, Lock } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: 'Investasi Syariah',
      description: 'Investasi halal yang sesuai dengan prinsip-prinsip Islam modern'
    },
    {
      icon: TrendingUp,
      title: 'Return Kompetitif',
      description: 'Dapatkan return menarik dengan risiko yang terkelola dengan baik'
    },
    {
      icon: Lock,
      title: 'Aman & Terpercaya',
      description: 'Platform kami dilengkapi dengan enkripsi tingkat bank'
    },
    {
      icon: Users,
      title: 'Komunitas Aktif',
      description: 'Bergabunglah dengan ribuan investor cerdas Indonesia'
    },
    {
      icon: Zap,
      title: 'Proses Cepat',
      description: 'Daftar dan mulai investasi hanya dalam beberapa menit'
    },
    {
      icon: BarChart3,
      title: 'Dashboard Intuitif',
      description: 'Pantau investasi Anda dengan dashboard analytics real-time'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Buat Akun',
      description: 'Daftar dengan email dan verifikasi identitas Anda'
    },
    {
      number: '02',
      title: 'Setup Profil',
      description: 'Lengkapi profil dan data diri untuk keamanan maksimal'
    },
    {
      number: '03',
      title: 'Deposit Dana',
      description: 'Tambahkan saldo melalui berbagai metode pembayaran'
    },
    {
      number: '04',
      title: 'Mulai Investasi',
      description: 'Pilih instrumen investasi dan mulai cuan'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <div className="hidden sm:block">
              <h1 className="font-bold text-base md:text-lg">Magnet Rezeki</h1>
              <p className="text-xs text-slate-400">Syariah Investment</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/login"
              className="px-3 md:px-4 py-2 text-xs md:text-sm text-slate-300 hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-5 md:space-y-8 animate-fade-in-right">
            <div className="space-y-3">
              <div className="inline-block px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/50 text-primary-300 text-xs md:text-sm font-semibold">
                🚀 Platform Investasi Syariah Terdepan
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Mulai <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">Investasi</span> Hari Ini
              </h1>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                Raih kesempatan emas untuk mengembangkan aset Anda dengan investasi syariah yang menguntungkan dan aman.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 md:px-8 md:py-4 border border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg font-semibold text-sm md:text-base transition-all"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 pt-4 md:pt-6">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary-400">10K+</div>
                <p className="text-xs md:text-sm text-slate-400">Investor Aktif</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary-400">500M+</div>
                <p className="text-xs md:text-sm text-slate-400">Dana Kelola</p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary-400">24/7</div>
                <p className="text-xs md:text-sm text-slate-400">Support</p>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden md:block">
            <div className="relative w-full aspect-square">
              {/* Floating Cards */}
              <div className="absolute top-12 left-8 p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Return Bulan Ini</p>
                    <p className="text-xl font-bold text-primary-400">+12.5%</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 right-12 p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status Akun</p>
                    <p className="text-lg font-bold text-cyan-400">Terverifikasi</p>
                  </div>
                </div>
              </div>

              {/* Center Element */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary-600/30 to-cyan-600/30 rounded-3xl blur-3xl animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-blue rounded-3xl shadow-2xl flex items-center justify-center text-6xl">
                📈
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16 scroll-mt-20">
        <div className="text-center mb-10 md:mb-12 space-y-2 md:space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold">Mengapa Memilih Magnet Rezeki?</h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Platform investasi syariah terlengkap dengan fitur unggulan untuk kesuksesan finansial Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl rounded-xl md:rounded-2xl border border-slate-700/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-primary-500/20 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary-500/30 transition-colors">
                  <Icon className="w-5 h-5 md:w-7 md:h-7 text-primary-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12 space-y-2 md:space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold">Cara Kerja Mudah</h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Empat langkah sederhana untuk memulai perjalanan investasi Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-5 md:p-6 bg-slate-900/60 backdrop-blur-xl rounded-xl md:rounded-2xl border border-slate-700/50">
                <div className="text-4xl md:text-5xl font-bold text-primary-500/50 mb-2 md:mb-3">{step.number}</div>
                <h3 className="text-base md:text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-xs md:text-sm text-slate-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-slate-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-slate-700/50 p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Keamanan Terjamin</h2>
              <p className="text-sm md:text-base text-slate-300">
                Semua transaksi dilindungi dengan enkripsi tingkat bank dan sistem keamanan berlapis.
              </p>
              <div className="space-y-3">
                {['Enkripsi End-to-End', 'Verifikasi 2-Faktor', 'Sertifikasi Internasional'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden md:flex justify-center">
              <div className="w-40 h-40 md:w-48 md:h-48 bg-gradient-to-br from-primary-600/30 to-cyan-600/30 rounded-2xl md:rounded-3xl flex items-center justify-center text-4xl md:text-5xl">
                🔒
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12 text-center space-y-5 md:space-y-7">
          <h2 className="text-2xl md:text-4xl font-bold">Siap Memulai Investasi?</h2>
          <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto">
            Daftar sekarang dan mulai investasi dengan platform terpercaya!
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white hover:bg-slate-100 text-primary-600 font-semibold text-sm md:text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Daftar Gratis Sekarang</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 border-2 border-white hover:bg-white/10 text-white font-semibold text-sm md:text-base rounded-lg transition-all"
            >
              Login Akun Saya
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                <span className="font-bold">Magnet Rezeki</span>
              </div>
              <p className="text-sm text-slate-400">Platform investasi syariah terpercaya untuk masa depan finansial yang cerah.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Investasi Saham</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reksadana Syariah</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trading Emas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Magnet Rezeki Syariah. Semua hak dilindungi. Disclaimer: Investasi memiliki risiko. Bacalah prospektus sebelum berinvestasi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

