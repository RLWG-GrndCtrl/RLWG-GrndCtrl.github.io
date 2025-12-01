// components/ImageCompare.tsx
'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';

type Props = {
  leftSrc: string;
  rightSrc: string;
  leftAlt?: string;
  rightAlt?: string;
  initial?: number;           // [0,1]
  leftLabel?: string;
  rightLabel?: string;
  leftLabelColor?: string;    // Custom color for left label (hex or CSS color)
  rightLabelColor?: string;   // Custom color for right label (hex or CSS color)
  className?: string;         // you can pass "aspect-[4/3]" here
  fit?: 'cover' | 'contain';  // how to place images inside the frame
  objectPosition?: string;    // e.g. 'center', 'left top'
};

export default function ImageCompare({
  leftSrc,
  rightSrc,
  leftAlt = '',
  rightAlt = '',
  initial = 0.5,
  leftLabel,
  rightLabel,
  leftLabelColor,
  rightLabelColor,
  className = '',
  fit = 'cover',
  objectPosition = 'center',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftImgRef = useRef<HTMLImageElement | null>(null);
  const rightImgRef = useRef<HTMLImageElement | null>(null);
  const [t, setT] = useState<number>(clamp01(initial));
  const [dragging, setDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ left: false, right: false });
  const [syncKey, setSyncKey] = useState(0);
  const [showImages, setShowImages] = useState(false);

  // Reset load state when sources change
  useEffect(() => {
    setImagesLoaded({ left: false, right: false });
    setShowImages(false);
    setSyncKey(prev => prev + 1);
  }, [leftSrc, rightSrc]);

  // Synchronize GIFs once both are loaded
  useEffect(() => {
    if (imagesLoaded.left && imagesLoaded.right) {
      // Small delay to ensure both GIFs are ready, then show them simultaneously
      // This ensures both GIFs start playing from frame 0 at the same time
      const timer = setTimeout(() => {
        setShowImages(true);
        // Force restart by reloading the images to ensure they start from frame 0
        if (leftImgRef.current && rightImgRef.current) {
          const leftImg = leftImgRef.current;
          const rightImg = rightImgRef.current;
          
          // Temporarily hide and reload to restart GIFs
          const leftSrcTemp = leftImg.src;
          const rightSrcTemp = rightImg.src;
          
          // Clear and reload simultaneously
          leftImg.src = '';
          rightImg.src = '';
          
          requestAnimationFrame(() => {
            if (leftImgRef.current && rightImgRef.current) {
              leftImgRef.current.src = leftSrcTemp;
              rightImgRef.current.src = rightSrcTemp;
            }
          });
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded.left, imagesLoaded.right]);

  const handleLeftLoad = useCallback(() => {
    setImagesLoaded(prev => ({ ...prev, left: true }));
  }, []);

  const handleRightLoad = useCallback(() => {
    setImagesLoaded(prev => ({ ...prev, right: true }));
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setT(clamp01((clientX - rect.left) / Math.max(rect.width, 1)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) updateFromClientX(e.clientX);
  };
  const stopDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    try { containerRef.current?.releasePointerCapture(e.pointerId); } catch {}
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setT(v => clamp01(v - step)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setT(v => clamp01(v + step)); }
    if (e.key === 'Home')       { e.preventDefault(); setT(0); }
    if (e.key === 'End')        { e.preventDefault(); setT(1); }
  };

  const percent = Math.round(t * 100);
  const clip = `inset(0 ${100 - percent}% 0 0)`;
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';
  const posClass =
    objectPosition === 'left top' ? 'object-left-top' :
    objectPosition === 'left'     ? 'object-left' :
    objectPosition === 'right'    ? 'object-right' :
    objectPosition === 'top'      ? 'object-top' :
    objectPosition === 'bottom'   ? 'object-bottom' : 'object-center';

  return (
    <div
      ref={containerRef}
      className={[
        'relative overflow-hidden select-none touch-none',
        'rounded-xl shadow ring-1 ring-black/5 bg-black/5',
        className,
      ].join(' ')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onPointerLeave={stopDrag}
      onClick={(e) => updateFromClientX(e.clientX)}
    >
      {/* Sizer: keeps layout when using intrinsic image or aspect-[x/y] */}
      <img
        src={leftSrc}
        alt=""
        aria-hidden="true"
        className="block w-full h-auto opacity-0 pointer-events-none select-none"
        draggable={false}
        key={`sizer-${syncKey}`}
      />

      {/* Visible base (left) image — absolute, same fit/position as overlay */}
      {showImages && (
        <img
          ref={leftImgRef}
          src={leftSrc}
          alt={leftAlt}
          className={`absolute inset-0 w-full h-full ${fitClass} ${posClass} pointer-events-none select-none`}
          draggable={false}
          onLoad={handleLeftLoad}
          key={`left-${syncKey}`}
        />
      )}

      {/* Preload left image (hidden) */}
      {!showImages && (
        <img
          src={leftSrc}
          alt=""
          className="hidden"
          onLoad={handleLeftLoad}
          key={`preload-left-${syncKey}`}
        />
      )}

      {/* Visible overlay (right) image — absolute + clipped */}
      {showImages && (
        <img
          ref={rightImgRef}
          src={rightSrc}
          alt={rightAlt}
          className={`absolute inset-0 w-full h-full ${fitClass} ${posClass} pointer-events-none select-none`}
          style={{ clipPath: clip, WebkitClipPath: clip as any }}
          draggable={false}
          onLoad={handleRightLoad}
          key={`right-${syncKey}`}
        />
      )}

      {/* Preload right image (hidden) */}
      {!showImages && (
        <img
          src={rightSrc}
          alt=""
          className="hidden"
          onLoad={handleRightLoad}
          key={`preload-right-${syncKey}`}
        />
      )}

      {/* Divider / handle */}
      <div
        role="slider"
        aria-label="Image comparison position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute top-0 bottom-0 w-8 -ml-4 cursor-col-resize outline-none"
        style={{ left: `${percent}%` }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white/70 bg-black/40 backdrop-blur-sm" />
      </div>

      {leftLabel && (
        <div 
          className="absolute left-2 top-2 text-xs font-medium px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm"
          style={leftLabelColor ? { color: leftLabelColor } : {}}
        >
          {leftLabel}
        </div>
      )}
      {rightLabel && (
        <div 
          className="absolute right-2 top-2 text-xs font-medium px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm"
          style={rightLabelColor ? { color: rightLabelColor } : {}}
        >
          {rightLabel}
        </div>
      )}
    </div>
  );
}

function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }
