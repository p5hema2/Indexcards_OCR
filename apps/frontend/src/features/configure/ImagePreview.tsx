import React, { useRef, useState, useCallback } from 'react';
import { useWizardStore } from '../../store/wizardStore';

interface MagnifierState {
  visible: boolean;
  x: number; // cursor x relative to image container (0-1)
  y: number; // cursor y relative to image container (0-1)
  containerX: number; // cursor px relative to container left
  containerY: number; // cursor px relative to container top
}

const MAGNIFIER_SIZE = 150;
const ZOOM_FACTOR = 2.5;

export const ImagePreview: React.FC = () => {
  const { files } = useWizardStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [magnifier, setMagnifier] = useState<MagnifierState>({
    visible: false,
    x: 0,
    y: 0,
    containerX: 0,
    containerY: 0,
  });

  const firstFile = files[0];
  const preview = firstFile?.preview;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;
    const x = containerX / rect.width;
    const y = containerY / rect.height;
    setMagnifier({ visible: true, x, y, containerX, containerY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMagnifier((prev) => ({ ...prev, visible: false }));
  }, []);

  if (!firstFile) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-archive-ink/40 font-semibold">
        Sample Card Preview
      </p>

      <div
        ref={containerRef}
        className="relative rounded border border-parchment-dark/50 overflow-hidden bg-parchment-light/30 parchment-shadow cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {preview ? (
          <>
            <img
              ref={imgRef}
              src={preview}
              alt={firstFile.name}
              className="w-full max-h-[300px] object-contain rounded"
            />

            {/* Magnifier lens */}
            {magnifier.visible && (
              <div
                className="absolute pointer-events-none rounded-full border-2 border-archive-sepia/60 overflow-hidden shadow-lg"
                style={{
                  width: MAGNIFIER_SIZE,
                  height: MAGNIFIER_SIZE,
                  left: magnifier.containerX - MAGNIFIER_SIZE / 2,
                  top: magnifier.containerY - MAGNIFIER_SIZE / 2,
                }}
              >
                <img
                  src={preview}
                  alt=""
                  style={{
                    width: `${ZOOM_FACTOR * 100}%`,
                    height: `${ZOOM_FACTOR * 100}%`,
                    maxWidth: 'none',
                    position: 'absolute',
                    left: `${-magnifier.x * ZOOM_FACTOR * 100 + 50}%`,
                    top: `${-magnifier.y * ZOOM_FACTOR * 100 + 50}%`,
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center p-8 text-archive-ink/30 italic text-sm font-serif">
            Image preview unavailable
          </div>
        )}
      </div>

      <p className="text-xs text-archive-ink/40 italic font-light">
        {firstFile.name} — hover to magnify
      </p>
    </div>
  );
};
