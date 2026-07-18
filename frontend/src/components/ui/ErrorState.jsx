function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <h2 className="state-panel__title">{title}</h2>
      {message ? <p className="state-panel__body">{message}</p> : null}
      {onRetry ? (
        <div className="state-panel__action">
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ErrorState;
