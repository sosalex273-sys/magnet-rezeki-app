import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const KYCPage = () => {
  const { user } = useUser();
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [ktpFile, setKtpFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !idNumber || !ktpFile || !selfieFile || !user?.id) {
      alert('Lengkapi data dan unggah foto KTP serta selfie terlebih dahulu.');
      return;
    }

    setSubmitting(true);

    try {
      const base = import.meta.env.VITE_API_URL || '';

      // upload ktp
      const ktpData = await readFileAsBase64(ktpFile);
      const ktpBase64 = ktpData.split(',')[1] || ktpData;
      const resKtp = await fetch(`${base}/api/kyc_upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: ktpFile.name, content_base64: ktpBase64, content_type: ktpFile.type, user_id: user.id }) });
      const jsonKtp = await resKtp.json();
      if (!resKtp.ok) throw new Error(jsonKtp.error || 'Upload KTP gagal');

      // upload selfie
      const selfieData = await readFileAsBase64(selfieFile);
      const selfieBase64 = selfieData.split(',')[1] || selfieData;
      const resSelfie = await fetch(`${base}/api/kyc_upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: selfieFile.name, content_base64: selfieBase64, content_type: selfieFile.type, user_id: user.id }) });
      const jsonSelfie = await resSelfie.json();
      if (!resSelfie.ok) throw new Error(jsonSelfie.error || 'Upload selfie gagal');

      // submit KYC record
      const submitRes = await fetch(`${base}/api/kyc_submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, id_type: 'KTP', id_number: idNumber, id_image_url: jsonKtp.url, selfie_image_url: jsonSelfie.url, address_proof_url: null }) });
      const submitJson = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitJson.error || 'Submit KYC gagal');

      alert('Data KYC berhasil dikirim dan menunggu verifikasi admin.');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim KYC: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setIdNumber('');
    setKtpFile(null);
    setSelfieFile(null);
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 animate-fade-in space-y-5">
      <div className="max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-2">KYC</h2>
        <p className="text-sm sm:text-base text-dark-600 dark:text-white/70">Lengkapi data KYC untuk memproses verifikasi akun Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-900/70 rounded-2xl p-5 sm:p-6 shadow-md border border-gray-200 dark:border-white/10 max-w-2xl">
        <h3 className="text-base sm:text-lg font-semibold text-dark-900 dark:text-white mb-4">Formulir Verifikasi Identitas</h3>

        <label className="block text-xs sm:text-sm font-medium text-dark-700 dark:text-white/80 mb-1">Nama Lengkap</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-dark-900 text-dark-900 dark:text-white text-base" />

        <label className="block text-xs sm:text-sm font-medium text-dark-700 dark:text-white/80 mb-1">Nomor Identitas (KTP)</label>
        <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-dark-900 text-dark-900 dark:text-white text-base" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-dark-600 dark:text-white/70 mb-2">Unggah Foto KTP</p>
            <label className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer">
              <UploadCloud />
              <span className="text-xs sm:text-sm text-dark-600 dark:text-white/70">Pilih file atau seret ke sini</span>
              <input type="file" className="hidden" onChange={e => setKtpFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-dark-600 dark:text-white/70 mb-2">Unggah Selfie dengan KTP</p>
            <label className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer">
              <UploadCloud />
              <span className="text-xs sm:text-sm text-dark-600 dark:text-white/70">Pilih file atau seret ke sini</span>
              <input type="file" className="hidden" onChange={e => setSelfieFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={submitting} className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-60">
            {submitting ? 'Mengirim...' : 'Kirim Verifikasi'}
          </button>
          <button type="button" onClick={handleReset} className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 text-dark-700 dark:text-white/70 rounded-xl font-medium">Batal</button>
        </div>
      </form>
    </div>
  );
};

export default KYCPage;
