import { formatNumber, formatPercent } from './format';

const groupTotal = (summary, key) =>
  summary?.actions?.groups?.find((group) => group.key === key)?.total || 0;

const pillar = (key, label, status, detail) => ({ key, label, status, detail });

const STAGE_LABEL = {
  demand: 'Demand',
  response: 'Response',
  fit: 'Fit',
  close: 'Close',
  early: 'Too early to call',
  proof: 'Return unproven',
  scale: 'Holding',
};

export const readBrand = (summary) => {
  const kpis = summary?.kpis || {};
  const leads = kpis.totalLeads?.value || 0;
  const qualified = kpis.qualifiedLeads?.value || 0;
  const converted = kpis.convertedLeads?.value || 0;
  const closeRate = kpis.conversionRate?.value;
  const leadChange = kpis.totalLeads?.percentChange;
  const qualRate = leads ? (qualified / leads) * 100 : null;
  const stages = summary?.funnel?.stages || [];
  const contacted = stages.find((stage) => stage.key === 'contacted');
  const contactReach = contacted?.percentOfCohort;
  const uncontacted = groupTotal(summary, 'uncontacted');
  const idle = groupTotal(summary, 'qualified_idle');
  const due = groupTotal(summary, 'follow_up_due');
  const cold = groupTotal(summary, 'cold');
  const missing = groupTotal(summary, 'missing_attribution');
  const weak = groupTotal(summary, 'weak_campaigns');
  const early = leads > 0 && leads < 5;

  let demand = pillar('demand', 'Demand', 'healthy', `${formatNumber(leads)} people in this window.`);
  if (!leads) {
    demand = pillar('demand', 'Demand', 'blocked', 'No new people in this window.');
  } else if (leadChange != null && leadChange <= -20) {
    demand = pillar('demand', 'Demand', 'watch', `Lead volume is down ${Math.abs(leadChange).toFixed(0)}% versus the previous window.`);
  } else if (leadChange != null && leadChange >= 20) {
    demand = pillar('demand', 'Demand', 'healthy', `Lead volume is up ${leadChange.toFixed(0)}% versus the previous window.`);
  }

  let response = pillar('response', 'Response', 'waiting', 'Follow-up can be judged once people are arriving.');
  if (!leads) {
    response = pillar('response', 'Response', 'waiting', 'Nothing to contact yet.');
  } else if (early) {
    response = pillar('response', 'Response', 'watch', 'Too few leads to call the follow-up system.');
  } else if (uncontacted >= 3 || uncontacted / leads >= 0.15 || (contactReach != null && contactReach < 50)) {
    response = pillar(
      'response',
      'Response',
      'blocked',
      `${formatNumber(uncontacted)} still new after 48 hours. ${formatPercent(contactReach)} of the cohort has been contacted.`,
    );
  } else if (due + cold >= 3) {
    response = pillar('response', 'Response', 'watch', `${formatNumber(due + cold)} open leads are due or have gone cold.`);
  } else {
    response = pillar('response', 'Response', 'healthy', 'First contact is keeping up with the enquiries.');
  }

  let fit = pillar('fit', 'Fit', 'waiting', 'Qualification shows up after the first conversation.');
  if (!leads || response.status === 'waiting') {
    fit = pillar('fit', 'Fit', 'waiting', 'Not enough contacted demand to judge fit.');
  } else if (early) {
    fit = pillar('fit', 'Fit', 'watch', 'The sample is too small for a quality call.');
  } else if (qualRate != null && qualRate < 20 && response.status === 'healthy') {
    fit = pillar('fit', 'Fit', 'blocked', `${formatPercent(qualRate)} qualified. The conversation is happening, and few people are a fit.`);
  } else if (qualRate != null && qualRate < 20) {
    fit = pillar('fit', 'Fit', 'watch', `${formatPercent(qualRate)} qualified. Fix response before rewriting the offer.`);
  } else {
    fit = pillar('fit', 'Fit', 'healthy', `${formatPercent(qualRate)} of this cohort is qualified.`);
  }

  let close = pillar('close', 'Close', 'waiting', 'Close rate is not the story until people are qualified.');
  if (!leads) {
    close = pillar('close', 'Close', 'waiting', 'No cohort to close.');
  } else if (qualified >= 3 && qualified && converted / qualified < 0.35) {
    close = pillar(
      'close',
      'Close',
      'blocked',
      `${formatNumber(converted)} of ${formatNumber(qualified)} qualified leads converted. The leak is the close, not the ad.`,
    );
  } else if (closeRate != null && closeRate < 8 && leads >= 10 && fit.status !== 'blocked') {
    close = pillar('close', 'Close', 'watch', `${formatPercent(closeRate)} of the cohort converted.`);
  } else if (converted > 0 && !qualified && leads >= 5) {
    close = pillar('close', 'Close', 'watch', `${formatNumber(converted)} converted, and none were marked qualified. The win is real. The fit step is not being used.`);
  } else if (converted > 0) {
    close = pillar('close', 'Close', 'healthy', `${formatNumber(converted)} CRM conversions. ${formatPercent(closeRate)} of the cohort.`);
  } else if (leads >= 5) {
    close = pillar('close', 'Close', 'watch', 'No CRM conversions recorded in this window.');
  }

  const pillars = [demand, response, fit, close];
  const order = ['demand', 'response', 'fit', 'close'];
  const blocked = order.map((key) => pillars.find((item) => item.key === key)).find((item) => item.status === 'blocked');
  const watched = order.map((key) => pillars.find((item) => item.key === key)).find((item) => item.status === 'watch');
  const revenueMissing = converted > 0 && kpis.revenue?.state !== 'available';

  let stage = 'early';
  let headline = 'Too little volume to judge the brand';
  let read = 'Wait for a fuller week before you change a message, a market, or a follow-up rule. A handful of leads will lie to you.';
  if (!leads) {
    stage = 'demand';
    headline = 'Demand is the constraint';
    read = 'Nothing entered the CRM in this window. Do not tune follow-up, creative, or city mix until people are arriving again.';
  } else if (blocked) {
    stage = blocked.key;
    if (blocked.key === 'demand') {
      headline = 'Demand is the constraint';
      read = 'The brand is not short of a sales process. It is short of people. Find which source slowed down before you rebuild the script.';
    } else if (blocked.key === 'response') {
      headline = 'The brand is being ignored after the enquiry';
      read = 'People are raising a hand, and too many are still untouched. This is an operating leak. It is not a reason to buy more media.';
    } else if (blocked.key === 'fit') {
      headline = 'The conversation is not finding the right people';
      read = 'Follow-up is happening, and qualification is thin. Look at who the campaigns attract before you push the close harder.';
    } else {
      headline = 'Qualified demand is leaking at the close';
      read = 'The brand can create interest and a fit. The enrolled result is not keeping up. Review the offer and the counseling close, not the lead count.';
    }
  } else if (early) {
    stage = 'early';
  } else if (revenueMissing && !watched) {
    stage = 'proof';
    headline = 'You are winning customers and you still cannot prove the return';
    read = 'Conversions are in the CRM. Recorded revenue or ad spend is not, so ROAS stays blank. A blank is not a zero. Do not scale budget from this page until both exist.';
  } else if (!watched) {
    stage = 'scale';
    headline = 'This period is holding. Grow what qualifies.';
    read = 'Demand, response, fit, and close are in range for this window. Protect the campaigns that qualify, and keep the first contact inside 48 hours.';
  } else {
    stage = watched.key;
    headline = `${watched.label} needs a watch, not a rebuild`;
    read = watched.detail;
  }

  const moves = [];
  if (uncontacted > 0) {
    moves.push({
      id: 'uncontacted',
      title: 'Clear the untouched queue',
      detail: `${formatNumber(uncontacted)} new leads are older than 48 hours.`,
      go: 'leads',
      action: 'Open leads',
    });
  }
  if (weak > 0) {
    moves.push({
      id: 'weak',
      title: 'Do not treat lead-only campaigns as winners',
      detail: `${formatNumber(weak)} campaigns have at least 5 leads and no CRM conversion. Check follow-up before you add budget.`,
      go: 'campaigns',
      action: 'Review campaigns',
    });
  }
  if (leads && missing / leads >= 0.2) {
    moves.push({
      id: 'attribution',
      title: 'Name the source before you judge the mix',
      detail: `${formatNumber(missing)} of ${formatNumber(leads)} leads have no source. Channel comparisons are incomplete.`,
      go: 'attribution',
      action: 'Review unattributed',
    });
  }
  if (idle > 0) {
    moves.push({
      id: 'idle',
      title: 'Give every qualified lead a next step',
      detail: `${formatNumber(idle)} qualified leads have no follow-up scheduled.`,
      go: 'leads',
      action: 'Open leads',
    });
  }
  if (!moves.length && leads) {
    moves.push({
      id: 'quality',
      title: 'Manage campaigns by who qualifies',
      detail: 'Lead count is the vanity number. Qualified and converted are the brand.',
      go: 'campaigns',
      action: 'Open campaigns',
    });
  }

  const focus = blocked || watched;
  return {
    stageLabel: STAGE_LABEL[stage] || 'Marketing stage',
    headline,
    detail: focus?.detail || read,
    move: moves[0] || null,
  };
};

const MarketingStage = ({ summary, onGo }) => {
  if (!summary) return null;
  const brand = readBrand(summary);

  return (
    <section className="flex min-w-0 max-w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-yellow/40 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Marketing stage · {brand.stageLabel}</p>
        <h2 className="mt-1 text-base font-semibold text-brand-navy">{brand.headline}</h2>
        <p className="mt-0.5 text-sm text-brand-muted">{brand.detail}</p>
      </div>
      {brand.move && (
        <button
          type="button"
          onClick={() => onGo?.(brand.move)}
          className="min-h-11 shrink-0 rounded-lg bg-brand-navy px-3 text-sm font-semibold text-white"
        >
          {brand.move.action}
        </button>
      )}
    </section>
  );
};

export default MarketingStage;
