import React from 'react';

const PhotoPreviewModal = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={photoUrl} alt="Full Profile" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
        <button 
          className="absolute -top-10 right-0 text-white font-bold text-lg hover:text-gray-300"
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default PhotoPreviewModal;
