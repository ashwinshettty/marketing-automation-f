import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CurrentCampaignPage from './CurrentCampaignPage';
import { SHOW_CURRENT_CAMPAIGN_UI } from './campaignUiFlag';
import MetaAdsCampaign from './MetaAdsCampaign';
import MetaAdsManagerList from './MetaAdsManagerList';

/**
 * Meta Ads Manager–style list + create flow (default /campaign UI).
 * Header "Create Campaign" can open create via location.state.create.
 */
function MetaCampaignsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState(() => (location.state?.create ? 'create' : 'list'));

  useEffect(() => {
    if (!location.state?.create) return;
    setView('create');
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  if (view === 'create') {
    return <MetaAdsCampaign onClose={() => setView('list')} />;
  }

  return <MetaAdsManagerList onCreate={() => setView('create')} />;
}

const CampaignRoute = () => {
  if (SHOW_CURRENT_CAMPAIGN_UI) return <CurrentCampaignPage />;
  return <MetaCampaignsPage />;
};

export default CampaignRoute;
