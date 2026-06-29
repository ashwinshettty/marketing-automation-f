import { useEffect, useLayoutEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { fetchStudentById } from '../../api/studentApi';
import { useLead } from '../../context/LeadContext';
import { mapStudentToLead } from '../../utils/mapStudentToLead';
import LeadInfoPanel from './LeadInfoPanel';

const LeadDetails = () => {
  const { leadId } = useParams();
  const { leads, selectedLead, selectLead, clearSelectedLead, updateLeadInList } = useLead();
  const [detailLead, setDetailLead] = useState(null);
  const [isFetchingLead, setIsFetchingLead] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fallbackLead =
    leads.find((item) => item.id === leadId) ||
    (selectedLead?.id === leadId ? selectedLead : null);

  const lead = detailLead || fallbackLead;

  useLayoutEffect(() => {
    return () => {
      clearSelectedLead();
    };
  }, [clearSelectedLead]);

  useEffect(() => {
    let isMounted = true;

    const loadLead = async () => {
      setIsFetchingLead(true);
      setFetchError('');
      setDetailLead(null);

      try {
        const data = await fetchStudentById(leadId);
        const student = data?.student;

        if (!student) {
          throw new Error('Lead not found');
        }

        if (!isMounted) return;

        const mappedLead = mapStudentToLead(student);
        setDetailLead(mappedLead);
        selectLead(mappedLead);
      } catch (err) {
        if (!isMounted) return;

        setFetchError(err.message || 'Failed to load lead');
      } finally {
        if (isMounted) {
          setIsFetchingLead(false);
        }
      }
    };

    loadLead();

    return () => {
      isMounted = false;
    };
  }, [leadId, selectLead]);

  const handleLeadUpdate = (updatedLead) => {
    setDetailLead(updatedLead);
    selectLead(updatedLead);
    updateLeadInList(updatedLead);
  };

  if (isFetchingLead && !lead) {
    return (
      <div className="px-8 py-8 text-sm text-brand-muted">Loading lead details...</div>
    );
  }

  if (!lead) {
    if (fetchError && !fallbackLead) {
      return (
        <div className="px-8 py-8 text-sm text-red-600">{fetchError}</div>
      );
    }

    return <Navigate to="/leads" replace />;
  }

  return (
    <div className="px-8 py-8">
      <LeadInfoPanel lead={lead} onLeadUpdate={handleLeadUpdate} />
    </div>
  );
};

export default LeadDetails;
