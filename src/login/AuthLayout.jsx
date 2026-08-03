const PURPOSE_POINTS = [
  {
    title: 'Lead desk',
    text: 'Track enquiries, follow-ups, and counselor actions in one place.',
  },
  {
    title: 'WhatsApp outreach',
    text: 'Chat, templates, and calling so every parent conversation stays warm.',
  },
  {
    title: 'Campaign control',
    text: 'Run Meta-style campaigns and see what actually brings admissions.',
  },
];

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-shell flex min-h-screen items-stretch justify-center">
      <div className="relative z-[1] grid w-full max-w-6xl grid-cols-1 lg:min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-brand-panel flex flex-col justify-between px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-14">
          <div className="auth-rise">
            <div className="flex items-center gap-3">
              <img
                src="/app-icon.png"
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-4 ring-brand-yellow"
              />
              <div>
                <p className="text-3xl font-semibold tracking-tight text-brand-yellow sm:text-4xl">
                  AI Bot
                </p>
                <p className="mt-0.5 text-sm text-white/70">Inkstall marketing workspace</p>
              </div>
            </div>

            <h1 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Your sales team&apos;s command center for admissions.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              AI Bot helps counselors manage leads, WhatsApp conversations, events, and
              campaigns — so every enquiry moves closer to enrollment.
            </p>
          </div>

          <ul className="auth-rise-delay mt-10 space-y-4 lg:mt-0">
            {PURPOSE_POINTS.map((point) => (
              <li key={point.title} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-yellow"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-brand-yellow">{point.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/70">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="auth-rise-late w-full max-w-md">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-navy">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{subtitle}</p>
              )}
            </div>

            <div className="rounded-2xl border border-brand-yellow/50 bg-white/90 p-6 shadow-[0_20px_50px_rgba(0,0,128,0.08)] backdrop-blur-md sm:p-7">
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
