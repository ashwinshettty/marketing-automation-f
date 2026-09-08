import TemplateMessageContent from '../../components/whatsapp/TemplateMessageContent';
import { getTemplateHeaderImageUrl } from '../../api/whatsappApi';
import { resolveTemplateContentForDisplay } from '../../utils/resolveTemplateContentForDisplay';
import { extractTemplateVariablePositions } from '../../utils/whatsappTemplateValidation';
import { useTemplatePreview } from './TemplatePreviewContext';

const fillPlaceholders = (text, positions, bodyParams) => {
  if (!text) return '';

  let result = text;
  positions.forEach((position, index) => {
    const value = bodyParams[index];
    const replacement =
      value !== undefined && value !== null && String(value).trim() !== ''
        ? String(value)
        : `{{${position}}}`;

    result = result.replace(
      new RegExp(`\\{\\{${position}\\}\\}`, 'g'),
      replacement,
    );
  });

  return result;
};

export const buildTemplatePreviewContent = (template, bodyParams = []) => {
  if (!template) return null;

  const positions = extractTemplateVariablePositions(template.bodyText);
  const body = fillPlaceholders(template.bodyText, positions, bodyParams);
  const header = fillPlaceholders(template.headerText, positions, bodyParams);
  const footer = template.footerText || '';
  const templateId = template._id || template.id;

  const mediaUrl =
    template.media?.url ||
    (template.media?.type === 'IMAGE' || template.headerType === 'IMAGE'
      ? getTemplateHeaderImageUrl(templateId)
      : '');

  return resolveTemplateContentForDisplay(
    {
      header: header || undefined,
      body,
      footer: footer || undefined,
      buttons: Array.isArray(template.buttons) ? template.buttons : [],
      headerMedia: mediaUrl
        ? {
            type: 'image',
            url: mediaUrl,
            templateId: templateId ? String(templateId) : undefined,
          }
        : undefined,
    },
    templateId,
  );
};

const TemplatePreview = () => {
  const { previewTemplate, bodyParams } = useTemplatePreview();

  if (!previewTemplate) {
    return (
      <div className="rounded-xl border border-dashed border-brand-yellow/40 bg-brand-cream/30 px-4 py-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Template preview
        </p>
        <p className="mt-2 text-sm text-brand-muted">
          Select a template to preview the message.
        </p>
      </div>
    );
  }

  const templateContent = buildTemplatePreviewContent(previewTemplate, bodyParams);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        Template preview
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#efeae2] p-4">
        <div className="ml-auto max-w-[min(100%,280px)] overflow-hidden rounded-lg bg-[#d9fdd3] shadow-sm">
          <TemplateMessageContent
            templateContent={templateContent}
            fallbackText={previewTemplate.bodyText || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
