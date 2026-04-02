export function StateNotice({ tone = 'info', title, children }) {
  return (
    <div className={`state-notice state-notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {title ? <strong>{title}</strong> : null}
      <span>{children}</span>
    </div>
  )
}
