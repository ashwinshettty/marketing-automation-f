import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import CampaignEditor from './CampaignEditor';
import CampaignManager from './CampaignManager';
import ObjectiveScreen from './ObjectiveScreen';
import { applyObjective, canPublish, createCampaign, validateAll } from './campaignEntity';
import {
  clearWizardSession,
  loadCampaigns,
  loadWizardSession,
  saveCampaigns,
  saveWizardSession,
} from './campaignStore';

const CurrentCampaignPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(() => loadCampaigns());
  const [screen, setScreen] = useState({ mode: 'table' });
  const [resume, setResume] = useState(() => loadWizardSession());

  const persist = (next) => {
    setCampaigns(next);
    saveCampaigns(next);
  };

  const openCreate = () => {
    clearWizardSession();
    setResume(null);
    setScreen({ mode: 'objective', campaign: createCampaign() });
  };

  useEffect(() => {
    if (!location.state?.create) return;
    clearWizardSession();
    setResume(null);
    setScreen({ mode: 'objective', campaign: createCampaign() });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (screen.mode === 'table' || !screen.campaign?.objective) return;
    saveWizardSession({ campaign: screen.campaign, mode: screen.mode, selection: screen.selection });
  }, [screen]);

  const upsert = (campaign, status) => {
    const nextCampaign = { ...campaign, status, updatedAt: new Date().toISOString() };
    const exists = campaigns.some((item) => item.id === nextCampaign.id);
    persist(exists
      ? campaigns.map((item) => (item.id === nextCampaign.id ? nextCampaign : item))
      : [nextCampaign, ...campaigns]);
    clearWizardSession();
    setResume(null);
    setScreen({ mode: 'table' });
    return nextCampaign;
  };

  if (screen.mode === 'objective' && screen.campaign) {
    return (
      <ObjectiveScreen
        buyingType={screen.campaign.buyingType}
        objective={screen.campaign.objective}
        onBuyingType={(buyingType) => {
          const objective = buyingType === 'reservation' && screen.campaign.objective !== 'awareness'
            ? ''
            : screen.campaign.objective;
          setScreen({
            mode: 'objective',
            campaign: { ...screen.campaign, buyingType, objective },
          });
        }}
        onObjective={(objective) => setScreen({
          mode: 'objective',
          campaign: applyObjective(screen.campaign, objective),
        })}
        onContinue={() => setScreen({
          mode: 'editor',
          campaign: screen.campaign,
          selection: { level: 'campaign' },
        })}
        onClose={() => {
          if (!screen.campaign.objective) clearWizardSession();
          setResume(loadWizardSession());
          setScreen({ mode: 'table' });
        }}
      />
    );
  }

  if (screen.mode === 'editor' && screen.campaign) {
    return (
      <CampaignEditor
        key={screen.campaign.id}
        campaign={screen.campaign}
        initialSelection={screen.selection}
        onChange={(campaign) => setScreen((current) => ({ ...current, campaign }))}
        onBackToObjective={() => setScreen({ mode: 'objective', campaign: screen.campaign })}
        onClose={() => {
          if (screen.campaign.campaignName.trim() || campaigns.some((item) => item.id === screen.campaign.id)) {
            const existing = campaigns.find((item) => item.id === screen.campaign.id);
            upsert(screen.campaign, existing?.status || 'draft');
            toast.success('Campaign saved. You can finish it from the list.');
            return;
          }
          setResume(loadWizardSession());
          setScreen({ mode: 'table' });
        }}
        onPublish={() => {
          if (!canPublish(screen.campaign)) {
            const { campaignErrors, adSetErrors } = validateAll(screen.campaign);
            toast.error(campaignErrors[0] || adSetErrors[0]?.message || 'Finish the required fields.');
            return;
          }
          upsert(screen.campaign, 'active');
          toast.success('Campaign published in this workspace. Connect a Meta ad account to send it to Ads Manager.');
        }}
      />
    );
  }

  return (
    <CampaignManager
      campaigns={campaigns}
      resumeSession={resume}
      onCreate={openCreate}
      onResume={() => {
        const session = loadWizardSession();
        if (!session?.campaign) return;
        setScreen({
          mode: session.mode === 'objective' ? 'objective' : 'editor',
          campaign: session.campaign,
          selection: session.selection || { level: 'campaign' },
        });
      }}
      onDiscardResume={() => {
        clearWizardSession();
        setResume(null);
      }}
      onEdit={(row) => setScreen({
        mode: 'editor',
        campaign: row.campaign,
        selection: row.ad
          ? { level: 'ad', adSetId: row.adSet.id, adId: row.ad.id }
          : row.adSet
            ? { level: 'adset', adSetId: row.adSet.id }
            : { level: 'campaign' },
      })}
      onDuplicate={(campaign) => {
        const copy = {
          ...campaign,
          id: createCampaign().id,
          campaignName: `${campaign.campaignName || 'Untitled campaign'} copy`,
          status: 'paused',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          adSets: campaign.adSets.map((adSet) => ({
            ...adSet,
            id: createCampaign().id,
            ads: adSet.ads.map((ad) => ({ ...ad, id: createCampaign().id })),
          })),
        };
        persist([copy, ...campaigns]);
        toast.success('Campaign duplicated and turned off.');
      }}
      onDelete={(campaign) => {
        persist(campaigns.filter((item) => item.id !== campaign.id));
        toast.success('Campaign deleted from this workspace.');
      }}
      onToggle={(row) => {
        const turningOn = row.status !== 'active';
        if (turningOn && row.campaign.status !== 'active' && !canPublish(row.campaign)) {
          const { campaignErrors, adSetErrors } = validateAll(row.campaign);
          toast.error(campaignErrors[0] || adSetErrors[0]?.message || 'Finish the required fields before turning it on.');
          setScreen({ mode: 'editor', campaign: row.campaign, selection: { level: 'campaign' } });
          return;
        }
        const status = turningOn ? 'active' : 'paused';
        persist(campaigns.map((item) => (
          item.id === row.campaign.id ? { ...item, status, updatedAt: new Date().toISOString() } : item
        )));
        toast.success(turningOn ? 'Campaign turned on in this workspace.' : 'Campaign turned off.');
      }}
    />
  );
};

export default CurrentCampaignPage;
