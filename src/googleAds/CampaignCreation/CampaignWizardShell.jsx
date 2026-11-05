import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createGoogleAdsCampaignDraft,
  submitGoogleAdsCampaign,
} from '../../api/googleAdsCampaignApi';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import {
  SEARCH_WIZARD_STEPS,
  createInitialSearchWizardState,
} from './searchWizardDefaults';
import { mapSearchWizardToDraft } from './mapSearchWizardToDraft';
import SearchSettingsStep from './SearchSettingsStep';
import SearchKeywordsAdsStep from './SearchKeywordsAdsStep';
import SearchBiddingBudgetStep from './SearchBiddingBudgetStep';
import SearchReviewStep from './SearchReviewStep';

function stepCanContinue(stepId, form) {
  if (stepId === 'settings') {
    const hasName = form.campaignName.trim() || form.campaignNamePlaceholder;
    const hasCustomLocation = form.locationMode !== 'ENTER_ANOTHER'
      || (form.locationItems || []).length > 0
      || (form.locationRadii || []).length > 0;
    return Boolean(hasName && form.euPoliticalAds && form.languages.length && hasCustomLocation);
  }
  if (stepId === 'ads') {
    const keywords = form.keywords.split('\n').map((l) => l.trim()).filter(Boolean);
    const headlines = form.headlines.filter((h) => h.trim());
    const descriptions = form.descriptions.filter((d) => d.trim());
    return Boolean(
      form.adGroupName.trim()
      && keywords.length
      && form.finalUrl.trim()
      && headlines.length >= 3
      && descriptions.length >= 2,
    );
  }
  if (stepId === 'bidding') {
    if (form.budgetType === 'TOTAL') {
      return Number(form.totalBudget) > 0 && Boolean(form.budgetStartDate && form.budgetEndDate);
    }
    return Number(form.dailyBudget) > 0;
  }
  return true;
}

function submitErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) {
    return data.errors.map((item) => item.message).filter(Boolean).join(' · ');
  }
  if (Array.isArray(data?.details) && data.details.length) {
    return data.details.join(' · ');
  }
  return error?.message || 'Failed to create campaign';
}

export default function CampaignWizardShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => createInitialSearchWizardState(location.state || {}));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  const step = SEARCH_WIZARD_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === SEARCH_WIZARD_STEPS.length - 1;
  const canNext = stepCanContinue(step.id, form);

  const stepContent = useMemo(() => {
    switch (step.id) {
      case 'settings':
        return <SearchSettingsStep value={form} onChange={setForm} />;
      case 'ads':
        return <SearchKeywordsAdsStep value={form} onChange={setForm} />;
      case 'bidding':
        return <SearchBiddingBudgetStep value={form} onChange={setForm} />;
      case 'review':
        return (
          <SearchReviewStep
            value={form}
            submitting={submitting}
            submitError={submitError}
            submitResult={submitResult}
          />
        );
      default:
        return null;
    }
  }, [step.id, form, submitting, submitError, submitResult]);

  const goBack = () => {
    if (isFirst) {
      navigate(`${GOOGLE_ADS_BASE}/create/objective`, { state: location.state });
      return;
    }
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    if (!canNext || isLast) return;
    setStepIndex((prev) => Math.min(SEARCH_WIZARD_STEPS.length - 1, prev + 1));
  };

  const handleSubmit = async () => {
    if (submitting || submitResult?.campaignId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = mapSearchWizardToDraft(form);
      const created = await createGoogleAdsCampaignDraft(body);
      const campaignId = created?.campaign?._id || created?.campaign?.id;
      if (!campaignId) {
        throw new Error('Draft was created without an id');
      }
      const submitted = await submitGoogleAdsCampaign(campaignId);
      setSubmitResult({
        campaignId: String(campaignId),
        status: submitted?.status || null,
        paused: Boolean(submitted?.paused),
        message: submitted?.message
          || (submitted?.paused
            ? 'Campaign created on Google Ads (PAUSED)'
            : 'Campaign created on Google Ads (ENABLED)'),
        googleResourceNames: submitted?.googleResourceNames || null,
      });
    } catch (error) {
      setSubmitError(submitErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled = submitting || Boolean(submitResult?.campaignId);

  return (
    <div className="flex min-h-full gap-0">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--ga-border)] bg-white px-3 py-6 lg:block">
        <nav aria-label="Campaign construction" className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(`${GOOGLE_ADS_BASE}/create/objective`, { state: location.state })}
            className="mb-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ga-hover)] text-[10px]">
              ✓
            </span>
            Objective
          </button>

          {SEARCH_WIZARD_STEPS.map((item, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (index <= stepIndex) setStepIndex(index);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    active
                      ? 'bg-[var(--ga-blue-soft)] font-medium text-[var(--ga-blue)]'
                      : index < stepIndex
                        ? 'text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]'
                        : 'cursor-default text-[var(--ga-muted)]'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      active
                        ? 'bg-[var(--ga-blue)] text-white'
                        : done
                          ? 'bg-[var(--ga-hover)] text-[var(--ga-muted)]'
                          : 'border border-[var(--ga-border)] text-[var(--ga-muted)]'
                    }`}
                  >
                    {done ? '✓' : index + 1}
                  </span>
                  {item.label}
                </button>
                {active && item.sections.length ? (
                  <ul className="mb-2 ml-10 mt-1 space-y-1">
                    {item.sections.map((section) => (
                      <li key={section} className="text-xs text-[var(--ga-muted)]">
                        {section}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="ga-scroll flex-1 overflow-y-auto px-6 py-8">
          <div className={`mx-auto ${step.id === 'ads' ? 'max-w-6xl' : 'max-w-3xl'}`}>
            {stepContent}
          </div>
        </div>

        <footer className="sticky bottom-0 border-t border-[var(--ga-border)] bg-white px-6 py-4">
          <div
            className={`mx-auto flex items-center justify-between gap-4 ${
              step.id === 'ads' ? 'max-w-6xl' : 'max-w-3xl'
            }`}
          >
            <button
              type="button"
              onClick={() => navigate(`${GOOGLE_ADS_BASE}/campaigns/overview`)}
              className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="rounded-full border border-[var(--ga-border)] px-5 py-2 text-sm font-medium text-[var(--ga-ink)] hover:bg-[var(--ga-hover)] disabled:opacity-50"
              >
                Back
              </button>
              {isLast ? (
                submitResult?.campaignId ? (
                  <button
                    type="button"
                    onClick={() => navigate(`${GOOGLE_ADS_BASE}/campaigns/list`)}
                    className="rounded-full bg-[var(--ga-blue)] px-5 py-2 text-sm font-medium text-white hover:brightness-95"
                  >
                    View campaigns
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitDisabled}
                    onClick={handleSubmit}
                    className={`rounded-full px-5 py-2 text-sm font-medium text-white transition ${
                      submitDisabled
                        ? 'cursor-not-allowed bg-[#a8c7fa]'
                        : 'bg-[var(--ga-blue)] hover:brightness-95'
                    }`}
                  >
                    {submitting ? 'Creating…' : 'Submit campaign'}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={goNext}
                  className={`rounded-full px-5 py-2 text-sm font-medium text-white transition ${
                    canNext
                      ? 'bg-[var(--ga-blue)] hover:brightness-95'
                      : 'cursor-not-allowed bg-[#a8c7fa]'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
