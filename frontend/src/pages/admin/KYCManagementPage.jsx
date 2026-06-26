import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, FileText } from 'lucide-react';
import { useNotice } from '../../context/NoticeContext';

const KYCManagementPage = () => {
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotice } = useNotice();

  const normalizeKyc = (kyc) => ({
    ...kyc,
    username: kyc.username || kyc.user_id || '-',
    memberName: kyc.memberName || kyc.name || '-',
    idType: kyc.idType || kyc.id_type || '-',
    idNumber: kyc.idNumber || kyc.id_number || '-',
    idImage: kyc.idImage || kyc.id_image_url || '-',
    selfieImage: kyc.selfieImage || kyc.selfie_image_url || '-',
    addressProof: kyc.addressProof || kyc.address_proof_url || '-',
    submittedDate: kyc.submittedDate || kyc.created_at || '-',
    reviewedBy: kyc.reviewedBy || kyc.reviewed_by || '-',
    reviewedDate: kyc.reviewedDate || kyc.reviewed_date || '-'
  });

  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredKyc = kycSubmissions.filter(kyc =>
    filterStatus === 'all' ? true : kyc.status === filterStatus
  );

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredKyc.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedKyc = filteredKyc.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleApprove = async (id) => {
    if (!reviewNotes) {
      showNotice('Masukkan catatan verifikasi terlebih dahulu.', 'warning');
      return;
    }
    const base = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${base}/api/admin/kyc/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: reviewNotes }) });
      if (!res.ok) throw res;
      setKycSubmissions((prev) => prev.map(k => k.id === id ? { ...k, status: 'verified', notes: reviewNotes, reviewedBy: 'Admin', reviewedDate: new Date().toLocaleString('id-ID') } : k));
      showNotice('KYC berhasil diverifikasi.', 'success');
    } catch (e) {
      showNotice('Gagal memverifikasi KYC. Silakan coba lagi.', 'error');
      return;
    }

    setSelectedKyc(null);
    setReviewNotes('');
    setShowDetailModal(false);
  };

  const handleReject = async (id) => {
    if (!reviewNotes) {
      showNotice('Masukkan alasan penolakan terlebih dahulu.', 'warning');
      return;
    }
    const base = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${base}/api/admin/kyc/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: reviewNotes }) });
      if (!res.ok) throw res;
      setKycSubmissions((prev) => prev.map(k => k.id === id ? { ...k, status: 'rejected', notes: reviewNotes, reviewedBy: 'Admin', reviewedDate: new Date().toLocaleString('id-ID') } : k));
      showNotice('KYC berhasil ditolak.', 'success');
    } catch (e) {
      showNotice('Gagal menolak KYC. Silakan coba lagi.', 'error');
      return;
    }

    setSelectedKyc(null);
    setReviewNotes('');
    setShowDetailModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'verified':
        return 'Terverifikasi';
      case 'pending':
        return 'Menunggu Verifikasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL || '';
    fetch(`${base}/api/admin/kyc_submissions`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => { if (!mounted) return; setKycSubmissions(Array.isArray(data) ? data.map(normalizeKyc) : []); })
      .catch(() => { if (!mounted) return; setKycSubmissions([]); })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 pb-24 text-slate-900 transition-colors duration-500 dark:text-slate-100 sm:px-6 md:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Manajemen KYC</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">Verifikasi identitas dan dokumen member</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-cyan-500">Total Submission</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycSubmissions.length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-amber-500">Menunggu</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycSubmissions.filter(k => k.status === 'pending').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-emerald-500">Terverifikasi</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycSubmissions.filter(k => k.status === 'verified').length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-sm font-semibold text-rose-500">Ditolak</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{kycSubmissions.filter(k => k.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu Verifikasi</option>
          <option value="verified">Terverifikasi</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="admin-panel max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto p-5 sm:p-8">
            <h2 className="mb-6 text-xl font-bold sm:text-2xl">Detail KYC - {selectedKyc.username}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Username</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">@{selectedKyc.username}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nama Member</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedKyc.memberName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Jenis ID</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedKyc.idType}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Nomor ID</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedKyc.idNumber}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="admin-card mb-6 p-4">
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">📄 Dokumen yang Diunggah</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileText size={18} className="text-cyan-500" />
                  {selectedKyc.idImage}
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileText size={18} className="text-cyan-500" />
                  {selectedKyc.selfieImage}
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileText size={18} className="text-cyan-500" />
                  {selectedKyc.addressProof}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tanggal Submitted</p>
                <p className="text-slate-900 dark:text-white">{selectedKyc.submittedDate}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(selectedKyc.status)}`}>
                  {getStatusLabel(selectedKyc.status)}
                </span>
              </div>
            </div>

            {selectedKyc.status === 'pending' && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Catatan Verifikasi / Alasan Penolakan</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Masukkan catatan tentang verifikasi ini..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white"
                  rows="3"
                />
              </div>
            )}

            {selectedKyc.status !== 'pending' && (
              <div className="admin-card mb-6 p-4">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Catatan Admin</p>
                <p className="text-slate-900 dark:text-white">{selectedKyc.notes}</p>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Direview oleh {selectedKyc.reviewedBy} pada {selectedKyc.reviewedDate}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Tutup
              </button>
              {selectedKyc.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedKyc.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-danger px-4 py-2.5 font-bold text-white transition duration-300 hover:-translate-y-0.5"
                  >
                    <X size={18} /> Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(selectedKyc.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-success px-4 py-2.5 font-bold text-white transition duration-300 hover:-translate-y-0.5"
                  >
                    <Check size={18} /> Terima
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Submissions Table */}
      <div className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/90 text-white dark:bg-white/10">
              <th className="px-6 py-3 text-left text-sm font-bold">Username</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nama Member</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Jenis ID</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Tanggal Submit</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedKyc.map((kyc) => (
              <tr key={kyc.id} className="border-b border-white/10 transition duration-300 hover:-translate-y-px hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-cyan-500">@{kyc.username}</td>
                <td className="px-6 py-4 text-slate-900 dark:text-white">{kyc.memberName}</td>
                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{kyc.idType}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{kyc.submittedDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(kyc.status)}`}>
                    {getStatusLabel(kyc.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedKyc(kyc);
                        setReviewNotes(kyc.notes || '');
                        setShowDetailModal(true);
                      }}
                      className="rounded-xl bg-cyan-500/10 p-2 text-cyan-500 transition hover:-translate-y-0.5 hover:bg-cyan-500/20"
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>
                    {kyc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setShowDetailModal(true);
                          }}
                          className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
                          title="Verifikasi"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setShowDetailModal(true);
                          }}
                          className="rounded-xl bg-rose-500/10 p-2 text-rose-500 transition hover:-translate-y-0.5 hover:bg-rose-500/20"
                          title="Tolak"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {filteredKyc.length === 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/75 p-8 text-center text-slate-500 shadow-soft-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-400">
          <p>Tidak ada KYC submission</p>
        </div>
      )}

      {filteredKyc.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Menampilkan {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredKyc.length)} dari {filteredKyc.length} data KYC
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-300">Halaman {safeCurrentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCManagementPage;
