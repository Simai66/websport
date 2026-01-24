import { useState, useEffect } from 'react';
import { getBookings, cancelBooking, deleteBooking, confirmBookingPayment, expireOverdueBookings, formatPrice } from '../../data';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [viewingSlip, setViewingSlip] = useState(null);

    const loadData = () => {
        expireOverdueBookings();
        setBookings(getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmPayment = (bookingId) => {
        if (confirm('ยืนยันว่าได้รับชำระเงินแล้ว?')) {
            confirmBookingPayment(bookingId);
            loadData();
        }
    };

    const handleCancelBooking = (bookingId) => {
        if (confirm('ยืนยันการยกเลิกการจองนี้?')) {
            cancelBooking(bookingId);
            loadData();
        }
    };

    const handleDeleteBooking = (bookingId) => {
        if (confirm('ยืนยันการลบการจองนี้? (ข้อมูลจะหายถาวร)')) {
            deleteBooking(bookingId);
            loadData();
        }
    };

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
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => setViewingSlip(b)}
                                                style={{ padding: '0.25rem 0.5rem' }}
                                            >
                                                🖼️ ดูสลิป
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ไม่มี</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{getStatusBadge(b.status)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                            {b.status === 'pending' && (
                                                <button className="btn btn-sm btn-success" onClick={() => handleConfirmPayment(b.id)}>
                                                    ✓ ยืนยัน
                                                </button>
                                            )}
                                            {(b.status === 'pending' || b.status === 'confirmed') && (
                                                <button className="btn btn-sm btn-secondary" onClick={() => handleCancelBooking(b.id)}>
                                                    ยกเลิก
                                                </button>
                                            )}
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

            {/* Slip Viewer Modal */}
            {viewingSlip && (
                <div className="modal-overlay active" onClick={() => setViewingSlip(null)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal premium-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 className="modal-title" style={{ margin: 0 }}>🧾 สลิปการโอนเงิน</h3>
                            <button className="modal-close" onClick={() => setViewingSlip(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'left',
                                fontSize: '0.875rem'
                            }}>
                                <div><strong>สนาม:</strong> {viewingSlip.fieldName}</div>
                                <div><strong>ผู้จอง:</strong> {viewingSlip.customerName} ({viewingSlip.customerPhone})</div>
                                <div><strong>วันที่:</strong> {viewingSlip.date} | {viewingSlip.timeSlot}</div>
                                <div><strong>ยอด:</strong> <span style={{ color: 'var(--accent-sport)' }}>฿{formatPrice(viewingSlip.totalPrice || viewingSlip.price)}</span></div>
                                <div><strong>สถานะ:</strong> {getStatusBadge(viewingSlip.status)}</div>
                            </div>

                            <img
                                src={viewingSlip.paymentSlip}
                                alt="สลิปการโอน"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    display: 'block',
                                    margin: '0 auto'
                                }}
                            />
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                            {viewingSlip.status === 'pending' && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        handleConfirmPayment(viewingSlip.id);
                                        setViewingSlip(null);
                                    }}
                                >
                                    ✓ ยืนยันชำระเงิน
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setViewingSlip(null)}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
