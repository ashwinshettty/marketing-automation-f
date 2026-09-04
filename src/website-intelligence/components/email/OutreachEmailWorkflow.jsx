import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Eye, Mail, Pencil, RefreshCw, Save, Send, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '../../api/client';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmailStatusBadge from './EmailStatusBadge';
import EmailGenerationModal from './EmailGenerationModal';
import EmailGeneratingDialog from './EmailGeneratingDialog';
import EmailHeader from './EmailHeader';
import EmailEditor from './EmailEditor';
import EmailPreview from './EmailPreview';
import EmailEvidencePanel from './EmailEvidencePanel';
import EmailHistory from './EmailHistory';
import SendEmailDialog from './SendEmailDialog';
import RegenerateConfirmDialog from './RegenerateConfirmDialog';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog';
import { useToast } from './useToast.jsx';

const DEFAULT_SETTINGS = {
  tone: 'professional',
  length: 'standard',
  callToAction: 'share_examples',
  useAi: true,
};

function workflowReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase, error: action.error ?? state.error };
    case 'SET_CONTEXT':
      return { ...state, context: action.context, phase: 'idle', loading: false };
    case 'SET_DRAFT':
      return {
        ...state,
        draft: action.draft,
        phase: action.draft?.status === 'sent' ? 'sent' : 'draft',
        mode: 'preview',
        dirty: false,
      };
    case 'SET_HISTORY':
      return { ...state, history: action.history };
    case 'SET_MODE':
      return { ...state, mode: action.mode, phase: action.mode === 'editing' ? 'editing' : state.phase };
    case 'UPDATE_DRAFT_FIELD':
      return {
        ...state,
        draft: { ...state.draft, ...action.fields },
        dirty: true,
        phase: state.phase === 'sent' ? 'draft' : state.phase,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error, phase: 'failed', loading: false };
    default:
      return state;
  }
}

