import { Navigate, useParams } from 'react-router-dom';

const LeadWhatsAppChat = () => {
  const { leadId } = useParams();

  return <Navigate to={`/leads/${leadId}?tab=whatsapp`} replace />;
};

export default LeadWhatsAppChat;
