import { useRef } from 'react';
import { AnimatedBeam } from '../components/magicui/animated-beam';
import { Surface } from './Surface';

const Node = ({ nodeRef, title, detail }) => (
  <div
    ref={nodeRef}
    className="relative z-10 w-36 rounded-xl border border-brand-navy/10 bg-white px-3 py-2 text-center shadow-sm"
  >
    <p className="text-xs font-semibold text-brand-navy">{title}</p>
    <p className="mt-1 text-[11px] leading-4 text-brand-muted">{detail}</p>
  </div>
);

const IntegrationFlow = () => {
  const containerRef = useRef(null);
  const metaRef = useRef(null);
  const googleRef = useRef(null);
  const crmRef = useRef(null);
  const reportRef = useRef(null);

  return (
    <Surface>
      <h2 className="text-sm font-semibold text-brand-navy">Where these figures come from</h2>
      <p className="mt-1 max-w-2xl text-xs text-brand-muted">
        Meta Ads and Google Ads are not connected, so spend and delivery stay blank. Lead counts on this page come from the CRM.
      </p>
      <div ref={containerRef} className="relative mt-4 flex min-h-28 flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Node nodeRef={metaRef} title="Meta Ads" detail="Not connected" />
          <Node nodeRef={googleRef} title="Google Ads" detail="Not connected" />
        </div>
        <Node nodeRef={crmRef} title="CRM leads" detail="In this report" />
        <Node nodeRef={reportRef} title="This page" detail="CRM figures only" />
        <AnimatedBeam containerRef={containerRef} fromRef={metaRef} toRef={crmRef} curvature={-12} />
        <AnimatedBeam containerRef={containerRef} fromRef={googleRef} toRef={crmRef} curvature={12} />
        <AnimatedBeam containerRef={containerRef} fromRef={crmRef} toRef={reportRef} />
      </div>
    </Surface>
  );
};

export default IntegrationFlow;
