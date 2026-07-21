import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
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

  if (status === 'ringing' || status === 'initiating' || status === 'connect') {
    return 'Ringing…';
  }

  if (call.direction === 'inbound') return 'Missed';
  return 'No answer';
};

const CallLogBubble = ({ call }) => {
  const isOutbound = call.direction === 'outbound';
  const subtitle = getCallSubtitle(call);
  const isMissed =
    !formatCallDuration(call.duration) &&
    (call.direction === 'inbound' ||
      ['rejected', 'failed'].includes(String(call.status || '').toLowerCase()));

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex min-w-[180px] max-w-[min(75%,280px)] items-start gap-3 rounded-2xl px-3 py-2.5 text-sm shadow-sm ${
          isOutbound
            ? 'rounded-br-md bg-[#d9fdd3] text-slate-800'
            : 'rounded-bl-md bg-white text-slate-800'
        }`}
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isMissed ? 'bg-red-100 text-red-500' : 'bg-[#25D366]/20 text-[#128c7e]'
          }`}
        >
          {isMissed ? (
            <FaPhoneSlash className="h-3.5 w-3.5" />
          ) : (
            <FaPhone className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">Voice call</p>
          <p
            className={`text-xs ${
              isMissed ? 'text-red-500' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </p>
          <p className="mt-1 text-right text-[11px] text-[#667781]">
            {formatMessageTime(call.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallLogBubble;