export default function OutreachEmailWorkflow({ audit }) {
  const { showToast, Toast } = useToast();
  const location = useLocation();
  /** Opportunity ids handed over from an opportunity card or detail page. */
  const requestedOpportunityIds = location.state?.opportunityIds;
  /** Open a specific saved draft from Email history. */
  const requestedEmailId = location.state?.emailId;
  const autoOpenedRef = useRef(false);
  const composerRef = useRef(null);
  const wasGeneratingRef = useRef(false);
  const [state, dispatch] = useReducer(workflowReducer, {
    phase: 'idle',
    loading: true,
    context: null,
    draft: null,
    history: [],
    mode: 'preview',
    dirty: false,
    error: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState(false);
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [manualEmail, setManualEmail] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showTechnicalError, setShowTechnicalError] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const auditId = audit?.auditId;
  const opportunityCount = state.context?.opportunityCount || audit?.opportunities?.length || 0;

  const loadWorkflow = useCallback(async () => {
    if (!auditId) return;
    dispatch({ type: 'SET_PHASE', phase: 'idle' });
    try {
      const [context, historyResponse] = await Promise.all([
        api.getOutreachContext(auditId),
        api.listOutreachEmails(auditId),
      ]);
      dispatch({ type: 'SET_CONTEXT', context });
      dispatch({ type: 'SET_HISTORY', history: historyResponse.emails || [] });

      const available = (context.opportunities || []).map((o) => o.serviceId);
      const preselected = (requestedOpportunityIds || []).filter((id) => available.includes(id));
      setSelectedOpportunityIds(
        preselected.length ? preselected : context.defaultOpportunityIds || []
      );
      setSelectedRecipient(context.defaultRecipient || null);

      // Arriving from an opportunity means the user already chose what to pitch.
      if (preselected.length && !autoOpenedRef.current && !requestedEmailId) {
        autoOpenedRef.current = true;
        setModalOpen(true);
        return;
      }

      if (requestedEmailId) {
        const fromList = (historyResponse.emails || []).find((email) => email.id === requestedEmailId);
        const email =
          fromList || (await api.getOutreachEmail(auditId, requestedEmailId).catch(() => null));
        if (email) {
          dispatch({ type: 'SET_DRAFT', draft: email });
          setLastSavedAt(email.updatedAt || email.createdAt || null);
          return;
        }
      }

      const latestDraft = (historyResponse.emails || []).find((email) => email.status === 'draft');
      if (latestDraft) {
        dispatch({ type: 'SET_DRAFT', draft: latestDraft });
        setLastSavedAt(latestDraft.updatedAt || latestDraft.createdAt || null);
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, [auditId, requestedOpportunityIds, requestedEmailId]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  useEffect(() => {
    if (state.phase === 'generating') {
      wasGeneratingRef.current = true;
    }
  }, [state.phase]);

  useEffect(() => {
    if (!wasGeneratingRef.current || !state.draft || state.phase === 'generating') return undefined;
    wasGeneratingRef.current = false;
    const timer = window.setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [state.draft, state.phase]);

  const composerValues = useMemo(() => {
    const draft = state.draft || {};
    return {
      to: draft.recipient?.email || manualEmail || '',
      cc: draft.cc || '',
      bcc: draft.bcc || '',
      subject: draft.subject || '',
      body: draft.body || '',
    };
  }, [state.draft, manualEmail]);

  const handleGenerate = async () => {
    if (!auditId) return;
    setModalOpen(false);
    dispatch({ type: 'SET_PHASE', phase: 'generating' });
    try {
      const draft = await api.generateOutreachEmail(auditId, {
        opportunityIds: selectedOpportunityIds,
        recipientEmail: selectedRecipient?.email || manualEmail || undefined,
        recipientName: selectedRecipient?.name,
        ...settings,
      });
      dispatch({ type: 'SET_DRAFT', draft });
      const historyResponse = await api.listOutreachEmails(auditId);
      dispatch({ type: 'SET_HISTORY', history: historyResponse.emails || [] });
      setLastSavedAt(draft.updatedAt || draft.createdAt || new Date().toISOString());
      showToast('Draft saved. You can reopen it anytime from Email history.');
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      showToast(err.message, 'error');
    }
  };

  const handleSaveDraft = async () => {
    if (!auditId || !state.draft) return;
    setSavingDraft(true);
    try {
      const updated = await api.updateOutreachEmail(auditId, state.draft.id, {
        recipient: { ...state.draft.recipient, email: composerValues.to },
        cc: composerValues.cc,
        bcc: composerValues.bcc,
        subject: composerValues.subject,
        body: composerValues.body,
        status: 'draft',
      });
      dispatch({ type: 'SET_DRAFT', draft: updated });
      const historyResponse = await api.listOutreachEmails(auditId);
      dispatch({ type: 'SET_HISTORY', history: historyResponse.emails || [] });
      setLastSavedAt(updated.updatedAt || new Date().toISOString());
      showToast('Draft saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRegenerate = async () => {
    if (!auditId || !state.draft) return;
    setRegenerateDialogOpen(false);
    dispatch({ type: 'SET_PHASE', phase: 'generating' });
    try {
      const draft = await api.regenerateOutreachEmail(auditId, state.draft.id, {
        opportunityIds: selectedOpportunityIds,
        recipientEmail: composerValues.to,
        ...settings,
      });
      dispatch({ type: 'SET_DRAFT', draft });
      showToast('Email regenerated.');
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      showToast(err.message, 'error');
    }
  };

  const handleSend = async () => {
    if (!auditId || !state.draft) return;
    setSendDialogOpen(false);
    dispatch({ type: 'SET_PHASE', phase: 'sending' });
    try {
      await api.updateOutreachEmail(auditId, state.draft.id, {
        recipient: { ...state.draft.recipient, email: composerValues.to },
        cc: composerValues.cc,
        bcc: composerValues.bcc,
        subject: composerValues.subject,
        body: composerValues.body,
      });
      const result = await api.sendOutreachEmail(auditId, state.draft.id, {
        recipient: { ...state.draft.recipient, email: composerValues.to },
        cc: composerValues.cc,
        bcc: composerValues.bcc,
        subject: composerValues.subject,
        body: composerValues.body,
      });
      const refreshed = await api.getOutreachEmail(auditId, state.draft.id);
      dispatch({ type: 'SET_DRAFT', draft: refreshed });
      const historyResponse = await api.listOutreachEmails(auditId);
      dispatch({ type: 'SET_HISTORY', history: historyResponse.emails || [] });
      showToast(`Email sent to ${result.to}.`);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      showToast('Failed to send email.', 'error');
    }
  };

  const handleDeleteDraft = async () => {
    if (!auditId || !state.draft) return;
    setDeletingDraft(true);
    try {
      await api.deleteOutreachEmail(auditId, state.draft.id);
      dispatch({ type: 'SET_DRAFT', draft: null });
      dispatch({ type: 'SET_PHASE', phase: 'idle' });
      const historyResponse = await api.listOutreachEmails(auditId);
      dispatch({ type: 'SET_HISTORY', history: historyResponse.emails || [] });
      setDeleteDialogOpen(false);
      showToast('Draft deleted.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingDraft(false);
    }
  };

  const openGenerateModal = () => {
    if (state.context) {
      setSelectedOpportunityIds(state.context.defaultOpportunityIds || []);
      setSelectedRecipient(state.context.defaultRecipient || null);
    }
    setModalOpen(true);
  };

  const canSend =
    !!composerValues.to &&
    !!composerValues.subject &&
    !!composerValues.body &&
    state.context?.emailConfigured &&
    state.phase !== 'sending';

  if (!audit) return null;

  if (state.loading && !state.context) {
    return <LoadingState message="Loading outreach workflow…" />;
  }

  if (state.error && !state.draft && state.phase === 'failed') {
    return (
      <ErrorState
        title="Could not load the outreach workflow"
        description="We could not read this website's opportunities or existing drafts."
        message={state.error}
        causes={['The backend is not running', 'This analysis is no longer stored']}
        onRetry={loadWorkflow}
      />
    );
  }

  return (
    <div className="space-y-6">
      {Toast}

      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand/10 p-2 text-brand">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="card-title">Outreach email</h3>
                {state.draft && <EmailStatusBadge status={state.phase === 'sending' ? 'sending' : state.draft.status} />}
              </div>
              <p className="body-text mt-1 text-sm">
                Generate a personalized sales email from {opportunityCount} detected opportunit
                {opportunityCount === 1 ? 'y' : 'ies'} for {state.context?.company?.name || audit.website}.
              </p>
            </div>
          </div>

          {state.phase === 'idle' && !state.draft && (
            <Button onClick={openGenerateModal} className="shrink-0">
              <Sparkles />
              Generate outreach email
            </Button>
          )}
        </div>

        {state.phase === 'idle' && !state.draft && (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
            <p className="text-sm font-medium">
              {opportunityCount} opportunit{opportunityCount === 1 ? 'y' : 'ies'} found
            </p>
            <p className="body-text mt-1">
              Choose which findings to mention, then generate a draft that stays traceable to its evidence.
            </p>
            <Button className="mt-4" onClick={openGenerateModal}>
              <Sparkles />
              Generate outreach email
            </Button>
          </div>
        )}

        {state.context?.emailConfigured === false && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning-subtle p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Sending is disabled</p>
              <p className="body-text mt-0.5">
                SMTP is not configured, so you can generate and edit drafts but not send them. Add SMTP credentials
                to <code className="font-mono text-xs">backend/.env</code> to enable sending.
              </p>
            </div>
          </div>
        )}
      </div>

      {state.draft && state.phase !== 'generating' && (
        <div ref={composerRef} className="grid scroll-mt-4 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="panel p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="section-title">Email composer</h4>
                {lastSavedAt && (
                  <p className="meta-text mt-0.5">
                    Last saved {new Date(lastSavedAt).toLocaleString()}
                    {state.dirty ? ' · unsaved changes' : ''}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to={`/website-intelligence/emails?emailId=${state.draft.id}`} />}
                >
                  View in history
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_MODE', mode: state.mode === 'preview' ? 'editing' : 'preview' })}
                >
                  {state.mode === 'preview' ? <Pencil /> : <Eye />}
                  {state.mode === 'preview' ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>

            <EmailHeader
              to={composerValues.to}
              cc={composerValues.cc}
              bcc={composerValues.bcc}
              subject={composerValues.subject}
              fromAddress={state.context?.fromAddress}
              fromName={state.context?.fromName}
              recipientMeta={state.draft.recipient}
              readOnly={state.mode === 'preview'}
              onToChange={(value) =>
                dispatch({
                  type: 'UPDATE_DRAFT_FIELD',
                  fields: { recipient: { ...state.draft.recipient, email: value } },
                })
              }
              onCcChange={(value) => dispatch({ type: 'UPDATE_DRAFT_FIELD', fields: { cc: value } })}
              onBccChange={(value) => dispatch({ type: 'UPDATE_DRAFT_FIELD', fields: { bcc: value } })}
              onSubjectChange={(value) => dispatch({ type: 'UPDATE_DRAFT_FIELD', fields: { subject: value } })}
            />

            <div className="mt-4">
              {state.mode === 'preview' ? (
                <EmailPreview
                  to={composerValues.to}
                  subject={composerValues.subject}
                  body={composerValues.body}
                  showBranding
                />
              ) : (
                <EmailEditor
                  value={composerValues.body}
                  onChange={(value) => dispatch({ type: 'UPDATE_DRAFT_FIELD', fields: { body: value } })}
                />
              )}
            </div>

            <AnimatePresence>
              {state.phase === 'sent' && (
                <motion.div
                  key="sent"
                  variants={stateSwapVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-4 flex items-start gap-3 rounded-lg border border-success/25 bg-success-subtle p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Email sent</p>
                    <p className="body-text mt-0.5">
                      {state.draft.recipient?.email} · {new Date(state.draft.sentAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )}

              {state.phase === 'failed' && (
                <motion.div
                  key="failed"
                  variants={stateSwapVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  role="alert"
                  className="mt-4 rounded-lg border border-destructive/25 bg-destructive-subtle p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">The email could not be sent</p>
                      <p className="body-text mt-0.5">
                        Your draft is safe. This usually means the mail server rejected the message or the
                        recipient address was not accepted.
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 -ml-2.5"
                        aria-expanded={showTechnicalError}
                        onClick={() => setShowTechnicalError((value) => !value)}
                      >
                        {showTechnicalError ? 'Hide technical details' : 'Show technical details'}
                      </Button>
                      {showTechnicalError && (
                        <pre className="mt-2 overflow-x-auto rounded-lg border border-destructive/20 bg-card p-2.5 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
                          {state.error || state.draft.error}
                        </pre>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {state.draft.versions?.length > 1 && (
              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                <p className="label-text">Draft versions</p>
                <ul className="mt-2 space-y-1">
                  {state.draft.versions.slice(0, 5).map((version, index) => (
                    <li
                      key={`${version.createdAt}-${index}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="meta-text">
                        Version {state.draft.versions.length - index} ·{' '}
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          dispatch({
                            type: 'UPDATE_DRAFT_FIELD',
                            fields: { subject: version.subject, body: version.body },
                          })
                        }
                      >
                        Restore
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setSendDialogOpen(true)}
                disabled={!canSend || state.draft.status === 'sent'}
              >
                <Send />
                {state.phase === 'sending' ? 'Sending…' : 'Send email'}
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} disabled={savingDraft}>
                <Save />
                {savingDraft ? 'Saving…' : 'Save draft'}
              </Button>
              <Button
                variant="outline"
                onClick={() => (state.dirty ? setRegenerateDialogOpen(true) : handleRegenerate())}
              >
                <RefreshCw />
                Regenerate
              </Button>
              {state.draft.status !== 'sent' && (
                <Button
                  variant="ghost"
                  className="ml-auto text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 />
                  Delete draft
                </Button>
              )}
            </div>
          </div>

          <aside className="panel p-4 lg:sticky lg:top-4 lg:self-start">
            <EmailEvidencePanel
              opportunities={state.draft.opportunities}
              recipient={state.draft.recipient}
            />
          </aside>
        </div>
      )}

      <EmailHistory
        emails={state.history}
        activeEmailId={state.draft?.id}
        onSelect={async (email) => {
          if (state.dirty) {
            const keepEditing = window.confirm(
              'You have unsaved changes. Open another email anyway?'
            );
            if (!keepEditing) return;
          }
          try {
            const full = await api.getOutreachEmail(auditId, email.id);
            dispatch({ type: 'SET_DRAFT', draft: full });
            setLastSavedAt(full.updatedAt || full.createdAt || null);
          } catch {
            dispatch({ type: 'SET_DRAFT', draft: email });
          }
        }}
        title="Saved emails"
      />

      <EmailGenerationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context={state.context}
        selectedOpportunityIds={selectedOpportunityIds}
        onOpportunityChange={setSelectedOpportunityIds}
        selectedRecipient={selectedRecipient}
        onRecipientSelect={setSelectedRecipient}
        manualEmail={manualEmail}
        onManualEmailChange={setManualEmail}
        settings={settings}
        onSettingsChange={setSettings}
        onGenerate={handleGenerate}
        generating={state.phase === 'generating'}
      />

      <EmailGeneratingDialog
        open={state.phase === 'generating'}
        opportunityCount={selectedOpportunityIds.length || opportunityCount}
      />

      <SendEmailDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onConfirm={handleSend}
        sending={state.phase === 'sending'}
        email={{ ...state.draft, recipient: { ...state.draft?.recipient, email: composerValues.to }, subject: composerValues.subject }}
      />

      <RegenerateConfirmDialog
        open={regenerateDialogOpen}
        onClose={() => setRegenerateDialogOpen(false)}
        onConfirm={handleRegenerate}
        regenerating={state.phase === 'generating'}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => !deletingDraft && setDeleteDialogOpen(false)}
        onConfirm={handleDeleteDraft}
        deleting={deletingDraft}
        title="Delete this draft?"
        description={
          state.draft?.subject
            ? `“${state.draft.subject}” will be permanently removed.`
            : 'This draft will be permanently removed.'
        }
        confirmLabel="Delete draft"
      />
    </div>
  );
}
