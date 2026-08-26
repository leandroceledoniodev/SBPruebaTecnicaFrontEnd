export function Spinner({ label = 'Cargando información' }: { label?: string }) {
  return <div className="loading"><span className="spinner"/><span>{label}</span></div>
}
