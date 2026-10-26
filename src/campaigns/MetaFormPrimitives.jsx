export function MetaCheckIcon() {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
      ✓
    </span>
  );
}

export function MetaInfoIcon() {
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 text-[10px] font-semibold text-slate-500"
      aria-hidden
    >
      i
    </span>
  );
}

export function MetaCard({ id, title, badge, complete = true, children, className = '' }) {
  return (
    <section id={id} className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || badge) && (
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3.5 py-3 sm:px-5 sm:py-3.5">
          {complete ? <MetaCheckIcon /> : null}
          {title ? <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2> : null}
          {badge}
        </header>
      )}
      <div className="px-3.5 py-3.5 sm:px-5 sm:py-4">{children}</div>
    </section>
  );
}

export function AdvantageBadge({ on = true }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        on ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {on ? '+ Advantage+ on' : 'Advantage+ off'}
    </span>
  );
}

export function MetaField({ label, required, hint, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <label className="block text-[13px] font-medium text-slate-700">
          {required ? <span className="text-rose-500">* </span> : null}
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function MetaInput({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 ${className}`}
      {...props}
    />
  );
}

export function MetaSelect({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function MetaTextarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 ${className}`}
      {...props}
    />
  );
}

export function MetaToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-[#1877F2]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
      {label ? <span className="text-sm text-slate-700">{label}</span> : null}
    </button>
  );
}

export function MetaRadioCard({ name, value, checked, onChange, label, description }) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
        checked ? 'border-[#1877F2] bg-[#1877F2]/5' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1"
      />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

export function MetaAlert({ tone = 'info', title, children, action }) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  return (
    <div className={`rounded-lg border px-3.5 py-3 ${tones[tone]}`}>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      {children ? <div className="mt-1 text-xs leading-relaxed opacity-90">{children}</div> : null}
      {action}
    </div>
  );
}

export function MetaCheckRow({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer gap-3 py-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

export function MetaReadonlyRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div>
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-sm text-slate-900">{value}</p>
      </div>
      {onEdit ? (
        <button type="button" onClick={onEdit} className="text-[#1877F2] hover:underline" aria-label={`Edit ${label}`}>
          ✎
        </button>
      ) : null}
    </div>
  );
}
