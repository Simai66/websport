import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import QRPayment from '../components/QRPayment';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { getBookings, cancelBooking, expireOverdueBookings, formatDateThai, formatPrice } from '../data';

export default function MyBookings() {
    const [phone, setPhone] = useState('');
    const [bookings, setBookings] = useState([]);
    const [searched, setSearched] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [showQR, setShowQR] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, bookingId: null });

    const handleSearch = () => {
        if (!phone.trim()) {
            setToastMessage('กรุณากรอกเบอร์โทรศัพท์');
            setToastType('error');
            setShowToast(true);
            return;
        }

        expireOverdueBookings();
        const allBookings = getBookings();
        const userBookings = allBookings.filter(b => b.customerPhone === phone.trim());
        setBookings(userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setSearched(true);
    };

    const handleCancel = (bookingId) => {
        setConfirmState({ isOpen: true, bookingId });
    };

    const confirmCancel = () => {
        cancelBooking(confirmState.bookingId);
        setConfirmState({ isOpen: false, bookingId: null });
        setToastMessage('ยกเลิกการจองเรียบร้อยแล้ว');
        setToastType('success');
        setShowToast(true);
        handleSearch();
    };

    const canCancel = (booking) => {
        if (booking.status === 'cancelled' || booking.status === 'expired') return false;
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today;
    };

    const getTimeRemaining = (deadline) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end - now;
        if (diff <= 0) return null;
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <div className="page-header">
                <div className="container page-header-content">
                    <h1 className="page-title">การจองของฉัน</h1>
                    <p className="page-description">ตรวจสอบและจัดการการจองของคุณ</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Search Box */}
                    <div style={{
                        maxWidth: '500px',
                        margin: '0 auto 2rem',
                        background: 'var(--bg-card)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>ค้นหาการจอง</h3>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label className="form-label">เบอร์โทรศัพท์ที่ใช้จอง</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="กรอกเบอร์โทรศัพท์"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleSearch}
                        >
                            🔍 ค้นหา
                        </button>
                    </div>

                    {/* Results */}
                    {searched && (
                        <div>
                            {bookings.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {bookings.map(booking => (
                                        <div key={booking.id} className="booking-item">
                                            <div className="booking-item-image">
                                                <img src={booking.fieldImage} alt={booking.fieldName} width="120" height="80" />
                                            </div>
                                            <div className="booking-item-content">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                    <h3 className="booking-item-title">{booking.fieldName}</h3>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <div className="booking-item-details">
                                                    <span className="booking-item-detail">📅 {formatDateThai(booking.date)}</span>
                                                    <span className="booking-item-detail">🕐 {booking.timeSlot}</span>
                                                    <span className="booking-item-detail">💰 ฿{formatPrice(booking.totalPrice || booking.price)}</span>
                                                </div>
                                                <div className="booking-item-details" style={{ marginTop: '0.25rem' }}>
                                                    <span className="booking-item-detail">👤 {booking.customerName}</span>
                                                    <span className="booking-item-detail">📞 {booking.customerPhone}</span>
                                                </div>

                                                {/* Pending Payment Warning */}
                                                {booking.status === 'pending' && (
                                                    <div style={{
                                                        marginTop: '0.75rem',
                                                        padding: '0.75rem',
                                                        background: 'rgba(245, 158, 11, 0.15)',
                                                        borderRadius: 'var(--radius-md)',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        <div style={{ color: 'var(--warning-400)', marginBottom: '0.5rem' }}>
                                                            ⏳ กรุณาชำระเงินภายใน: <strong>{getTimeRemaining(booking.paymentDeadline) || 'หมดเวลาแล้ว'}</strong>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => setShowQR(booking)}
                                                        >
                                                            💳 แสดง QR ชำระเงิน
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="booking-item-actions">
                                                    <Link to={`/field/${booking.fieldId}`} className="btn btn-sm btn-secondary">
                                                        ดูสนาม
                                                    </Link>
                                                    {canCancel(booking) && (
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleCancel(booking.id)}
                                                        >
                                                            ยกเลิกการจอง
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <h3 className="empty-state-title">ไม่พบการจอง</h3>
                                    <p className="empty-state-description">
                                        ยังไม่มีการจองในระบบสำหรับเบอร์โทรศัพท์นี้
                                    </p>
                                    <Link to="/" className="btn btn-primary">
                                        จองสนามกีฬา
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {!searched && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3 className="empty-state-title">กรอกเบอร์โทรศัพท์เพื่อค้นหา</h3>
                            <p className="empty-state-description">
                                ใช้เบอร์โทรศัพท์ที่คุณใช้ในการจองสนาม
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* QR Payment Modal */}
            {showQR && (
                <QRPayment
                    amount={showQR.totalPrice || showQR.price}
                    booking={showQR}
                    onClose={() => setShowQR(null)}
                    onTimeout={() => {
                        setShowQR(null);
                        setToastMessage('หมดเวลาชำระเงิน');
                        setToastType('error');
                        setShowToast(true);
                        handleSearch();
                    }}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="ยกเลิกการจอง"
                message="คุณต้องการยกเลิกการจองนี้หรือไม่? การยกเลิกไม่สามารถเรียกคืนได้"
                confirmLabel="ยกเลิกการจอง"
                onConfirm={confirmCancel}
                onCancel={() => setConfirmState({ isOpen: false, bookingId: null })}
            />

            {/* Toast */}
            {showToast && (
                <div className="toast-container">
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setShowToast(false)}
                    />
                </div>
            )}
        </div>
    );
}
