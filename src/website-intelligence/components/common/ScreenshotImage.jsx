import { useEffect, useState } from 'react';
import ImageLightbox from './ImageLightbox';
import { isProtectedWiUrl, loadProtectedImageSrc } from '../../api/client';

export default function ScreenshotImage({
  src,
  alt,
  className = '',
  caption,
  buttonClassName = 'block cursor-zoom-in',
}) {
  const [open, setOpen] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(() => (isProtectedWiUrl(src) ? null : src));

  useEffect(() => {
    let cancelled = false;
    if (!src || !isProtectedWiUrl(src)) {
      setDisplaySrc(src || null);
      return undefined;
    }
    setDisplaySrc(null);
    loadProtectedImageSrc(src)
      .then((next) => {
        if (!cancelled) setDisplaySrc(next);
      })
      .catch(() => {
        if (!cancelled) setDisplaySrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src || !displaySrc) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
        aria-label={`View full size: ${alt}`}
      >
        <img src={displaySrc} alt={alt} className={className} loading="lazy" />
      </button>
      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        src={displaySrc}
        alt={alt}
        caption={caption}
      />
    </>
  );
}
