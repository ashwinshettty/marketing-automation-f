import { formatPath } from '../../utils/formatters';
import { getPageScreenshotUrl } from '../../utils/screenshots';
import ScreenshotImage from '../common/ScreenshotImage';

export default function CapabilityEvidenceScreenshots({ auditId, evidencePages = [], limit = 3 }) {
  const items = evidencePages.slice(0, limit);

  if (!items.length) return null;

  return (
    <div className="mt-4">
      <p className="meta-text mb-2 text-xs font-medium uppercase tracking-wide">Detected on page</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ url, page }) => {
          const screenshotSrc = getPageScreenshotUrl(auditId, page);
          const title = page.title || 'Untitled page';

          return (
            <div key={page.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {screenshotSrc ? (
                <ScreenshotImage
                  src={screenshotSrc}
                  alt={`Screenshot where ${title} was detected`}
                  caption={title}
                  className="h-32 w-full object-cover object-top transition-opacity hover:opacity-90"
                  buttonClassName="block w-full cursor-zoom-in"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-muted text-xs text-muted-foreground">
                  No screenshot available
                </div>
              )}
              <div className="p-2.5">
                <p className="truncate text-sm font-medium text-foreground">{title}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block truncate font-mono text-xs text-brand hover:underline"
                  title={url}
                >
                  {formatPath(url)}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
