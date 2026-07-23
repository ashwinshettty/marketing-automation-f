import { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaHeadset, FaPhone, FaPhoneSlash } from 'react-icons/fa';
import { updateAgentCallOutcome } from '../../api/whatsappApi';
import {
  AGENT_CALL_OUTCOMES,
  agentCallOutcomeBadgeClass,
  formatAgentCallOutcome,
} from '../../utils/agentCallOutcomes';
import {
  formatCallDuration,
  formatMessageTime,
} from '../../utils/formatMessageTime';

const getCallSubtitle = (call) => {
  const durationLabel = formatCallDuration(call.duration);
  if (durationLabel) return durationLabel;

  const status = String(call.status || '').toLowerCase();

  if (status === 'rejected' || status === 'failed') {
    return call.direction === 'inbound' ? 'Missed' : 'No answer';
  }

  if (
    status === 'ringing' ||
    status === 'initiating' ||
    status === 'connect' ||
    status === 'connecting'
  ) {
    return call.handledBy === 'agent' ? 'Agent calling…' : 'Ringing…';
  }

  if (call.direction === 'inbound') return 'Missed';
  return 'No answer';
};

const CallLogBubble = ({ call, leadId, onOutcomeUpdated }) => {
  const [expanded, setExpanded] = useState(false);
  const [outcome, setOutcome] = useState(call.agentOutcome || '');
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState('');

  useEffect(() => {
    setOutcome(call.agentOutcome || '');
  }, [call.agentOutcome, call.callId]);

  const isOutbound = call.direction === 'outbound';
  const isAgent = call.handledBy === 'agent';
  const subtitle = getCallSubtitle(call);
  const summary = String(call.summary || '').trim();
  const transcript = Array.isArray(call.transcript) ? call.transcript : [];
  const hasReview = Boolean(summary) || transcript.length > 0 || Boolean(outcome);
  const isMissed =
    !formatCallDuration(call.duration) &&
    (call.direction === 'inbound' ||
      ['rejected', 'failed'].includes(String(call.status || '').toLowerCase()));

  const title = isAgent
    ? isOutbound
      ? 'Agent voice call'
      : 'Incoming agent call'
    : isOutbound
      ? 'Outgoing voice call'
      : 'Incoming voice call';

  const handleOutcomeChange = async (nextOutcome) => {
    if (!call.callId || !nextOutcome || nextOutcome === outcome) return;
    setOutcomeError('');
    setSavingOutcome(true);
    try {
      const result = await updateAgentCallOutcome({
        callId: call.callId,
        outcome: nextOutcome,
        leadId,
      });
      const saved = result?.call?.agentOutcome || nextOutcome;
      setOutcome(saved);
      onOutcomeUpdated?.(result?.call || { ...call, agentOutcome: saved });
    } catch (err) {
      setOutcomeError(err.message || 'Failed to update outcome');
    } finally {
      setSavingOutcome(false);
    }
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex min-w-[180px] max-w-[min(92%,360px)] flex-col gap-2 rounded-2xl px-3 py-2.5 text-sm shadow-sm ${
          isOutbound
            ? isAgent
              ? 'rounded-br-md bg-[#c8f7c5] text-slate-800'
              : 'rounded-br-md bg-[#d9fdd3] text-slate-800'
            : 'rounded-bl-md bg-white text-slate-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isMissed
                ? 'bg-red-100 text-red-500'
                : isAgent
                  ? 'bg-[#128c7e]/20 text-[#128c7e]'
                  : 'bg-[#25D366]/20 text-[#128c7e]'
            }`}
          >
            {isMissed ? (
              <FaPhoneSlash className="h-3.5 w-3.5" />
            ) : isAgent ? (
              <FaHeadset className="h-3.5 w-3.5" />
            ) : (
              <FaPhone className="h-3.5 w-3.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800">{title}</p>
            {isAgent && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#128c7e]">
                Ash · AI agent
              </p>
            )}
            {isAgent && outcome ? (
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${agentCallOutcomeBadgeClass(
                  outcome,
                )}`}
              >
                {formatAgentCallOutcome(outcome)}
              </span>
            ) : null}
            <p
              className={`text-xs ${
                isMissed ? 'text-red-500' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </p>
            {call.subject ? (
              <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
                Subject: {call.subject}
              </p>
            ) : null}
            <p className="mt-1 text-right text-[11px] text-[#667781]">
              {formatMessageTime(call.timestamp)}
            </p>
          </div>
        </div>

        {isAgent && hasReview ? (
          <div className="border-t border-black/5 pt-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#128c7e] hover:underline"
            >
              {expanded ? (
                <FaChevronUp className="h-2.5 w-2.5" />
              ) : (
                <FaChevronDown className="h-2.5 w-2.5" />
              )}
              {expanded ? 'Hide call summary' : 'View call summary'}
            </button>

            {expanded ? (
              <div className="mt-2 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Call outcome
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] text-slate-800"
                    value={outcome || ''}
                    disabled={savingOutcome || !call.callId}
                    onChange={(e) => handleOutcomeChange(e.target.value)}
                  >
                    <option value="">Select outcome</option>
                    {AGENT_CALL_OUTCOMES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                {outcomeError ? (
                  <p className="text-[11px] text-red-600">{outcomeError}</p>
                ) : null}

                {summary ? (
                  <div className="rounded-lg bg-white/70 px-2.5 py-2 text-[12px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {summary}
                  </div>
                ) : null}

                {transcript.length > 0 ? (
                  <details className="rounded-lg bg-white/50 px-2.5 py-2">
                    <summary className="cursor-pointer text-[11px] font-semibold text-slate-600">
                      Full transcript ({transcript.length} turns)
                    </summary>
                    <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto text-[11px] leading-snug text-slate-700">
                      {transcript.map((turn, index) => {
                        const isCaller = turn.role === 'caller';
                        return (
                          <li key={`${turn.at || index}-${index}`}>
                            <span
                              className={`font-semibold ${
                                isCaller ? 'text-slate-800' : 'text-[#128c7e]'
                              }`}
                            >
                              {isCaller ? 'Lead' : 'Ash'}:
                            </span>{' '}
                            {turn.text}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {isAgent && !hasReview && formatCallDuration(call.duration) ? (
          <p className="border-t border-black/5 pt-2 text-[10px] text-slate-500">
            Call summary will appear here after Ash finishes speaking with the lead.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default CallLogBubble;
