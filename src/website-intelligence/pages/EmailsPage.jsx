import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { RowSkeleton } from '../components/common/LoadingState';
import EmailHistory from '../components/email/EmailHistory';
import EmailDraftDialog from '../components/email/EmailDraftDialog';
import ConfirmDeleteDialog from '../components/common/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { useAudit } from '../context/AuditContext';
import { api } from '../api/client';
import { formatDomain } from '../utils/formatters';
import { useToast } from '../components/email/useToast.jsx';

export default function EmailsPage() {
  const { audit } = useAudit();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast, Toast } = useToast();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const auditId = audit?.auditId;
  const selectedEmailId = searchParams.get('emailId');

  const drafts = useMemo(() => emails.filter((email) => email.status === 'draft'), [emails]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEmail(null);
    if (searchParams.get('emailId')) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const openEmail = useCallback(
    async (email) => {
      if (!auditId) return;
      setSearchParams({ emailId: email.id });
      try {
        const full = await api.getOutreachEmail(auditId, email.id);
        setSelectedEmail(full);
      } catch {
        setSelectedEmail(email);
      }
      setModalOpen(true);
    },
    [auditId, setSearchParams]
  );

  const load = useCallback(async () => {
    if (!auditId) {
      setEmails([]);
      setSelectedEmail(null);
      setModalOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.listOutreachEmails(auditId);
      const nextEmails = res.emails || [];
      setEmails(nextEmails);

      if (selectedEmailId) {
        const match = nextEmails.find((email) => email.id === selectedEmailId);
        const email =
          match || (await api.getOutreachEmail(auditId, selectedEmailId).catch(() => null));
        if (email) {
          setSelectedEmail(email);
          setModalOpen(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auditId, selectedEmailId]);

  useEffect(() => {
    load();
  }, [load]);

  const requestDelete = (email) => {
    if (!email?.id) return;
    setPendingDelete(email);
  };

  const confirmDelete = async () => {
    if (!auditId || !pendingDelete?.id) return;

    setDeleting(true);
    try {
      await api.deleteOutreachEmail(auditId, pendingDelete.id);
      showToast('Draft deleted.');
      setPendingDelete(null);
      closeModal();
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer wide>
      {Toast}

      <PageHeader
        title="Email history"
        description={
          audit
            ? `Saved drafts and sent outreach for ${formatDomain(audit.website)}.`
            : 'Outreach emails generated from website analyses.'
        }
        actions={
          audit && (
            <Button render={<Link to="/website-intelligence/reports" />}>
              <Mail />
              Compose outreach
            </Button>
          )
        }
      />

      {!audit ? (
        <EmptyState
          icon={Mail}
          title="No website loaded"
          description="Outreach emails are generated from a website's opportunities, so load an analysis first."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      ) : error ? (
        <ErrorState
          title="Could not load email history"
          description="The outreach history for this website is temporarily unavailable."
          message={error}
          causes={['The backend is not running', 'The analysis was removed from storage']}
          onRetry={load}
        />
      ) : loading ? (
        <RowSkeleton count={4} />
      ) : emails.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No outreach emails yet"
          description="Generate an email from the opportunities found on this website. Every draft is saved automatically and appears here."
          actionLabel="Generate outreach email"
          actionTo="/website-intelligence/reports"
        />
      ) : (
        <div className="space-y-4">
          {drafts.length > 0 && (
            <p className="body-text">
              {drafts.length} saved draft{drafts.length === 1 ? '' : 's'} ready to review or send.
              Click any email to open it.
            </p>
          )}

          <EmailHistory
            emails={emails}
            activeEmailId={selectedEmail?.id}
            onSelect={openEmail}
            title="Saved emails"
          />
        </div>
      )}

      <EmailDraftDialog
        open={modalOpen}
        onClose={closeModal}
        email={selectedEmail}
        onDelete={requestDelete}
        deleting={deleting}
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
        deleting={deleting}
        title="Delete this draft?"
        description={
          pendingDelete?.subject
            ? `“${pendingDelete.subject}” will be permanently removed from email history.`
            : 'This draft will be permanently removed from email history.'
        }
        confirmLabel="Delete draft"
      />
    </PageContainer>
  );
}
