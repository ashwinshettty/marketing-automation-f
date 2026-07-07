import { getTemplateHeaderImageUrl } from '../api/whatsappApi';

export const resolveTemplateContentForDisplay = (templateContent, templateId) => {
  if (!templateContent?.headerMedia) {
    return templateContent;
  }

  if (templateContent.headerMedia.url) {
    return templateContent;
  }

  const resolvedTemplateId = templateContent.headerMedia.templateId || templateId;
  if (!resolvedTemplateId) {
    const { headerMedia, ...rest } = templateContent;
    return rest;
  }

  const url = getTemplateHeaderImageUrl(resolvedTemplateId);
  if (!url) {
    const { headerMedia, ...rest } = templateContent;
    return rest;
  }

  return {
    ...templateContent,
    headerMedia: {
      ...templateContent.headerMedia,
      type: 'image',
      url,
      templateId: String(resolvedTemplateId),
    },
  };
};
