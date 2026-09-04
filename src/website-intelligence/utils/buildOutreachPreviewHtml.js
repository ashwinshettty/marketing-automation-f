/**
 * Preview HTML mirroring backend buildOutreachHtml (inline CSS, same layout).
 * Supports ## section headers and - bullets for scannable campaign-style emails.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const IMAGE_MARKER_RE = /!\[([^\]]*)\]\(\s*(?:cid:)?(outreach-img-[a-zA-Z0-9_-]+)\s*\)/g;
const SIG_START_RE = /^(warm|best|kind)?\s*regards,?$|^cheers,?$/i;
const SECTION_RE = /^##\s+(.+)$/;
const BULLET_RE = /^[-*•]\s+(.+)$/;
const NUMBERED_RE = /^\d+[.)]\s+(.+)$/;

function isStructuredBody(lines) {
  return lines.some((line) => SECTION_RE.test(String(line).trim()));
}

function splitEmailParts(body) {
  const lines = String(body || '').split('\n');
  const sigIndex = lines.findIndex((line) => SIG_START_RE.test(line.trim()));
  const contentLines = sigIndex >= 0 ? lines.slice(0, sigIndex) : lines;
  const signatureLines = sigIndex >= 0 ? lines.slice(sigIndex) : [];

  if (isStructuredBody(contentLines)) {
    return {
      bodyLines: contentLines,
      ctaText: '',
      signatureLines,
    };
  }

  let ctaStart = contentLines.length;
  for (let i = contentLines.length - 1; i >= 0; i -= 1) {
    if (contentLines[i].trim()) {
      ctaStart = i;
      while (ctaStart > 0 && contentLines[ctaStart - 1].trim()) ctaStart -= 1;
      break;
    }
  }

  return {
    bodyLines: contentLines.slice(0, ctaStart),
    ctaText: contentLines.slice(ctaStart).filter((line) => line.trim()).join(' ').trim(),
    signatureLines,
  };
}

function resolveSrc(cid, byCid, resolveImageSrc) {
  const asset = byCid.get(cid);
  if (!asset) return null;
  if (typeof resolveImageSrc === 'function') return resolveImageSrc(asset);
  return asset.previewUrl || asset.url || null;
}

function renderInline(text, byCid, resolveImageSrc) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*])_(.+?)_([^*]|$)/g, '$1<em>$2</em>$3');
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" style="color:#4F46E5;text-decoration:underline;">$1</a>'
  );
  html = html.replace(
    /!\[([^\]]*)\]\((?:cid:)?(outreach-img-[a-zA-Z0-9_-]+)\)/g,
    (_, alt, cid) => {
      const src = resolveSrc(cid, byCid, resolveImageSrc);
      const asset = byCid.get(cid);
      if (!src || !asset) return '';
      return `</p><img src="${escapeHtml(src)}" alt="${escapeHtml(alt || asset.filename || 'image')}" style="display:block;width:100%;max-width:100%;height:auto;margin:16px 0;border:0;border-radius:8px;" /><p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3C3C42;">`;
    }
  );
  return html;
}

function renderBulletList(items, byCid, resolveImageSrc) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td class="bullet-mark" valign="top" style="width:18px;padding:0 8px 12px 0;font-size:15px;line-height:1.65;color:#4F46E5;font-weight:700;">•</td>
        <td class="bullet-text" valign="top" style="padding:0 0 12px;font-size:15px;line-height:1.65;color:#3C3C42;">${renderInline(item, byCid, resolveImageSrc)}</td>
      </tr>`
    )
    .join('');

  return `<table role="presentation" class="bullet-list" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:6px 0 20px;">${rows}</table>`;
}

function renderBodyParagraphs(lines, byCid, resolveImageSrc) {
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = String(lines[i] ?? '').trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    const sectionMatch = trimmed.match(SECTION_RE);
    if (sectionMatch) {
      blocks.push(
        `<h2 class="email-section" style="margin:26px 0 12px;font-size:16px;line-height:1.4;font-weight:700;color:#4F46E5;letter-spacing:-0.01em;">${escapeHtml(sectionMatch[1].trim())}</h2>`
      );
      i += 1;
      continue;
    }

    const bulletMatch = trimmed.match(BULLET_RE) || trimmed.match(NUMBERED_RE);
    if (bulletMatch) {
      const items = [];
      while (i < lines.length) {
        const row = String(lines[i] ?? '').trim();
        if (!row) break;
        const match = row.match(BULLET_RE) || row.match(NUMBERED_RE);
        if (!match) break;
        items.push(match[1].trim());
        i += 1;
      }
      if (items.length) blocks.push(renderBulletList(items, byCid, resolveImageSrc));
      continue;
    }

    const onlyImages = [...trimmed.matchAll(new RegExp(IMAGE_MARKER_RE.source, 'g'))];
    const withoutImages = trimmed.replace(new RegExp(IMAGE_MARKER_RE.source, 'g'), '').trim();

    if (onlyImages.length > 0 && !withoutImages) {
      const imgs = onlyImages
        .map(([, alt, cid]) => {
          const src = resolveSrc(cid, byCid, resolveImageSrc);
          const asset = byCid.get(cid);
          if (!src || !asset) return '';
          return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || asset.filename || 'image')}" style="display:block;width:100%;max-width:100%;height:auto;margin:16px 0;border:0;border-radius:8px;" />`;
        })
        .filter(Boolean)
        .join('');
      if (imgs) blocks.push(imgs);
      i += 1;
      continue;
    }

    blocks.push(
      `<p class="email-copy" style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3C3C42;">${renderInline(trimmed, byCid, resolveImageSrc)}</p>`
    );
    i += 1;
  }

  return blocks.join('\n');
}

function renderSignatureHtml(signatureLines) {
  return signatureLines
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return '';
      if (index === 0) {
        return `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#3C3C42;">${escapeHtml(trimmed)}</p>`;
      }
      if (index === 1) {
        return `<p style="margin:0 0 2px;font-size:15px;line-height:1.5;font-weight:600;color:#1A1A1E;">${escapeHtml(trimmed)}</p>`;
      }
      if (trimmed.includes('@')) {
        return `<p style="margin:0 0 2px;font-size:13px;line-height:1.5;"><a href="mailto:${escapeHtml(trimmed)}" style="color:#4F46E5;text-decoration:underline;">${escapeHtml(trimmed)}</a></p>`;
      }
      return `<p style="margin:0 0 2px;font-size:13px;line-height:1.5;color:#9C9CA5;">${escapeHtml(trimmed)}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

export function buildOutreachPreviewHtml({
  body,
  subject = '',
  imageAssets = [],
  callToAction: _callToAction = 'open_conversation',
  brandName = 'Talecraftor',
  website = 'https://talecraftor.com',
  logoUrl = null,
  resolveImageSrc = null,
} = {}) {
  const byCid = new Map((imageAssets || []).map((asset) => [asset.cid, asset]));
  const { bodyLines, signatureLines } = splitEmailParts(body);
  const bodyHtml = renderBodyParagraphs(bodyLines, byCid, resolveImageSrc);

  const logoBlock = logoUrl
    ? `<a href="${escapeHtml(website)}" style="text-decoration:none;display:inline-block;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;padding-right:10px;">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName)}" height="28" style="display:block;height:28px;width:auto;border:0;" />
            </td>
            <td style="vertical-align:middle;">
              <span style="font-size:16px;font-weight:600;color:#1A1A1E;letter-spacing:-0.01em;">${escapeHtml(brandName)}</span>
            </td>
          </tr>
        </table>
      </a>`
    : `<a href="${escapeHtml(website)}" style="text-decoration:none;font-size:16px;font-weight:600;color:#1A1A1E;">${escapeHtml(brandName)}</a>`;

  const subjectBlock = subject
    ? `<h1 class="email-title" style="margin:22px 0 8px;font-size:22px;line-height:1.3;font-weight:700;color:#1A1A1E;letter-spacing:-0.02em;">${escapeHtml(subject)}</h1>`
    : `<div style="height:20px;"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; background: #F4F4F6; }
    .email-wrapper, .email-shell, .email-card { width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-shell { padding: 0 !important; }
      .email-card {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
      .email-content {
        padding: 24px 18px 28px !important;
      }
      .email-title {
        font-size: 20px !important;
        line-height: 1.35 !important;
        margin: 16px 0 8px !important;
      }
      .email-section {
        font-size: 15px !important;
        margin: 22px 0 10px !important;
      }
      .email-copy, .bullet-text {
        font-size: 15px !important;
        line-height: 1.65 !important;
      }
      .bullet-mark {
        width: 14px !important;
        padding-right: 6px !important;
      }
      .email-divider {
        margin: 16px 0 18px !important;
        padding-bottom: 14px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#F4F4F6;">
  <table role="presentation" class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#F4F4F6;">
    <tr>
      <td class="email-shell" align="center" style="padding:24px 16px;">
        <table role="presentation" class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);font-family:Inter,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="padding:0;background-color:#4F46E5;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-content" style="padding:36px 40px 40px;">
              ${logoBlock}
              ${subjectBlock}
              <div class="email-divider" style="margin:0 0 22px;border-bottom:1px solid #EAEAEE;padding-bottom:18px;"></div>
              ${bodyHtml}
              <div style="margin:32px 0 20px;border-top:1px solid #EAEAEE;"></div>
              ${renderSignatureHtml(signatureLines)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
