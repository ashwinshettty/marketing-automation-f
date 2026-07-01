import { useEffect, useState } from 'react';
import { getTemplates } from '../../api/templateApi';

const TemplateSendModal = ({ isOpen, onClose, onSend, isSending }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [bodyParams, setBodyParams] = useState(['']);
  const [loading, setLoading] = useState(false);

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

  const selectedTemplate = templates.find((item) => item.name === selectedName);
  const variableCount = selectedTemplate?.variables?.length || 0;

  useEffect(() => {
    setBodyParams(Array.from({ length: variableCount }, () => ''));
  }, [selectedName, variableCount]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedTemplate) return;

    onSend({
      templateName: selectedTemplate.name,
      languageCode: selectedTemplate.language || 'en',
      bodyParams: bodyParams.slice(0, variableCount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-brand-navy">Send template message</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-brand-muted hover:text-brand-navy"
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-brand-muted">Loading templates...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-muted">
                Approved template
              </label>
              <select
                value={selectedName}
                onChange={(event) => setSelectedName(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template._id || template.id} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {variableCount > 0 &&
              Array.from({ length: variableCount }).map((_, index) => (
                <div key={index}>
                  <label className="mb-1 block text-xs font-medium text-brand-muted">
                    Variable {index + 1}
                  </label>
                  <input
                    type="text"
                    value={bodyParams[index] || ''}
                    onChange={(event) => {
                      const next = [...bodyParams];
                      next[index] = event.target.value;
                      setBodyParams(next);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
              ))}

            <button
              type="submit"
              disabled={isSending || !selectedName}
              className="w-full rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1fb85a] disabled:opacity-60"
            >
              {isSending ? 'Sending...' : 'Send template'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TemplateSendModal;
