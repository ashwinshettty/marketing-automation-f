import { useCallback, useEffect, useState } from 'react';
import SmsHistoryPanel from '../components/sms/SmsHistoryPanel';

const SmsHistoryPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(0);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-navy">SMS History</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Templates sent to leads via Fast2SMS / DLT.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>
      <SmsHistoryPanel key={refreshKey} />
    </div>
  );
};

export default SmsHistoryPage;
