import { useState } from 'react';
import SmsHistoryPanel from '../../components/sms/SmsHistoryPanel';
import SmsSendModal from '../../components/sms/SmsSendModal';

const SmsPanel = ({ lead }) => {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">Promotional SMS</h3>
          <p className="text-xs text-brand-muted">
            Send an approved DLT template and review history for this lead.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsSendOpen(true)}
          className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
        >
          Send SMS
        </button>
      </div>

      <SmsHistoryPanel key={historyKey} leadId={lead?.id} compact />

      <SmsSendModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        mode="single"
        lead={lead}
        onComplete={() => {
          setHistoryKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default SmsPanel;
