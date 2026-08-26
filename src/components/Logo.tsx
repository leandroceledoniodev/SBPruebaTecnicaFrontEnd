export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Superintendencia de Bancos">
      <svg className="brand__mark" viewBox="0 0 76 50" aria-hidden="true">
        <path d="M7 7c0 11 9 15 19 17-7 2-12 7-12 13 0 7 7 11 17 11 15 0 24-9 24-21 0-4-1-7-3-10L31 13c-7-1-11-3-11-6H7Z" fill="currentColor"/>
        <path d="M35 5h34c0 9-2 16-7 20L38 17c-5-2-6-8-3-12Z" fill="#79a9bd"/>
      </svg>
      <div className="brand__copy">
        <strong>SB</strong>
        {!compact && <><span>Superintendencia<br/>de Bancos</span><small>República Dominicana</small></>}
      </div>
    </div>
  )
}
