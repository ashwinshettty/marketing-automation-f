import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GaIcon } from '../icons/GoogleAdsIcons';
import { getPrimarySection } from './googleAdsNavConfig';

function LeafLink({ item, nested = false }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center justify-between gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
          nested ? 'ml-3' : ''
        } ${
          isActive
            ? 'bg-[var(--ga-blue)] font-medium text-white'
            : 'text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]'
        }`
      }
    >
      <span className="truncate">{item.label}</span>
      {item.badge === 'BETA' ? (
        <span className="rounded bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-semibold text-[#137333]">
          BETA
        </span>
      ) : null}
      {item.badge === 'dot' ? (
        <span className="h-2 w-2 rounded-full bg-[#d93025]" aria-label="New" />
      ) : null}
    </NavLink>
  );
}

function ExpandableItem({ item }) {
  const { pathname } = useLocation();
  const childActive = (item.children || []).some((child) => pathname.startsWith(child.path));
  const [open, setOpen] = useState(childActive || false);

  return (
    <div>
      <div className="flex items-center gap-1">
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `min-w-0 flex-1 truncate rounded-full px-3 py-2 text-sm transition-colors ${
              isActive || childActive
                ? 'bg-[var(--ga-blue)] font-medium text-white'
                : 'text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]'
            }`
          }
        >
          {item.label}
        </NavLink>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}`}
          onClick={() => setOpen((value) => !value)}
          className="rounded-full p-2 text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
        >
          <GaIcon
            name="chevron"
            className={`h-4 w-4 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>
      </div>
      {open ? (
        <div className="mt-1 space-y-0.5 border-l border-[var(--ga-border)] ml-4 pl-1">
          {(item.children || []).map((child) => (
            <LeafLink key={child.id} item={child} nested />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavGroupBlock({ group }) {
  const [open, setOpen] = useState(group.defaultOpen !== false);
  const hasLabel = Boolean(group.label);

  return (
    <div className="space-y-1">
      {hasLabel && group.collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
        >
          <span>{group.label}</span>
          <GaIcon
            name="chevron"
            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>
      ) : hasLabel ? (
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--ga-muted)]">
          {group.label}
        </div>
      ) : null}

      {(!group.collapsible || open) && (
        <div className="space-y-0.5">
          {group.items.map((item) =>
            item.children?.length ? (
              <ExpandableItem key={item.id} item={item} />
            ) : (
              <LeafLink key={item.id} item={item} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function SecondaryPanel({ sectionId }) {
  const section = useMemo(() => getPrimarySection(sectionId), [sectionId]);

  if (section.id === 'create') {
    return (
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--ga-border)] bg-[var(--ga-panel)] px-3 py-4">
        <h2 className="px-2 text-sm font-medium text-[var(--ga-ink)]">Create</h2>
        <p className="mt-2 px-2 text-sm leading-5 text-[var(--ga-muted)]">
          Start a Search campaign draft, experiment, or asset from this workspace.
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--ga-border)] bg-[var(--ga-panel)]">
      <div className="ga-scroll flex-1 space-y-4 overflow-y-auto px-2 py-4">
        {section.groups.map((group) => (
          <NavGroupBlock key={group.id} group={group} />
        ))}
      </div>
    </aside>
  );
}
