type Status = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'EXPIRED'

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    QUEUED:     'status-badge-queued',
    PROCESSING: 'status-badge-processing',
    COMPLETE:   'status-badge-complete',
    FAILED:     'status-badge-failed',
    EXPIRED:    'status-badge-queued',
  }
  return <span className={map[status]}>{status.toLowerCase()}</span>
}
