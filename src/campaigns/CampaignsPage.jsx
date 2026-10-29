import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CurrentCampaignPage from './CurrentCampaignPage';
import { SHOW_CURRENT_CAMPAIGN_UI } from './campaignUiFlag';
import MetaAdsCampaign from './MetaAdsCampaign';
import MetaAdsManagerList from './MetaAdsManagerList';
import CampaignPerformance from './performance/CampaignPerformance';

/**
 * Meta Ads Manager–style list + create/edit flow (default /campaign UI).
 * Header "Create Campaign" can open create via location.state.create.
 */
function MetaCampaignsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState(() => (location.state?.create ? 'create' : 'list'));
  const [editCampaignId, setEditCampaignId] = useState(null);
  const [performanceCampaign, setPerformanceCampaign] = useState(null);

  useEffect(() => {
    if (!location.state?.create) return;
    setEditCampaignId(null);
    setPerformanceCampaign(null);
    setView('create');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const openList = () => {
    setEditCampaignId(null);
    setPerformanceCampaign(null);
    setView('list');
  };

  if (view === 'performance' && performanceCampaign?.id) {
    return (
      <CampaignPerformance
        campaignId={performanceCampaign.id}
        campaignName={performanceCampaign.name}
        onBack={openList}
      />
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <MetaAdsCampaign
        campaignId={view === 'edit' ? editCampaignId : null}
        onClose={openList}
      />
    );
  }

  return (
    <MetaAdsManagerList
      onCreate={() => {
        setEditCampaignId(null);
        setPerformanceCampaign(null);
        setView('create');
      }}
      onEdit={(campaignId) => {
        setEditCampaignId(campaignId);
        setPerformanceCampaign(null);
        setView('edit');
      }}
      onCharts={(campaign) => {
        setPerformanceCampaign({
          id: campaign?.id,
          name: campaign?.campaignName || campaign?.name || '',
        });
        setView('performance');
      }}
    />
  );
}

const CampaignRoute = () => {
  if (SHOW_CURRENT_CAMPAIGN_UI) return <CurrentCampaignPage />;
  return <MetaCampaignsPage />;
};

export default CampaignRoute;
