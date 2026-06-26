import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Upload, User, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { supabase } from '../../lib/supabaseClient';

const AVATAR_SIZE = 320;
const CROP_PREVIEW_SIZE = 280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

import { useUser } from '../../context/UserContext';

const ProfileSettingsPage = () => {
  const { user, refreshUser } = useUser();
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08195257892',
    country: 'Indonesia',
    city: 'Jakarta',
    address: 'Jl. Sudirman No. 123',
    username: 'budi',
    birthDate: '',
    gender: 'male',
    bio: '',
    avatar: '',
    kyc: {
      status: 'pending',
      idType: '',
      idNumber: ''
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [showCropModal, setShowCropModal] = useState(false);
  const [showFullPhoto, setShowFullPhoto] = useState(false); // Tambahkan state ini
  const [cropSource, setCropSource] = useState('');
  const [cropImageMeta, setCropImageMeta] = useState({ width: 0, height: 0 });
  const [cropTransform, setCropTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const [dragState, setDragState] = useState({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });

  useEffect(() => {
    if (user) {
      // Map user object to profile format if needed
      const mappedUser = {
        ...user,
        birthDate: user.birth_date || '', // map db field to state field
        avatar: user.avatar_url || '',
        kyc: user.kyc || { status: 'pending', idType: '', idNumber: '' }
      };
      setProfile(mappedUser);
      setEditData(mappedUser);
    }
  }, [user]);

  const handleEditChange = (field, value) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };

  const handleSaveProfile = async () => {
    console.log("Saving profile with data:", editData);
    try {
      // 1. Update backend via API
      const userId = profile.id || JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) throw new Error("ID Pengguna tidak ditemukan");
      console.log("User ID:", userId);

      const response = await api.put(`/api/admin/members/${userId}`, {
        name: editData.name,
        phone: editData.phone,
        country: editData.country,
        city: editData.city,
        address: editData.address,
        birth_date: editData.birthDate, // Pastikan dikirim sebagai birth_date
        gender: editData.gender,
        bio: editData.bio,
        avatar_url: editData.avatar, // Pastikan dikirim sebagai avatar_url
      });
      console.log("API Response:", response);

      // 2. Update state melalui UserContext atau API
      setProfile({ ...profile, ...editData });
      window.dispatchEvent(new Event('user-profile-updated'));
      setEditMode(false);
      setMessage('✓ Profil berhasil diperbarui!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('❌ Gagal memperbarui profil: ' + (error.response?.data?.error || error.message || 'Terjadi kesalahan'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getRenderedSize = (zoom) => {
    if (!cropImageMeta.width || !cropImageMeta.height) {
      return { width: CROP_PREVIEW_SIZE, height: CROP_PREVIEW_SIZE };
    }

    const aspect = cropImageMeta.width / cropImageMeta.height;
    let baseWidth = CROP_PREVIEW_SIZE;
    let baseHeight = CROP_PREVIEW_SIZE;

    if (aspect >= 1) {
      baseWidth = CROP_PREVIEW_SIZE * aspect;
      baseHeight = CROP_PREVIEW_SIZE;
    } else {
      baseWidth = CROP_PREVIEW_SIZE;
      baseHeight = CROP_PREVIEW_SIZE / aspect;
    }

    return {
      width: baseWidth * zoom,
      height: baseHeight * zoom
    };
  };

  const clampCropOffset = (x, y, zoom) => {
    const rendered = getRenderedSize(zoom);
    const maxX = Math.max(0, (rendered.width - CROP_PREVIEW_SIZE) / 2);
    const maxY = Math.max(0, (rendered.height - CROP_PREVIEW_SIZE) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const handleCropPointerDown = (event) => {
    event.preventDefault();
    setDragState({
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropTransform.x,
      originY: cropTransform.y
    });
  };

  const handleCropPointerMove = (event) => {
    if (!dragState.active) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const clamped = clampCropOffset(
      dragState.originX + deltaX,
      dragState.originY + deltaY,
      cropTransform.zoom
    );

    setCropTransform((prev) => ({
      ...prev,
      x: clamped.x,
      y: clamped.y
    }));
  };

  const handleCropPointerUp = () => {
    if (!dragState.active) return;
    setDragState((prev) => ({ ...prev, active: false }));
  };

  const handleZoomChange = (nextZoom) => {
    const boundedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    const clamped = clampCropOffset(cropTransform.x, cropTransform.y, boundedZoom);

    setCropTransform((prev) => ({
      ...prev,
      zoom: boundedZoom,
      x: clamped.x,
      y: clamped.y
    }));
  };

  const handleCropWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    handleZoomChange(cropTransform.zoom + delta);
  };

  const resetCrop = () => {
    setCropTransform({ x: 0, y: 0, zoom: 1 });
  };

  const applyManualCrop = async () => {
    try {
      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = cropSource;
      });

      const rendered = getRenderedSize(cropTransform.zoom);
      const imageX = (CROP_PREVIEW_SIZE - rendered.width) / 2 + cropTransform.x;
      const imageY = (CROP_PREVIEW_SIZE - rendered.height) / 2 + cropTransform.y;
      const scale = rendered.width / image.width;

      const srcX = Math.max(0, (0 - imageX) / scale);
      const srcY = Math.max(0, (0 - imageY) / scale);
      const srcSize = CROP_PREVIEW_SIZE / scale;

      const safeSize = Math.min(srcSize, image.width - srcX, image.height - srcY);

      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas tidak tersedia');

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(
        image,
        srcX,
        srcY,
        safeSize,
        safeSize,
        0,
        0,
        AVATAR_SIZE,
        AVATAR_SIZE
      );

      // Konversi langsung ke Base64
      const processed = canvas.toDataURL('image/jpeg', 0.9);

      setEditData((prev) => ({ ...prev, avatar: processed }));
      setShowCropModal(false);
      setCropSource('');
      setMessage('✓ Foto berhasil di-crop!');
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      console.error('Detailed Error in applyManualCrop:', error);
      setMessage('❌ Gagal memproses foto: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('❌ File harus berupa gambar!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Ukuran file maksimal 5MB!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const image = new Image();

      image.onload = () => {
        setCropImageMeta({ width: image.width, height: image.height });
        setCropTransform({ x: 0, y: 0, zoom: 1 });
        setCropSource(dataUrl);
        setShowCropModal(true);
      };

      image.onerror = () => {
        setMessage('❌ Gagal membaca file gambar');
        setTimeout(() => setMessage(''), 3000);
      };

      image.src = dataUrl;
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const removeAvatar = () => {
    setEditData((prev) => ({ ...prev, avatar: '' }));
  };

  const handleChangePassword = () => {
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage('❌ Semua field harus diisi!');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('❌ Password baru tidak cocok!');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage('❌ Password minimal 8 karakter!');
      return;
    }

    // Simulate password change
    setShowPasswordForm(false);
    setPasswords({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage('✓ Password berhasil diubah!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-dark-950 dark:to-dark-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Pengaturan Profil</h1>
        <p className="text-gray-600 dark:text-white/70">Kelola informasi pribadi dan keamanan akun Anda</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('✓') ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-200'}`}>
          {message}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white dark:bg-dark-900/70 rounded-lg shadow p-8 mb-8 border border-gray-200 dark:border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informasi Pribadi</h2>
          {!editMode && (
            <button
              onClick={() => {
                setEditMode(true);
                setEditData(profile);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-2">Foto Profil</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
                  {editData.avatar ? (
                    <img src={editData.avatar} alt="Foto Profil" className="h-full w-full object-cover" />
                  ) : (
                    <User size={30} className="text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700">
                    <Upload size={16} /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  <button type="button" onClick={removeAvatar} className="inline-flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-gray-800 font-semibold hover:bg-gray-400 dark:bg-white/10 dark:text-white">
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-white/60">Setelah pilih foto, Anda bisa drag dan zoom area crop sebelum disimpan.</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Nama Lengkap</label>
              <input
                type="text"
                  value={editData.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Email</label>
              <input
                type="email"
                  value={editData.email || ''}
                onChange={(e) => handleEditChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Nomor HP</label>
              <input
                type="tel"
                  value={editData.phone || ''}
                onChange={(e) => handleEditChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Negara</label>
                <input
                  type="text"
                  value={editData.country || ''}
                  onChange={(e) => handleEditChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Kota</label>
                <input
                  type="text"
                  value={editData.city || ''}
                  onChange={(e) => handleEditChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Alamat</label>
              <textarea
                value={editData.address || ''}
                onChange={(e) => handleEditChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={editData.birthDate || ''}
                  onChange={(e) => handleEditChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Jenis Kelamin</label>
                <select
                  value={editData.gender || 'male'}
                  onChange={(e) => handleEditChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Bio</label>
              <textarea
                value={editData.bio || ''}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows="3"
                placeholder="Ceritakan singkat tentang Anda"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-white/15"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Check size={18} /> Simpan Perubahan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-gray-900 dark:text-white">
            <div className="col-span-1 sm:col-span-2 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Foto Profil" className="h-full w-full object-cover" />
                ) : (
                  <User size={30} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-white/60">Foto Profil</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{profile.avatar ? 'Sudah diunggah' : 'Belum diunggah'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Nama Lengkap</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Email</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white break-all">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Nomor HP</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Username</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">@{profile.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Negara</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Kota</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.city}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Alamat</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Tanggal Lahir</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.birthDate || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Jenis Kelamin</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {profile.gender === 'female' ? 'Perempuan' : profile.gender === 'other' ? 'Lainnya' : 'Laki-laki'}
              </p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Bio</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{profile.bio || '-'}</p>
            </div>
          </div>
        )}
      </div>

      {/* KYC Status */}
      <div className="bg-white dark:bg-dark-900/70 rounded-lg shadow p-8 mb-8 border border-gray-200 dark:border-white/10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Status Verifikasi Identitas (KYC)</h2>

        <div className={`p-6 rounded-lg border-l-4 ${profile.kyc.status === 'verified' ? 'bg-green-50 dark:bg-green-500/10 border-green-600' : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-600'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Check size={24} className={profile.kyc.status === 'verified' ? 'text-green-600' : 'text-yellow-600'} />
            <h3 className={`text-xl font-bold ${profile.kyc.status === 'verified' ? 'text-green-900 dark:text-green-200' : 'text-yellow-900 dark:text-yellow-200'}`}>
              {profile.kyc.status === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-white/70">Tipe Identitas</p>
              <p className="text-gray-900 dark:text-white">{profile.kyc.idType}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-white/70">Nomor Identitas</p>
              <p className="text-gray-900 dark:text-white">{profile.kyc.idNumber}</p>
            </div>
          </div>

          {profile.kyc.status === 'verified' && (
            <p className="text-sm text-green-800 dark:text-green-200 mt-4">✓ Akun Anda sudah terverifikasi dan siap untuk melakukan semua transaksi</p>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-dark-900/70 rounded-lg shadow p-8 mb-8 border border-gray-200 dark:border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keamanan Akun</h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
            >
              Ubah Password
            </button>
          )}
        </div>

        {showPasswordForm ? (
          <div className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Password Lama</label>
              <div className="relative">
                <input
                  type={showPasswords.oldPassword ? 'text' : 'password'}
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                />
                <button
                  onClick={() => setShowPasswords({ ...showPasswords, oldPassword: !showPasswords.oldPassword })}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-white/60"
                >
                  {showPasswords.oldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Password Baru</label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                />
                <button
                  onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-white/60"
                >
                  {showPasswords.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                />
                <button
                  onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-white/60"
                >
                  {showPasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-dark-900/60 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-800 dark:text-white/75">
              <p className="font-semibold">Requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Minimal 8 karakter</li>
                <li>Kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-white/10 text-gray-800 dark:text-white rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-white/15"
              >
                Batal
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
              >
                Ubah Password
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-dark-900/60 p-6 rounded-lg">
            <p className="text-gray-700 dark:text-white/75 mb-4">Pastikan password Anda kuat dan hanya Anda yang tahu.</p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-white/60">
              <p>✓ Password terakhir diubah: 2026-04-15</p>
              <p>✓ 2FA (Two Factor Authentication): Belum diaktifkan</p>
            </div>
          </div>
        )}
      </div>

      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-dark-900 dark:border dark:border-white/10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crop Foto Profil</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-white/60">Geser gambar untuk atur posisi, lalu gunakan zoom.</p>

            <div
              className="relative mx-auto mt-4 h-[280px] w-[280px] select-none overflow-hidden rounded-xl border border-gray-300 bg-gray-100 dark:border-white/10 dark:bg-dark-950"
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
              onPointerLeave={handleCropPointerUp}
              onWheel={handleCropWheel}
              style={{ cursor: dragState.active ? 'grabbing' : 'grab' }}
            >
              {cropSource && (
                <img
                  src={cropSource}
                  alt="Crop Preview"
                  draggable={false}
                  className="pointer-events-none absolute"
                  style={{
                    left: `calc(50% + ${cropTransform.x}px)`,
                    top: `calc(50% + ${cropTransform.y}px)`,
                    width: `${getRenderedSize(cropTransform.zoom).width}px`,
                    height: `${getRenderedSize(cropTransform.zoom).height}px`,
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none'
                  }}
                />
              )}

              {/* Circular mask preview */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[220px] w-[220px] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Zoom: {cropTransform.zoom.toFixed(2)}x</label>
              <button
                type="button"
                onClick={resetCrop}
                className="rounded-md bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-300 dark:bg-white/10 dark:text-white"
              >
                Reset Posisi
              </button>
            </div>
            <div>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step="0.01"
                value={cropTransform.zoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-white/60">Tips: gunakan scroll mouse pada area crop untuk zoom cepat.</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCropModal(false);
                  setCropSource('');
                }}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400 dark:bg-white/10 dark:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={applyManualCrop}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                Terapkan Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettingsPage;
