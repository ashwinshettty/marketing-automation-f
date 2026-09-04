import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '../../api/client';

const IMAGE_MARKER_RE = /!\[([^\]]*)\]\(\s*(?:cid:)?(outreach-img-[a-zA-Z0-9_-]+)\s*\)/g;

function parseBodyBlocks(body) {
  const text = String(body || '');
  const blocks = [];
  let lastIndex = 0;
  const re = new RegExp(IMAGE_MARKER_RE.source, 'g');
  let match;

  while ((match = re.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before.length) {
      blocks.push({ type: 'text', value: before });
    }
    blocks.push({
      type: 'image',
      alt: match[1] || 'image',
      cid: match[2],
      marker: match[0],
    });
    lastIndex = match.index + match[0].length;
  }

  const rest = text.slice(lastIndex);
  if (rest.length || blocks.length === 0) {
    blocks.push({ type: 'text', value: rest });
  }

  return blocks;
}

function serializeBlocks(blocks) {
  return blocks
    .map((block) => {
      if (block.type === 'image') return block.marker;
      return block.value;
    })
    .join('')
    .replace(/\n{3,}/g, '\n\n');
}

function resolveImageSrc(cid, imageAssets, auditId, emailId) {
  const asset = (imageAssets || []).find((item) => item.cid === cid);
  if (!asset) return null;
  if (asset.previewUrl || asset.url) return asset.previewUrl || asset.url;
  if (auditId && emailId && asset.id) {
    return api.getOutreachImageUrl(auditId, emailId, asset.id);
  }
  return null;
}

function autoResize(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
}

export default function EmailEditor({
  value,
  onChange,
  onUploadImage,
  onRemoveImage,
  uploadingImage = false,
  imageUploadDisabled = false,
  imageAssets = [],
  auditId,
  emailId,
}) {
  const fileInputRef = useRef(null);
  const activeTextIndexRef = useRef(0);
  const textAreaRefs = useRef({});
  const [localError, setLocalError] = useState('');
  const [removingCid, setRemovingCid] = useState('');

  const blocks = useMemo(() => parseBodyBlocks(value), [value]);

  useEffect(() => {
    Object.values(textAreaRefs.current).forEach((node) => autoResize(node));
  }, [blocks]);

  const updateTextBlock = (blockIndex, nextText) => {
    const nextBlocks = blocks.map((block, index) =>
      index === blockIndex && block.type === 'text' ? { ...block, value: nextText } : block
    );
    onChange(serializeBlocks(nextBlocks));
  };

  const getActiveTextarea = () => {
    const preferred = textAreaRefs.current[activeTextIndexRef.current];
    if (preferred) return preferred;
    return Object.values(textAreaRefs.current).find(Boolean) || null;
  };

  const handleImageClick = () => {
    setLocalError('');
    if (imageUploadDisabled || !onUploadImage) {
      setLocalError('Save or generate a draft before adding images.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setLocalError('');
    const textarea = getActiveTextarea();
    const blockIndex = textarea ? Number(textarea.dataset.blockIndex) : 0;

    let insertAt = 0;
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      if (i === blockIndex && block.type === 'text') {
        insertAt += textarea?.selectionStart ?? block.value.length;
        break;
      }
      insertAt += block.type === 'image' ? block.marker.length : block.value.length;
    }

    if (!textarea) {
      insertAt = String(value || '').length;
    }

    try {
      await onUploadImage(file, insertAt);
    } catch (err) {
      setLocalError(err.message || 'Failed to upload image');
    }
  };

  const handleRemoveImage = async (block) => {
    if (!onRemoveImage) {
      const nextBlocks = blocks.filter((item) => !(item.type === 'image' && item.cid === block.cid));
      onChange(serializeBlocks(nextBlocks));
      return;
    }

    const asset = (imageAssets || []).find((item) => item.cid === block.cid);
    if (!asset?.id) {
      const nextBlocks = blocks.filter((item) => !(item.type === 'image' && item.cid === block.cid));
      onChange(serializeBlocks(nextBlocks));
      return;
    }

    setRemovingCid(block.cid);
    setLocalError('');
    try {
      await onRemoveImage(asset.id);
    } catch (err) {
      setLocalError(err.message || 'Failed to remove image');
    } finally {
      setRemovingCid('');
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">Edit message body</p>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImageClick}
            disabled={uploadingImage || imageUploadDisabled}
            aria-label="Add image"
            title="Add image"
          >
            {uploadingImage ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {uploadingImage ? 'Uploading…' : 'Add image'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {localError ? (
        <p className="border-b border-destructive/20 bg-destructive-subtle px-3 py-2 text-xs text-destructive">
          {localError}
        </p>
      ) : null}

      <div className="space-y-3 px-4 py-3">
        {blocks.map((block, index) => {
          if (block.type === 'image') {
            const src = resolveImageSrc(block.cid, imageAssets, auditId, emailId);
            return (
              <div
                key={`image-${block.cid}-${index}`}
                className="overflow-hidden rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
                  <p className="truncate text-xs text-muted-foreground">{block.alt}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveImage(block)}
                    disabled={removingCid === block.cid}
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    {removingCid === block.cid ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  </Button>
                </div>
                {src ? (
                  <img
                    src={src}
                    alt={block.alt || 'Email image'}
                    className="block h-auto w-full max-w-full object-contain"
                  />
                ) : (
                  <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Image attached ({block.alt || block.cid})
                  </p>
                )}
              </div>
            );
          }

          return (
            <textarea
              key={`text-${index}`}
              id={index === 0 ? 'outreach-email-body' : undefined}
              ref={(node) => {
                if (node) textAreaRefs.current[index] = node;
                else delete textAreaRefs.current[index];
              }}
              data-block-index={index}
              value={block.value}
              onFocus={() => {
                activeTextIndexRef.current = index;
              }}
              onChange={(e) => {
                updateTextBlock(index, e.target.value);
                autoResize(e.target);
              }}
              rows={Math.max(4, block.value.split('\n').length + 1)}
              className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed outline-none"
              placeholder={index === 0 ? 'Write your outreach email…' : 'Continue writing…'}
            />
          );
        })}
      </div>
    </div>
  );
}
