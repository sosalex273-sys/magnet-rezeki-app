import React, { createContext, useContext, useState } from 'react';

const PhotoPreviewContext = createContext();

export const usePhotoPreview = () => useContext(PhotoPreviewContext);

export const PhotoPreviewProvider = ({ children }) => {
  const [photoUrl, setPhotoUrl] = useState(null);

  const openPreview = (url) => setPhotoUrl(url);
  const closePreview = () => setPhotoUrl(null);

  return (
    <PhotoPreviewContext.Provider value={{ openPreview, closePreview, photoUrl }}>
      {children}
    </PhotoPreviewContext.Provider>
  );
};
