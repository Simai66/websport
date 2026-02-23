import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookings, confirmBookingPayment, cancelBooking, formatPrice } from '../../data';

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // 'confirm' | 'reject' | null
    const [actionDone, setActionDone] = useState('');

    useEffect(() => {
        const bookings = getBookings();
        const found = bookings.find(b => b.id === id);
        if (found) {
            setBooking(found);
        } else {
            // Fallback for short ID or if not found immediately
            const foundByShortId = bookings.find(b => b.id.endsWith(id));
            if (foundByShortId) setBooking(foundByShortId);
        }
    }, [id]);

    if (!booking) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>ไม่พบข้อมูลการจอง</p>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard/bookings')}>
                    กลับหน้ารายการ
                </button>
            </div>
        );
    }

    const handleConfirm = () => {
        confirmBookingPayment(booking.id);
        setBooking(prev => ({ ...prev, status: 'confirmed' }));
        setConfirmAction(null);
        setActionDone('อนุมัติการจองเรียบร้อย ✓');
        setTimeout(() => setActionDone(''), 3000);
    };

    const handleReject = () => {
        cancelBooking(booking.id);
        setBooking(prev => ({ ...prev, status: 'cancelled' }));
        setConfirmAction(null);
        setActionDone('ปฏิเสธการจองเรียบร้อย');
        setTimeout(() => setActionDone(''), 3000);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="badge badge-success" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>✓ ชำระแล้ว</span>;
            case 'pending': return <span className="badge badge-warning" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>⏳ รอยืนยัน</span>;
            case 'cancelled': return <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>✕ ยกเลิก</span>;
            case 'expired': return <span className="badge badge-danger" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>⏱ หมดเวลา</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="booking-detail-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/dashboard/bookings" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        ← กลับ
                    </Link>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>รายละเอียดการจอง</h2>
                </div>
                <div>
                    {getStatusBadge(booking.status)}
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Booking Info */}
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>ข้อมูลการจอง</h3>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>รหัส</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>#{booking.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>สนาม</span>
                        <span style={{ color: 'var(--accent-sport)', fontWeight: 600 }}>{booking.fieldName}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>วันที่</span>
                        <span style={{ color: 'var(--text-primary)' }}>{booking.date}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>เวลา</span>
                        <span style={{ color: 'var(--text-primary)' }}>{booking.timeSlot}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>ราคา</span>
                        <span style={{ color: 'var(--accent-sport)', fontSize: '1.5rem', fontWeight: 700 }}>฿{formatPrice(booking.totalPrice || booking.price)}</span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>ข้อมูลลูกค้า</h3>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>ชื่อ</span>
                        <span style={{ color: 'var(--text-primary)' }}>{booking.customerName}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>โทรศัพท์</span>
                        <span style={{ color: 'var(--text-primary)' }}>{booking.customerPhone}</span>
                    </div>
                    <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>จองเมื่อ</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatDate(booking.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Section */}
            <div className="premium-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>หลักฐานการชำระเงิน</h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    {/* Slip Image */}
                    <div style={{ flex: '0 0 300px', maxWidth: '100%' }}>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            minHeight: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {booking.paymentSlip ? (
                                <img
                                    src={booking.paymentSlip}
                                    alt="Payment Slip"
                                    style={{ width: '100%', display: 'block' }}
                                    onClick={() => window.open(booking.paymentSlip, '_blank')}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                                    ไม่มีสลิปการโอน
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>ตรวจสอบสลิปและดำเนินการ</h4>

                        {actionDone && (
                            <div style={{
                                padding: '0.75rem 1rem', marginBottom: '1rem',
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                color: '#22c55e', textAlign: 'center', fontWeight: 600
                            }}>
                                {actionDone}
                            </div>
                        )}

                        {booking.status === 'pending' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {confirmAction ? (
                                    <div style={{
                                        padding: '1.25rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--border-color)',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                            {confirmAction === 'confirm' ? 'ยืนยันการอนุมัติการจองนี้?' : 'ยืนยันการปฏิเสธการจองนี้?'}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={confirmAction === 'confirm' ? handleConfirm : handleReject}
                                                className={`btn ${confirmAction === 'confirm' ? 'btn-success' : 'btn-danger'}`}
                                                style={{ padding: '0.6rem 1.5rem' }}
                                            >
                                                ✓ ยืนยัน
                                            </button>
                                            <button
                                                onClick={() => setConfirmAction(null)}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.6rem 1.5rem' }}
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setConfirmAction('confirm')}
                                            className="btn btn-success btn-lg"
                                            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                                        >
                                            ✓ อนุมัติการจอง
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction('reject')}
                                            className="btn btn-danger btn-lg"
                                            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                                        >
                                            ✕ ปฏิเสธการจอง
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                padding: '1.5rem',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                color: 'var(--text-secondary)'
                            }}>
                                การจองนี้ถูกดำเนินการแล้ว: <strong>{getStatusBadge(booking.status)}</strong>
                            </div>
                        )}

                        {booking.paymentSlip && (
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                * คลิกที่รูปเพื่อดูภาพขนาดใหญ่
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
