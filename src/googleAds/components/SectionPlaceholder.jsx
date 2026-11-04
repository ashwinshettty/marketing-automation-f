import PageHeader from './PageHeader';
import ContentCard from './ContentCard';
import FilterChip from './FilterChip';

export default function SectionPlaceholder({
  title,
  description,
  bullets = [],
}) {
  return (
    <div className="px-6 py-5">
      <PageHeader
        title={title}
        filters={
          <>
            <FilterChip>Filters</FilterChip>
            <FilterChip active>All</FilterChip>
          </>
        }
      />
      <ContentCard title="About this page">
        <p className="max-w-2xl text-sm leading-6 text-[var(--ga-muted)]">{description}</p>
        {bullets.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--ga-ink)]">
            {bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ga-blue)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </ContentCard>
    </div>
  );
}
