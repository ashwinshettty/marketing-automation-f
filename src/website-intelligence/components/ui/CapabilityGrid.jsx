import { motion } from 'motion/react';
import StatusIcon, { capabilityStatusKind } from '../common/StatusIcon';
import { rowItem, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';

const STATUS_TEXT = {
  detected: 'Detected',
  likely: 'Likely present',
  confirmed_missing: 'Not publicly detected',
  unverified: 'Could not verify',
  not_observable: 'Not observable from a public site',
};

export default function CapabilityGrid({ capabilities = [], animate = true }) {
  if (!capabilities.length) {
    return <p className="body-text">No capabilities analyzed yet.</p>;
  }

  const Wrapper = animate ? motion.ul : 'ul';
  const Item = animate ? motion.li : 'li';
  const wrapperProps = animate
    ? { variants: staggerContainer, initial: 'initial', animate: 'animate' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {capabilities.map((cap) => {
        const kind = capabilityStatusKind(cap);
        const isPresent = kind === 'detected' || kind === 'likely';
        const cellClass = isPresent
          ? 'cap-cell-detected'
          : kind === 'confirmed_missing'
            ? 'cap-cell-missing'
            : 'cap-cell-dim';
        const name = cap.name || cap.capability;

        return (
          <Item
            key={cap.id || cap.capability}
            {...(animate ? { variants: rowItem } : {})}
            className={cn('cap-cell transition-colors', cellClass)}
            title={cap.publicObservation || name}
          >
            <StatusIcon kind={kind} className="size-3.5!" />
            <span className="cap-cell-label">{name}</span>
            <span className="sr-only">— {STATUS_TEXT[kind] || 'Unknown'}</span>
          </Item>
        );
      })}
    </Wrapper>
  );
}
