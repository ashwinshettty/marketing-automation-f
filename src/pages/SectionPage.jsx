const SectionPage = ({ title }) => {
  return (
    <div className="px-8 py-8">
      <div className="rounded-2xl border border-brand-yellow/40 bg-white p-8 shadow-sm">
        <p className="text-sm text-brand-muted">
          {title} content will appear here.
        </p>
      </div>
    </div>
  );
};

export default SectionPage;
