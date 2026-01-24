import { useState, useEffect } from 'react';
import { getBookings, formatPrice } from '../../data';

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="badge badge-success">✓ ชำระแล้ว</span>;
            case 'pending': return <span className="badge badge-warning">⏳ รอชำระ</span>;
            case 'cancelled': return <span className="badge badge-danger">✕ ยกเลิก</span>;
            case 'expired': return <span className="badge badge-danger">⏱ หมดเวลา</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>ภาพรวม</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.pending}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>รอชำระเงิน</div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.confirmed}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>ชำระแล้ว</div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.todayBookings}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>จองวันนี้</div>
                </div>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>฿{formatPrice(stats.totalRevenue)}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>รายได้รวม</div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>การจองล่าสุด</h3>
            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem' }}>สนาม</th>
                                <th style={{ padding: '1rem' }}>ผู้จอง</th>
                                <th style={{ padding: '1rem' }}>วันที่</th>
                                <th style={{ padding: '1rem' }}>เวลา</th>
                                <th style={{ padding: '1rem' }}>ยอด</th>
                                <th style={{ padding: '1rem' }}>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{b.fieldName}</td>
                                    <td style={{ padding: '1rem' }}>{b.customerName}</td>
                                    <td style={{ padding: '1rem' }}>{b.date}</td>
                                    <td style={{ padding: '1rem' }}>{b.timeSlot}</td>
                                    <td style={{ padding: '1rem' }}>฿{formatPrice(b.totalPrice || b.price)}</td>
                                    <td style={{ padding: '1rem' }}>{getStatusBadge(b.status)}</td>
                                </tr>
                            ))}
                            {recentBookings.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีการจอง</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
