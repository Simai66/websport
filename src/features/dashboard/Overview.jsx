import { useState, useEffect } from 'react';
import { getBookings, formatPrice } from '../../data';
import StatusBadge from '../../components/StatusBadge';

export default function Overview() {
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        todayBookings: 0,
        totalRevenue: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const loadData = () => {
            const bookings = getBookings();
            const pending = bookings.filter(b => b.status === 'pending').length;
            const confirmed = bookings.filter(b => b.status === 'confirmed').length;
            const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0);

            const today = new Date().toISOString().split('T')[0];
            const todayBookings = bookings.filter(b => {
                return b.date === today && b.status === 'confirmed';
            }).length;

            setStats({ pending, confirmed, todayBookings, totalRevenue });
            setRecentBookings(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
        };

        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div>
            <div className="admin-page-title">
                <h2>ภาพรวม</h2>
            </div>

            {/* Stats */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon orange">○</div>
                    <div className="admin-stat-value">{stats.pending}</div>
                    <div className="admin-stat-label">รอชำระเงิน</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green">✓</div>
                    <div className="admin-stat-value" style={{ color: 'var(--success-400)' }}>{stats.confirmed}</div>
                    <div className="admin-stat-label">ชำระแล้ว</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue">📅</div>
                    <div className="admin-stat-value">{stats.todayBookings}</div>
                    <div className="admin-stat-label">จองวันนี้</div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon gold">฿</div>
                    <div className="admin-stat-value" style={{ color: 'var(--accent-gold)' }}>฿{formatPrice(stats.totalRevenue)}</div>
                    <div className="admin-stat-label">รายได้รวม</div>
                </div>
            </div>

            {/* Recent Bookings */}
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>การจองล่าสุด</h3>
            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>สนาม</th>
                                <th>ผู้จอง</th>
                                <th>วันที่</th>
                                <th>เวลา</th>
                                <th>ยอด</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map(b => (
                                <tr key={b.id}>
                                    <td>
                                        <div className="field-cell">
                                            {b.fieldImage && <img src={b.fieldImage} alt="" className="field-cell-img" />}
                                            <div>
                                                <div className="field-cell-name">{b.fieldName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell-name">{b.customerName}</div>
                                        <div className="user-cell-phone">{b.customerPhone}</div>
                                    </td>
                                    <td>{formatDateShort(b.date)}</td>
                                    <td>
                                        <div className="date-cell-time">{b.timeSlot}</div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>฿{formatPrice(b.totalPrice || b.price)}</td>
                                    <td><StatusBadge status={b.status} /></td>
                                </tr>
                            ))}
                            {recentBookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีการจอง</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
