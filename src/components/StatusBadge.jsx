import { IoCheckmarkCircle, IoTimeOutline, IoCloseCircle, IoAlertCircle } from 'react-icons/io5';

const statusConfig = {
    confirmed: { className: 'badge-success', icon: <IoCheckmarkCircle />, label: 'ชำระแล้ว' },
    pending: { className: 'badge-warning', icon: <IoTimeOutline />, label: 'รอชำระ' },
    cancelled: { className: 'badge-danger', icon: <IoCloseCircle />, label: 'ยกเลิก' },
    expired: { className: 'badge-danger', icon: <IoAlertCircle />, label: 'หมดเวลา' }
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status];
    if (!config) return <span className="badge">{status}</span>;
    return (
        <span className={`badge ${config.className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            {config.icon} {config.label}
        </span>
    );
}
