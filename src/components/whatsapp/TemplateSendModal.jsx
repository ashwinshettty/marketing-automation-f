import { useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';
import { getTemplates } from '../../api/templateApi';
import { getTemplateBodyVariableCount } from '../../utils/whatsappTemplateValidation';

const inputClassName =
  'h-11 w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/40 px-4 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white';

const labelClassName = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted';

const TemplateSendModal = ({ isOpen, onClose, onSend, isSending }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [bodyParams, setBodyParams] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getTemplates({ status: 'APPROVED', limit: 100 });
        const list = Array.isArray(data?.data) ? data.data : [];
        setTemplates(list.filter((item) => item.status === 'APPROVED'));
      } catch {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTemplateSearch('');
      setSelectedName('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return undefined;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    if (!query) return templates;

    return templates.filter((template) => {
      const name = template.name?.toLowerCase() || '';
      const category = template.category?.toLowerCase() || '';
      const bodyText = template.bodyText?.toLowerCase() || '';
      return name.includes(query) || category.includes(query) || bodyText.includes(query);
    });
  }, [templates, templateSearch]);

  const selectedTemplate = templates.find((item) => item.name === selectedName);
  const variableCount = selectedTemplate
    ? getTemplateBodyVariableCount(selectedTemplate.bodyText, selectedTemplate.variables)
    : 0;

  const getVariableLabel = (index) => {
    const position = index + 1;
    const variable = selectedTemplate?.variables?.find((item) => item.position === position);
    if (variable?.key) return variable.key;
    if (variable?.example) return `Variable ${position} (e.g. ${variable.example})`;
    return `Variable ${position}`;
  };

  useEffect(() => {
    setBodyParams(Array.from({ length: variableCount }, () => ''));
  }, [selectedName, variableCount]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedTemplate) return;

    onSend({
      templateId: selectedTemplate._id || selectedTemplate.id,
      templateName: selectedTemplate.name,
      languageCode: selectedTemplate.language || 'en',
      bodyParams: bodyParams.slice(0, variableCount),
    });
  };

  const handleSelectTemplate = (name) => {
    setSelectedName(name);
    setTemplateSearch('');
    setIsDropdownOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-template-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-brand-yellow/30 bg-brand-cream px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="send-template-title" className="text-lg font-semibold text-brand-navy">
                Send template message
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Choose an approved template to send on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-muted transition hover:bg-white hover:text-brand-navy"
              aria-label="Close"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-brand-muted">Loading templates...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div
              className={`flex-1 space-y-4 px-5 py-4 ${
                isDropdownOpen ? 'overflow-hidden' : 'overflow-y-auto'
              }`}
            >
              <div ref={dropdownRef}>
                <span className={labelClassName}>Approved template</span>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  className={`flex h-11 w-full items-center justify-between rounded-xl border px-4 text-left text-sm transition ${
                    isDropdownOpen
                      ? 'border-brand-navy bg-white text-brand-navy'
                      : 'border-brand-yellow/40 bg-brand-cream/40 text-brand-navy hover:bg-brand-cream'
                  }`}
                >
                  <span className={selectedName ? 'font-medium' : 'text-brand-muted'}>
                    {selectedName || 'Select a template'}
                  </span>
                  <FaChevronDown
                    className={`h-3 w-3 text-brand-muted transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-brand-yellow/40 bg-white shadow-sm">
                    <div className="border-b border-brand-yellow/20 p-2">
                      <div className="relative">
                        <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
                        <input
                          type="search"
                          value={templateSearch}
                          onChange={(event) => setTemplateSearch(event.target.value)}
                          placeholder="Search templates..."
                          className="h-10 w-full rounded-lg border border-brand-yellow/30 bg-brand-cream/30 pl-9 pr-3 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white"
                          autoFocus
                        />
                      </div>
                    </div>

                    <ul className="max-h-44 overflow-y-auto py-1">
                      {filteredTemplates.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-brand-muted">No templates found</li>
                      ) : (
                        filteredTemplates.map((template) => (
                          <li key={template._id || template.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(template.name)}
                              className={`w-full px-4 py-2.5 text-left text-sm transition ${
                                selectedName === template.name
                                  ? 'bg-brand-cream font-medium text-brand-navy'
                                  : 'text-brand-navy hover:bg-brand-cream/60'
                              }`}
                            >
                              {template.name}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {variableCount > 0 &&
                Array.from({ length: variableCount }).map((_, index) => (
                  <label key={index} className="block">
                    <span className={labelClassName}>{getVariableLabel(index)}</span>
                    <input
                      type="text"
                      value={bodyParams[index] || ''}
                      onChange={(event) => {
                        const next = [...bodyParams];
                        next[index] = event.target.value;
                        setBodyParams(next);
                      }}
                      className={inputClassName}
                      required
                    />
                  </label>
                ))}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-brand-yellow/30 bg-white px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="rounded-xl border border-brand-yellow/40 px-4 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-cream disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !selectedName}
                className="rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1fb85a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? 'Sending...' : 'Send template'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TemplateSendModal;
