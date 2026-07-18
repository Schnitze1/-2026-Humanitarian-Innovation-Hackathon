function EmptyState({ title, description, action }) {
  return (
    <div className="state-panel state-panel--empty" role="status">
      <h2 className="state-panel__title">{title}</h2>
      {description ? <p className="state-panel__body">{description}</p> : null}
      {action ? <div className="state-panel__action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
