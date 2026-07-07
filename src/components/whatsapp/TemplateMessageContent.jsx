import { useState } from 'react';
import {
  FaArrowUp,
  FaExternalLinkAlt,
  FaPhone,
  FaWhatsapp,
} from 'react-icons/fa';

const formatWhatsAppInlineText = (text) => {
  if (!text) return null;

  const parts = text.split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g);

  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }

    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith('~') && part.endsWith('~')) {
      return <s key={index}>{part.slice(1, -1)}</s>;
    }

    return <span key={index}>{part}</span>;
  });
};

const renderTemplateButtonIcon = (button) => {
  if (button.type === 'URL') {
    return <FaExternalLinkAlt className="h-3.5 w-3.5" />;
  }

  if (button.type === 'PHONE') {
    return button.subType === 'WHATSAPP' ? (
      <FaWhatsapp className="h-3.5 w-3.5" />
    ) : (
      <FaPhone className="h-3.5 w-3.5" />
    );
  }

  if (button.type === 'CUSTOM') {
    return <FaArrowUp className="h-3.5 w-3.5 rotate-45" />;
  }

  return null;
};

const TemplateHeaderImage = ({ src }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="block max-h-52 w-full object-cover"
    />
  );
};

const TemplateMessageContent = ({ templateContent, fallbackText = '' }) => {
  const bodyText = templateContent?.body || fallbackText;

  if (!templateContent) {
    return (
      <div className="whitespace-pre-wrap break-words px-3 py-2 text-[14.2px] leading-[19px] text-[#111b21]">
        {formatWhatsAppInlineText(bodyText)}
      </div>
    );
  }

  const { header, headerMedia, body, footer, buttons = [] } = templateContent;
  const headerText = header?.trim() || '';
  const footerText = footer?.trim() || '';
  const displayBody = body || fallbackText;
  const hasButtons = buttons.length > 0;
  const showHeaderImage = Boolean(headerMedia?.url);

  return (
    <div className="min-w-[220px] max-w-full">
      {showHeaderImage && <TemplateHeaderImage src={headerMedia.url} />}

      {(headerText || displayBody || footerText) && (
        <div className={`px-[9px] pt-[6px] ${hasButtons ? 'pb-[4px]' : 'pb-[6px]'}`}>
          {headerText && (
            <p className="mb-1 text-[16px] font-semibold leading-5 text-[#111b21]">
              {formatWhatsAppInlineText(headerText)}
            </p>
          )}

          {displayBody && (
            <div className="whitespace-pre-wrap break-words text-[14.2px] leading-[19px] text-[#111b21]">
              {formatWhatsAppInlineText(displayBody)}
            </div>
          )}

          {footerText && (
            <p className="mt-2 text-[13px] leading-[18px] text-[#667781]">{footerText}</p>
          )}
        </div>
      )}

      {hasButtons && (
        <div className="border-t border-[#00000014]">
          {buttons.map((button, index) => (
            <div
              key={`${button.text}-${index}`}
              className="flex items-center justify-center gap-2 border-b border-[#00000014] px-3 py-[10px] text-[14px] font-normal text-[#008069] last:border-b-0"
            >
              {renderTemplateButtonIcon(button)}
              <span>{button.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateMessageContent;
