export default function SmartAlerts({ alerts }) {
  return (
    <section className="section">
      <div className="section__header">
        <span className="section-heading">Smart Alerts</span>
        <span className="chip chip-warning" style={{ fontSize: 9 }}>
          {alerts.filter((a) => a.level !== "info").length} Active Warnings
        </span>
      </div>
      <div className="alert-cards-grid">
        {alerts.map((alert) => (
          <div key={alert.title} className={`alert-card ${alert.level}`}>
            <div className="alert-card__level">{alert.level.toUpperCase()}</div>
            <div className="alert-card__title">{alert.title}</div>
            <div className="alert-card__body">{alert.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
