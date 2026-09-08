import { useEffect, useMemo, useState } from 'react';
import TemplateMessageContent from '../../components/whatsapp/TemplateMessageContent';
import { mapButtonsToBackend } from './templatePayload';

const fillSamples = (text, samples, section) => {
  if (!text) return '';
  return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
    const sample = samples[`${section}_${num}`];
    return sample && String(sample).trim() ? String(sample) : match;
  });
};

const LivePreview = ({
  subtype,
  headerText,
  bodyText,
  footerText,
  buttons,
  mediaSample,
  uploadedFile,
  existingMediaUrl,
  variableSamples,
}) => {
  const [filePreview, setFilePreview] = useState('');

  useEffect(() => {
    if (!uploadedFile) {
      setFilePreview('');
      return undefined;
    }
    const url = URL.createObjectURL(uploadedFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const imageUrl =
    mediaSample === 'Image' ? filePreview || existingMediaUrl || '' : '';

  const templateContent = useMemo(() => {
    const showChrome = subtype !== 'TEXT';
    const header =
      showChrome && mediaSample === 'None'
        ? fillSamples(headerText, variableSamples, 'header')
        : '';
    const body = fillSamples(bodyText, variableSamples, 'body') || '';
    const footer = showChrome ? footerText || '' : '';
    const mappedButtons = showChrome ? mapButtonsToBackend(buttons) : [];

    return {
      header: header || undefined,
      body: body || 'Your message will appear here…',
      footer: footer || undefined,
      buttons: mappedButtons,
      headerMedia: imageUrl
        ? { type: 'image', url: imageUrl }
        : undefined,
    };
  }, [
    subtype,
    headerText,
    bodyText,
    footerText,
    buttons,
    mediaSample,
    imageUrl,
    variableSamples,
  ]);

  const isEmpty =
    !bodyText.trim() &&
    !headerText.trim() &&
    !footerText.trim() &&
    !imageUrl &&
    buttons.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-brand-navy">Live preview</p>
        <p className="mt-0.5 text-xs text-brand-muted">
          How this template looks on WhatsApp
        </p>
      </div>
      <div className="bg-[#efeae2] px-4 py-6">
        <div className="mx-auto max-w-[280px] overflow-hidden rounded-lg bg-[#d9fdd3] shadow-sm">
          {isEmpty ? (
            <div className="px-4 py-8 text-center text-sm text-[#667781]">
              Start typing on the left — the message preview updates here.
            </div>
          ) : (
            <TemplateMessageContent
              templateContent={templateContent}
              fallbackText={bodyText || ''}
            />
          )}
        </div>
        <p className="mt-3 text-center text-[11px] text-brand-muted">
          Variables show sample values when you fill them below the editor.
        </p>
      </div>
    </div>
  );
};

export default LivePreview;
