import { useState } from 'react';
import ImageLightbox from './ImageLightbox';

export default function ScreenshotImage({
  src,
  alt,
  className = '',
  caption,
  buttonClassName = 'block cursor-zoom-in',
}) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
        aria-label={`View full size: ${alt}`}
      >
        <img src={src} alt={alt} className={className} loading="lazy" />
      </button>
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        src={src}
        alt={alt}
        caption={caption}
      />
    </>
  );
}
