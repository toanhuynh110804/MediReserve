export function PageHero({ eyebrow, title, description, stats = [] }) {
  return (
    <section className="page-hero">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className="hero-copy">{description}</p>

      {stats.length > 0 ? (
        <div className="hero-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="hero-stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
