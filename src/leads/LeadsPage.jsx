import LeadFilters from './LeadFilters';
import LeadTable from './LeadTable';

const LeadsPage = () => {
  return (
    <div className="min-w-0 max-w-full px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <LeadFilters />
      <LeadTable />
    </div>
  );
};
export default LeadsPage;
