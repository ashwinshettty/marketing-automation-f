import LeadFilters from './LeadFilters';
import LeadTable from './LeadTable';

const LeadsPage = () => {
  return (
    <div className="px-8 py-8">
      <LeadFilters />
      <LeadTable />
    </div>
  );
};
export default LeadsPage;
