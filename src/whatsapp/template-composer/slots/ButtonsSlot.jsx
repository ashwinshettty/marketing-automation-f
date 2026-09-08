import { useState } from 'react';
import {
  FaArrowUp,
  FaChevronDown,
  FaExternalLinkAlt,
  FaPhone,
  FaPlus,
  FaTimes,
  FaWhatsapp,
} from 'react-icons/fa';
import { inputClass, labelClass } from '../../templates/templateUi';
import { BUTTON_TYPES, BUTTON_TEXT_MAX, COUNTRY_OPTIONS } from '../composerTypes';

const iconForType = (type) => {
  if (type === 'VisitWebsite') return FaExternalLinkAlt;
  if (type === 'CallWhatsApp') return FaWhatsapp;
  if (type === 'CallPhone') return FaPhone;
  if (type === 'CompleteFlow') return FaArrowUp;
  return FaArrowUp;
};

const MENU_ICONS = {
  arrow: FaArrowUp,
  link: FaExternalLinkAlt,
  whatsapp: FaWhatsapp,
  phone: FaPhone,
};

const ButtonsSlot = ({
  subtype,
  buttons,
  onAdd,
  onUpdate,
  onRemove,
  errors = {},
  hideLabel = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isFlow = subtype === 'FLOW';

  return (
    <div>
      {!hideLabel && (
        <>
          <label className={labelClass}>
            Buttons{' '}
            <span className="font-normal text-brand-muted">
              {isFlow ? 'flow CTA' : 'optional, up to 10'}
            </span>
          </label>
          <p className="mb-3 text-sm text-brand-muted">
            Create buttons that let customers respond to your message or take action.
            You can add up to ten buttons. If you add more than three buttons, they
            will appear in a list.
          </p>
        </>
      )}

      <div className="space-y-3">
        {buttons.map((button) => {
          const Icon = iconForType(button.type);
          const needsUrl = button.type === 'VisitWebsite';
          const needsPhone = button.type === 'CallPhone';

          return (
            <div
              key={button.id}
              className="rounded-xl border border-brand-yellow/40 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-cream text-brand-navy">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    type="text"
                    value={button.text}
                    maxLength={BUTTON_TEXT_MAX}
                    onChange={(event) => onUpdate(button.id, { text: event.target.value })}
                    placeholder="Button text"
                    className={inputClass}
                  />
                  {errors[`button_${button.id}_text`] ? (
                    <p className="text-sm text-red-600">
                      {errors[`button_${button.id}_text`]}
                    </p>
                  ) : null}

                  {needsUrl && (
                    <div>
                      <input
                        type="url"
                        value={button.websiteUrl}
                        onChange={(event) =>
                          onUpdate(button.id, { websiteUrl: event.target.value })
                        }
                        placeholder="https://example.com"
                        className={inputClass}
                      />
                      {errors[`button_${button.id}_url`] ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`button_${button.id}_url`]}
                        </p>
                      ) : null}
                    </div>
                  )}

                  {needsPhone && (
                    <div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          value={button.country}
                          onChange={(event) =>
                            onUpdate(button.id, { country: event.target.value })
                          }
                          className="rounded-xl border border-brand-yellow/40 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                        >
                          {COUNTRY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={button.phoneNumber}
                          onChange={(event) =>
                            onUpdate(button.id, { phoneNumber: event.target.value })
                          }
                          placeholder="Phone number"
                          className={inputClass}
                        />
                      </div>
                      {errors[`button_${button.id}_phone`] ? (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`button_${button.id}_phone`]}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
                {!isFlow && (
                  <button
                    type="button"
                    onClick={() => onRemove(button.id)}
                    className="mt-2 rounded-lg p-2 text-brand-muted hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove button"
                  >
                    <FaTimes className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {errors.buttons ? (
        <p className="mt-2 text-sm text-red-600">{errors.buttons}</p>
      ) : null}

      {!isFlow && buttons.length < 10 && (
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm font-medium text-brand-navy hover:bg-brand-cream"
          >
            <FaPlus className="h-3 w-3" />
            Add button
            <FaChevronDown className="h-3 w-3 text-brand-muted" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-brand-yellow/40 bg-white shadow-lg">
              {BUTTON_TYPES.map((type) => {
                const Icon = MENU_ICONS[type.icon] || FaArrowUp;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      onAdd(type.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm text-brand-navy last:border-b-0 hover:bg-brand-cream/60"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand-muted" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ButtonsSlot;
