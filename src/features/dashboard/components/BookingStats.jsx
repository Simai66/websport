import { IoWallet, IoList, IoTimeOutline } from 'react-icons/io5';
import { formatPrice } from '../../../data';

export default function BookingStats({ todayRevenue, totalBookings, pendingCount }) {
    return (
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="admin-stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="admin-stat-label">รายได้วันนี้</div>
                        <div className="admin-stat-value" style={{ fontSize: '1.5rem' }}>฿{formatPrice(todayRevenue)}</div>
                    </div>
                    <div className="admin-stat-icon gold" style={{ marginBottom: 0 }}><IoWallet /></div>
                </div>
            </div>
            <div className="admin-stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="admin-stat-label">การจองทั้งหมด</div>
                        <div className="admin-stat-value" style={{ fontSize: '1.5rem' }}>{totalBookings}</div>
                    </div>
                    <div className="admin-stat-icon blue" style={{ marginBottom: 0 }}><IoList /></div>
                </div>
            </div>
            <div className="admin-stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="admin-stat-label">รออนุมัติ</div>
                        <div className="admin-stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-sport)' }}>{pendingCount}</div>
                    </div>
                    <div className="admin-stat-icon orange" style={{ marginBottom: 0 }}><IoTimeOutline /></div>
                </div>
            </div>
        </div>
    );
}
