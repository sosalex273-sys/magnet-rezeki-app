import React from 'react';
import { usePhotoPreview } from '../context/PhotoPreviewContext';
import PhotoPreviewModal from './PhotoPreviewModal';

const GlobalPhotoModal = () => {
  const { photoUrl, closePreview } = usePhotoPreview();
  return <PhotoPreviewModal photoUrl={photoUrl} onClose={closePreview} />;
};

export default GlobalPhotoModal;
