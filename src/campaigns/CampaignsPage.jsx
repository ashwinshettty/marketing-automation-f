import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CurrentCampaignPage from './CurrentCampaignPage';
import { SHOW_CURRENT_CAMPAIGN_UI } from './campaignUiFlag';
import MetaAdsCampaign from './MetaAdsCampaign';
import MetaAdsManagerList from './MetaAdsManagerList';

/**
 * Meta Ads Manager–style list + create/edit flow (default /campaign UI).
 * Header "Create Campaign" can open create via location.state.create.
 */
function MetaCampaignsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState(() => (location.state?.create ? 'create' : 'list'));
  const [editCampaignId, setEditCampaignId] = useState(null);

  useEffect(() => {
    if (!location.state?.create) return;
    setEditCampaignId(null);
    setView('create');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const openList = () => {
    setEditCampaignId(null);
    setView('list');
  };

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
        setView('create');
      }}
      onEdit={(campaignId) => {
        setEditCampaignId(campaignId);
        setView('edit');
      }}
    />
  );
}

const CampaignRoute = () => {
  if (SHOW_CURRENT_CAMPAIGN_UI) return <CurrentCampaignPage />;
  return <MetaCampaignsPage />;
};

export default CampaignRoute;
