import React, { useRef, useState, useCallback } from 'react';
import { useWizardStore } from '../../store/wizardStore';

interface MagnifierState {
  visible: boolean;
  x: number; // cursor x relative to actual image (0-1)
  y: number; // cursor y relative to actual image (0-1)
  containerX: number; // cursor px relative to container left
  containerY: number; // cursor px relative to container top
  imgWidth: number; // actual rendered image width
  imgHeight: number; // actual rendered image height
}

const MAGNIFIER_SIZE = 220;
const ZOOM_FACTOR = 5;

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
    imgWidth: 0,
    imgHeight: 0,
  });

  const firstFile = files[0];
  const preview = firstFile?.preview;
  const [previewBroken, setPreviewBroken] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgRef.current) return;

    const imgRect = imgRef.current.getBoundingClientRect();

    // Cursor position relative to the actual rendered image
    const imgX = e.clientX - imgRect.left;
    const imgY = e.clientY - imgRect.top;

    // Normalized (0-1) within the image
    const x = imgX / imgRect.width;
    const y = imgY / imgRect.height;

    // Only show magnifier when cursor is over the actual image
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      setMagnifier((prev) => ({ ...prev, visible: false }));
      return;
    }

    // Container-relative position for lens placement
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    setMagnifier({
      visible: true,
      x,
      y,
      containerX,
      containerY,
      imgWidth: imgRect.width,
      imgHeight: imgRect.height,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMagnifier((prev) => ({ ...prev, visible: false }));
  }, []);

  if (!firstFile) return null;

  // Clamp lens position so it doesn't overflow the container
  const half = MAGNIFIER_SIZE / 2;
  const lensLeft = magnifier.containerX - half;
  const lensTop = magnifier.containerY - half;

  // Zoomed image pixel dimensions
  const zoomedW = magnifier.imgWidth * ZOOM_FACTOR;
  const zoomedH = magnifier.imgHeight * ZOOM_FACTOR;

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-archive-ink/40 font-semibold">
        Sample Card Preview
      </p>

      <div
        ref={containerRef}
        className="relative rounded border border-parchment-dark/50 bg-parchment-light/30 parchment-shadow cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {preview && !previewBroken ? (
          <>
            <img
              ref={imgRef}
              src={preview}
              alt={firstFile.name}
              className="w-full max-h-[500px] object-contain rounded"
              onError={() => setPreviewBroken(true)}
            />

            {/* Magnifier lens */}
            {magnifier.visible && (
              <div
                className="absolute pointer-events-none rounded-full border-2 border-archive-sepia/60 overflow-hidden shadow-lg z-10"
                style={{
                  width: MAGNIFIER_SIZE,
                  height: MAGNIFIER_SIZE,
                  left: lensLeft,
                  top: lensTop,
                }}
              >
                <img
                  src={preview}
                  alt=""
                  style={{
                    width: zoomedW,
                    height: zoomedH,
                    maxWidth: 'none',
                    position: 'absolute',
                    left: half - magnifier.x * zoomedW,
                    top: half - magnifier.y * zoomedH,
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
