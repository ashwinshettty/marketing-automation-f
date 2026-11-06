const Row = ({ label, children }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
    <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{label}</dt>
    <dd className="text-sm leading-relaxed text-brand-navy">{children}</dd>
  </div>
);

const tokenLine = (llm) => {
  if (!llm) return 'No planner call was recorded.';
  if (llm.tokenSource === 'unavailable') return 'The model did not report token counts.';
  if (llm.tokenSource === 'none' || llm.calls === 0) return 'No model call. Token use is 0.';
  const input = llm.inputTokens ?? '—';
  const output = llm.outputTokens ?? '—';
  return `${llm.calls} call${llm.calls === 1 ? '' : 's'} · input ${input} · output ${output} · ${llm.tokenSource}`;
};

const StoryPlanPreview = ({ result, onApprove, approving }) => {
  const data = result?.data;
  const scene = data?.scene;
  const manifest = data?.manifest;
  const validation = data?.validation;
  const dryRun = result?.generationStatus || manifest?.generationStatus || 'NOT_INVOKED';

  return (
    <section className="mx-auto w-full max-w-7xl rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
          Video generation: {dryRun}
        </span>
        {data?.intent ? (
          <span className="rounded-full bg-brand-yellow/30 px-3 py-1 text-xs font-semibold text-brand-navy">
            {data.intent}
          </span>
        ) : null}
        {validation?.status ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-brand-navy">
            {validation.status}
          </span>
        ) : null}
        {scene?.sceneNumber ? (
          <span className="text-xs font-medium text-brand-muted">Saved sequence {scene.sceneNumber}</span>
        ) : null}
      </div>

      {data?.clarificationQuestion ? (
        <p className="mt-4 rounded-2xl bg-brand-yellow/20 px-4 py-3 text-sm text-brand-navy">
          {data.clarificationQuestion}
        </p>
      ) : null}

      {data?.intentReason ? (
        <p className="mt-4 text-sm text-brand-muted">{data.intentReason}</p>
      ) : null}

      <dl className="mt-2">
        <Row label="Series">{data?.series?.id || 'Not created'}</Row>
        <Row label="User request">{scene?.userRequest || '—'}</Row>
        <Row label="Saved sequence">
          {scene?.sceneNumber
            ? `Scene ${scene.sceneNumber}${scene.createdAt ? `, saved ${scene.createdAt}` : ''}`
            : 'Not saved'}
        </Row>
        <Row label="Narrative predecessor">
          {data?.previousScene
            ? `#${data.previousScene.sceneNumber}: ${data.previousScene.objective}`
            : 'No previous planned scene'}
          {data?.previousScene && scene?.sceneNumber && data.previousScene.sceneNumber !== scene.sceneNumber - 1 ? (
            <p className="mt-1 text-amber-800">
              The predecessor is an earlier saved plan. Saved sequence numbers stay in commit order.
            </p>
          ) : null}
        </Row>
        <Row label="Objective">{scene?.objective || manifest?.sceneObjective || '—'}</Row>
        <Row label="Dialogue">{scene?.dialogue || '—'}</Row>
        <Row label="Visual action">{scene?.visualAction || '—'}</Row>
        <Row label="Character bible">
          {data?.character?.profileLabel ? (
            <div className="space-y-1">
              <p>{data.character.profileLabel}. Version {data.character.version}.</p>
              <p>{data.character.appearance}</p>
              <p>Clothing: {data.character.clothingRules}</p>
              <p>Voice: {data.character.voice?.description}</p>
              <p>Classroom: {data.character.environmentPreferences}</p>
            </div>
          ) : (
            'No teacher profile is saved.'
          )}
        </Row>
        <Row label="Reference assets">
          {manifest?.verifiedAssetIds?.length
            ? manifest.verifiedAssetIds.join(', ')
            : 'None verified'}
        </Row>
        <Row label="Compiled prompt">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed">
            {manifest?.finalPrompt || scene?.compiledPrompt || 'No prompt was compiled.'}
          </pre>
        </Row>
        <Row label="Validation">
          {validation ? (
            <div className="space-y-1">
              <p>{validation.status}. Dialogue fit: {validation.dialogueFits ? 'yes' : 'no'}.</p>
              {validation.warnings?.map((warning) => (
                <p key={warning} className="text-amber-800">{warning}</p>
              ))}
              {validation.errors?.map((error) => (
                <p key={error} className="text-red-700">{error}</p>
              ))}
            </div>
          ) : (
            '—'
          )}
        </Row>
        <Row label="LLM usage">{tokenLine(data?.llm)}</Row>
      </dl>

      {scene?.id && scene.status === 'planned' && data?.committed ? (
        <button
          type="button"
          onClick={onApprove}
          disabled={approving}
          className="mt-4 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {approving ? 'Approving plan…' : 'Approve plan'}
        </button>
      ) : null}
      <p className="mt-3 text-xs text-brand-muted">
        Approval updates story state only. It does not generate a video.
      </p>
    </section>
  );
};

export default StoryPlanPreview;
