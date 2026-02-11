const statusConfig = {
    confirmed: { className: 'badge-success', icon: '✓', label: 'ชำระแล้ว' },
    pending: { className: 'badge-warning', icon: '⏳', label: 'รอชำระ' },
    cancelled: { className: 'badge-danger', icon: '✕', label: 'ยกเลิก' },
    expired: { className: 'badge-danger', icon: '⏱', label: 'หมดเวลา' }
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status];
    if (!config) return <span className="badge">{status}</span>;
    return <span className={`badge ${config.className}`}>{config.icon} {config.label}</span>;
}
