import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getBookings, deleteBooking, expireOverdueBookings, formatPrice } from '../../data';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [confirmState, setConfirmState] = useState({ isOpen: false, bookingId: null });

    const loadData = () => {
        expireOverdueBookings();
        setBookings(getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleDeleteBooking = (bookingId) => {
        setConfirmState({ isOpen: true, bookingId });
    };

    const confirmDelete = () => {
        deleteBooking(confirmState.bookingId);
        setConfirmState({ isOpen: false, bookingId: null });
        loadData();
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>การจองทั้งหมด ({bookings.length})</h2>
            <div className="premium-card">
                <div className="table-container">
                    <table className="table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>สนาม</th>
                                <th style={{ padding: '1rem' }}>ผู้จอง</th>
                                <th style={{ padding: '1rem' }}>โทร</th>
                                <th style={{ padding: '1rem' }}>วันที่</th>
                                <th style={{ padding: '1rem' }}>เวลา</th>
                                <th style={{ padding: '1rem' }}>ยอด</th>
                                <th style={{ padding: '1rem' }}>สลิป</th>
                                <th style={{ padding: '1rem' }}>สถานะ</th>
                                <th style={{ padding: '1rem' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.id.slice(-6)}</td>
                                    <td style={{ padding: '1rem' }}>{b.fieldName}</td>
                                    <td style={{ padding: '1rem' }}>{b.customerName}</td>
                                    <td style={{ padding: '1rem' }}>{b.customerPhone}</td>
                                    <td style={{ padding: '1rem' }}>{b.date}</td>
                                    <td style={{ padding: '1rem' }}>{b.timeSlot}</td>
                                    <td style={{ padding: '1rem' }}>฿{formatPrice(b.totalPrice || b.price)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {b.paymentSlip ? (
                                            <span style={{ color: 'var(--success-400)', fontSize: '0.875rem' }}>✓ แนบแล้ว</span>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}><StatusBadge status={b.status} /></td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <Link to={`/dashboard/bookings/${b.id}`} className="btn btn-sm btn-primary">
                                                📄 รายละเอียด
                                            </Link>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBooking(b.id)}>
                                                ลบ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="10" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีการจอง</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="ลบการจอง"
                message="ยืนยันการลบการจองนี้? ข้อมูลจะหายถาวรและไม่สามารถกู้คืนได้"
                confirmLabel="ลบถาวร"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ isOpen: false, bookingId: null })}
            />
        </div>
    );
}
