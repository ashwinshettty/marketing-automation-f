import { useLayoutEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useLead } from '../../context/LeadContext';
import LeadInfoPanel from './LeadInfoPanel';

const LeadDetails = () => {
  const { leadId } = useParams();
  const { leads, selectLeadById, clearSelectedLead, loading } = useLead();
  const lead = leads.find((item) => item.id === leadId) || null;

  useLayoutEffect(() => {
    if (lead) {
      selectLeadById(leadId);
    }

    return () => {
      clearSelectedLead();
    };
  }, [leadId, lead, selectLeadById, clearSelectedLead]);

  if (loading) {
    return (
      <div className="px-8 py-8 text-sm text-brand-muted">Loading lead details...</div>
    );
  }

  if (!lead) {
    return <Navigate to="/leads" replace />;
  }

  return (
    <div className="px-8 py-8">
      <LeadInfoPanel />
    </div>
  );
};

export default LeadDetails;
