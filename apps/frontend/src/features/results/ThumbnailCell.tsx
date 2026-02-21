import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { ImageOff } from 'lucide-react';

interface ThumbnailCellProps {
  batchName: string;
  filename: string;
}

export const ThumbnailCell: React.FC<ThumbnailCellProps> = ({ batchName, filename }) => {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = `/batches-static/${batchName}/${filename}`;

  if (imgError) {
    return (
      <div className="w-16 h-12 flex items-center justify-center rounded border border-parchment-dark bg-parchment-dark/20 text-archive-ink/30">
        <ImageOff className="w-5 h-5" />
      </div>
    );
  }

  return (
    <>
      <img
        src={imageUrl}
        alt={filename}
        className="w-16 h-12 object-cover rounded cursor-pointer border border-parchment-dark hover:opacity-80 transition-opacity"
        onClick={() => setOpen(true)}
        onError={() => setImgError(true)}
      />
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: imageUrl }]}
      />
    </>
  );
};
