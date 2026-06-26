import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, Globe, User, CheckCircle, ArrowRight, Sparkles, ShieldCheck, ChevronLeft, BadgeCheck } from 'lucide-react';
import api from '../utils/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    sponsor: '',
    name: '',
    country: 'Indonesia',
    countryCode: '+62',
    countryFlag: '🇮🇩',
    phone: '',
    email: '',
    username: '',
    password: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!successMessage) return undefined;

    const timer = setTimeout(() => {
      navigate('/login');
    }, 1600);

    return () => clearTimeout(timer);
  }, [successMessage, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Special handling when selecting country option encoded as "name||code||flag"
    if (name === 'country' && typeof value === 'string' && value.includes('||')) {
      const [countryName, countryCode, countryFlag] = value.split('||');
      setFormData(prev => ({
        ...prev,
        country: countryName,
        countryCode,
        countryFlag
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Extended list of countries with codes and emoji flags
  const countries = [
    { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
    { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Thailand', code: '+66', flag: '🇹🇭' },
    { name: 'Philippines', code: '+63', flag: '🇵🇭' },
    { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.agreeTerms) {
      setError('Anda harus menyetujui Syarat dan Ketentuan');
      setLoading(false);
      return;
    }

    try {
      const phoneFull = `${formData.countryCode}${String(formData.phone || '').replace(/^\+/, '')}`;
      await api.post('/api/auth/register', {
        sponsor: formData.sponsor,
        name: formData.name,
        country: formData.country,
        countryCode: formData.countryCode,
        phone: phoneFull,
        email: formData.email,
        username: formData.username,
        password: formData.password
      });

      setSuccessMessage('Pendaftaran berhasil. Kami sedang mengarahkan Anda ke halaman login.');
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.sponsor || !formData.name)) {
      setError('Mohon isi semua field');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_50%,_#111827_100%)] px-4 py-4 text-white sm:px-6 sm:py-6 lg:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-24 top-6 hidden h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl lg:block" />
        <div className="absolute right-[-5rem] top-1/2 hidden h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl lg:block" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div className="hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-2xl lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <Sparkles size={14} /> Syariah investment portal
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white xl:text-5xl">
              Bergabung dengan tampilan yang lebih bersih, lebih modern, dan lebih cepat dibaca.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Proses pendaftaran dibuat ringkas untuk mobile, dengan langkah yang jelas, field yang rapi, dan konfirmasi yang tidak mengganggu.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Step-by-step registration yang ringan di HP',
                'Validasi field dan status berhasil yang lebih elegan',
                'Desain glassmorphism dengan kontras tinggi'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <BadgeCheck size={24} />
                </div>
                <div>
                  <p className="font-semibold text-white">Siap untuk login</p>
                  <p className="text-sm text-slate-400">Setelah daftar berhasil, pengguna diarahkan ke halaman masuk.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl sm:p-7 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

            <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  <Sparkles size={12} /> Register
                </div>
                <h1 className="mt-3 text-2xl font-black tracking-tight text-white">Daftar akun baru</h1>
                <p className="mt-1 text-sm text-slate-400">Buat akun dalam 2 langkah singkat.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                <UserPlus size={14} /> Bergabung Sekarang
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white">Bergabunglah Sekarang</h1>
              <p className="mt-2 text-sm text-slate-400">Mulai perjalanan investasi syariah Anda bersama kami</p>
            </div>

            <div className="mt-5 flex gap-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500' : 'bg-white/10'}`}
                />
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-cyan-400/10 p-2 text-cyan-300">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-semibold text-white">Pendaftaran aman dan terstruktur</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Isi data langkah demi langkah. Tampilan ini dioptimalkan untuk layar kecil agar tidak terlalu tinggi ke bawah.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                <div className="flex items-center gap-2 font-semibold">
                  <BadgeCheck size={16} /> {successMessage}
                </div>
                <p className="mt-2 text-xs text-emerald-100/80">Anda akan diarahkan ke halaman login dalam sebentar.</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-5 space-y-5">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Sponsor */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <User className="w-4 h-4" />
                      Sponsor (Referrer)
                    </label>
                    <input
                      type="text"
                      name="sponsor"
                      placeholder="Nama sponsor Anda (opsional)"
                      value={formData.sponsor}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <User className="w-4 h-4" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>

                  {/* Country & Phone */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Globe className="w-4 h-4" />
                        Negara
                      </label>
                      <select
                        name="country"
                        value={`${formData.country}||${formData.countryCode}||${formData.countryFlag}`}
                        onChange={handleChange}
                        className="w-full appearance-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                      >
                        {countries.map((c, index) => (
                          <option key={index} value={`${c.name}||${c.code}||${c.flag}`}>
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="group">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Phone className="w-4 h-4" />
                        Nomor Telepon
                      </label>
                      <div className="relative flex items-center">
                        <div className="pointer-events-none absolute bottom-0 left-3 top-0 flex items-center gap-1.5 rounded-l-2xl border-r border-white/10 bg-white/5 px-2">
                          <span className="text-base">{formData.countryFlag}</span>
                          <span className="text-xs font-semibold text-slate-300">{formData.countryCode}</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="81234567890"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-24 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Contoh: 81234567890 (tanpa +/0 di depan)</p>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.25)] transition hover:-translate-y-0.5"
                  >
                    <span>Lanjutkan ke Step 2</span>
                    <ArrowRight className="h-4 w-4 transition-transform" />
                  </button>
                </div>
              )}

              {/* Step 2: Account Info */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Email */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>

                  {/* Username */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <User className="w-4 h-4" />
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Pilih username unik Anda"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <p className="text-xs text-slate-400 mt-1">Username hanya boleh huruf, angka, dan underscore</p>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Minimal 8 karakter"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <p className="text-xs text-slate-400 mt-1">Gunakan kombinasi huruf, angka, dan simbol</p>
                  </div>

                  {/* Terms Agreement */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 group">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                      className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-white/20 bg-slate-900 accent-cyan-500"
                    />
                    <span className="text-sm text-slate-300 transition-colors group-hover:text-white">
                      Saya setuju dengan{' '}
                      <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors underline">
                        Syarat & Ketentuan
                      </a>{' '}
                      dan{' '}
                      <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors underline">
                        Kebijakan Privasi
                      </a>{' '}
                      Magnet Rezeki Syariah
                    </span>
                  </label>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                    >
                      <span className="inline-flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> Kembali</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Mendaftar...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Daftar Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-slate-400">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-[28px] border border-emerald-400/20 bg-slate-950/90 p-5 text-white shadow-[0_30px_100px_rgba(2,6,23,0.55)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-300">Berhasil</p>
                <p className="text-lg font-bold text-white">Pendaftaran selesai</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{successMessage}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Anda akan diarahkan ke halaman login secara otomatis.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
