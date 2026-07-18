const TABS = [
  { id: "donor_view", label: "Donor" },
  { id: "public_view", label: "Community" },
  { id: "internal_view", label: "Internal" },
];

function DisclosureTabs({ activeTab, onChange, views }) {
  return (
    <div className="disclosure-tabs">
      <div className="disclosure-tabs__list" role="tablist" aria-label="Disclosure views">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`disclosure-tabs__tab${
              activeTab === tab.id ? " is-active" : ""
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) =>
        activeTab === tab.id ? (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            className="disclosure-tabs__panel"
          >
            {views[tab.id] ? (
              <iframe
                title={`${tab.label} disclosure preview`}
                className="disclosure-frame"
                sandbox=""
                srcDoc={views[tab.id]}
              />
            ) : (
              <p className="disclosure-tabs__empty">No HTML returned for this view.</p>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}

export default DisclosureTabs;
export { TABS };
