import { classToken, translate } from '../utils/format'

export function StatusBadge({ value, type = 'status' }: { value: string; type?: 'status' | 'priority' }) {
  return <span className={`badge badge--${type} badge--${classToken(value)}`}>{translate(value)}</span>
}
