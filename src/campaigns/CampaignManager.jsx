import { useMemo, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import { budgetLabel, objectiveLabel } from './campaignEntity';

const tabs = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'adsets', label: 'Ad sets' },
  { id: 'ads', label: 'Ads' },
];

const deliveryLabel = {
  active: 'Active',
  paused: 'Off',
  draft: 'Draft',
};

const CampaignManager = ({ campaigns, resumeSession, onCreate, onResume, onDiscardResume, onEdit, onDuplicate, onDelete, onToggle }) => {
  const [tab, setTab] = useState('campaigns');
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = [];
    campaigns.forEach((campaign) => {
      if (tab === 'campaigns') {
        list.push({
          key: campaign.id,
          campaign,
          name: campaign.campaignName || 'Untitled campaign',
          meta: `${objectiveLabel(campaign.objective)} · ${budgetLabel(campaign, campaign.adSets[0])}`,
          status: campaign.status,
        });
      }
      (campaign.adSets || []).forEach((adSet) => {
        if (tab === 'adsets') {
          list.push({
            key: adSet.id,
            campaign,
            adSet,
            name: adSet.adSetName || 'Untitled ad set',
            meta: `${campaign.campaignName || 'Campaign'} · ${budgetLabel(campaign, adSet)}`,
            status: adSet.status === 'paused' ? 'paused' : campaign.status,
          });
        }
        (adSet.ads || []).forEach((ad) => {
          if (tab === 'ads') {
            list.push({
              key: ad.id,
              campaign,
              adSet,
              ad,
              name: ad.adName || 'Untitled ad',
              meta: `${adSet.adSetName || 'Ad set'} · ${ad.pageName || 'No Page'}`,
              status: ad.status === 'paused' ? 'paused' : campaign.status,
            });
          }
        });
      });
    });
    return list.filter((row) => !needle || `${row.name} ${row.meta}`.toLowerCase().includes(needle));
  }, [campaigns, query, tab]);

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <section className="rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-yellow/30 px-4 py-4">
          <div className="flex gap-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === item.id ? 'bg-brand-navy text-white' : 'text-brand-navy hover:bg-brand-cream'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onCreate} className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-hover">
            + Create
          </button>
        </div>

        {resumeSession ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-yellow/30 bg-brand-yellow-soft px-4 py-3">
            <p className="text-sm text-brand-navy">You have an unpublished campaign. Continue setup or discard it.</p>
            <div className="flex gap-2">
              <button type="button" onClick={onDiscardResume} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-navy">Discard</button>
              <button type="button" onClick={onResume} className="rounded-lg bg-brand-navy px-3 py-1.5 text-sm font-semibold text-white">Continue</button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4">
          <label className="block min-w-[220px] flex-1">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-navy">Search</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name" className="w-full rounded-xl border border-brand-yellow/40 px-4 py-2.5 text-sm text-brand-navy outline-none focus:border-brand-navy" />
          </label>
          <p className="text-xs text-brand-muted">Results and amount spent stay blank until a Meta ad account is connected.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-y border-brand-yellow/30 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Off / On</th>
                <th className="px-4 py-3 font-semibold">{tabs.find((item) => item.id === tab)?.label.slice(0, -1) || 'Name'}</th>
                <th className="px-4 py-3 font-semibold">Delivery</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Results</th>
                <th className="px-4 py-3 font-semibold">Amount spent</th>
                <th className="px-4 py-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-base font-semibold text-brand-navy">No {tab === 'campaigns' ? 'campaigns' : tab === 'adsets' ? 'ad sets' : 'ads'} yet</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">Click + Create, choose Auction or Reservation, pick an objective, then Continue.</p>
                    <button type="button" onClick={onCreate} className="mt-4 rounded-xl bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-navy">+ Create</button>
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.key} className="border-b border-brand-yellow/20">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.status === 'active'}
                      aria-label={row.status === 'active' ? 'Turn off' : 'Turn on'}
                      onClick={() => onToggle(row)}
                      className={`relative h-6 w-11 rounded-full ${row.status === 'active' ? 'bg-brand-navy' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full ${row.status === 'active' ? 'left-5 bg-brand-yellow' : 'left-0.5 bg-white'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onEdit(row)} className="text-left">
                      <span className="block font-semibold text-brand-navy">{row.name}</span>
                      <span className="block text-xs text-brand-muted">{row.meta}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-brand-navy">{deliveryLabel[row.status] || 'Draft'}</td>
                  <td className="px-4 py-3 text-brand-navy">{budgetLabel(row.campaign, row.adSet || row.campaign.adSets[0])}</td>
                  <td className="px-4 py-3 text-brand-muted">—</td>
                  <td className="px-4 py-3 text-brand-muted">—</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => onEdit(row)} className="font-semibold text-brand-navy">Edit</button>
                      <button type="button" onClick={() => onDuplicate(row.campaign)} className="font-semibold text-brand-navy">Duplicate</button>
                      <button type="button" onClick={() => setPendingDelete(row.campaign)} className="font-semibold text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {pendingDelete ? (
        <ConfirmModal
          title="Delete this campaign?"
          message={`“${pendingDelete.campaignName || 'Untitled campaign'}” and its ad sets and ads will be removed from this workspace.`}
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            onDelete(pendingDelete);
            setPendingDelete(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default CampaignManager;
