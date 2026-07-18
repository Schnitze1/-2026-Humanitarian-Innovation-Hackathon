function LoadingState({ label = "Loading…", steps = [] }) {
  return (
    <div className="state-panel state-panel--loading" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="state-panel__title">{label}</p>
      {steps.length > 0 ? (
        <ol className="loading-steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export default LoadingState;
