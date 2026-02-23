import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import QRPayment from '../components/QRPayment';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { getBookings, cancelBooking, expireOverdueBookings, formatDateThai, formatPrice, typeLabels } from '../data';
import { useAuth } from '../contexts/AuthContext';
import { IoTrophy, IoCall, IoSearch, IoCalendar, IoTime } from 'react-icons/io5';
import { HiClipboardList } from 'react-icons/hi';

export default function MyBookings() {
    const { user, isAuthenticated } = useAuth();
    const [phone, setPhone] = useState('');
    const [bookings, setBookings] = useState([]);
    const [searched, setSearched] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [showQR, setShowQR] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, bookingId: null });
    const [filter, setFilter] = useState('upcoming');
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Auto-fill and auto-search when logged in
    useEffect(() => {
        if (isAuthenticated && user?.phone && !searched) {
            const userPhone = user.phone;
            setPhone(userPhone);
            expireOverdueBookings();
            const allBookings = getBookings();
            const userBookings = allBookings.filter(b => b.customerPhone === userPhone.trim());
            setBookings(userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setSearched(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

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

    const filteredBookings = bookings.filter(b => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(b.date);
        if (filter === 'upcoming') {
            return bookingDate >= today && b.status !== 'cancelled' && b.status !== 'expired';
        }
        return bookingDate < today || b.status === 'cancelled' || b.status === 'expired';
    });

    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'expired').length;

    return (
        <div>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(255, 107, 53, 0.06) 0%, transparent 100%)',
                paddingTop: '3rem',
                paddingBottom: '2.5rem',
                textAlign: 'center'
            }}>
                <div className="container">
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.85rem',
                        background: 'rgba(255, 107, 53, 0.12)',
                        border: '1px solid rgba(255, 107, 53, 0.2)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--accent-sport)',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        <IoTrophy style={{ verticalAlign: '-0.1em' }} /> Sport Booking
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                        fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1.2,
                        marginBottom: '0.75rem'
                    }}>
                        Find Your<br />
                        <span style={{ color: 'var(--accent-sport)' }}>Booked Activities</span>
                    </h1>

                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        maxWidth: '480px',
                        margin: '0 auto 1.75rem',
                        lineHeight: 1.6
                    }}>
                        ค้นหาด้วยเบอร์โทรศัพท์เพื่อตรวจสอบสถานะ ชำระเงิน และจัดการการจองของคุณ
                    </p>

                    {/* Search Bar */}
                    <div style={{
                        maxWidth: '500px',
                        margin: '0 auto',
                        display: 'flex',
                        gap: '0',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.35rem 0.35rem 0.35rem 1.25rem',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem', fontSize: '1rem', display: 'flex' }}><IoCall /></span>
                        <input
                            type="tel"
                            placeholder="Enter Phone Number..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                padding: '0.5rem 0'
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            style={{
                                background: 'var(--accent-sport)',
                                color: 'white',
                                border: 'none',
                                padding: '0.65rem 1.25rem',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 12px rgba(255, 107, 53, 0.3)',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <IoSearch style={{ verticalAlign: '-0.1em' }} /> Search
                        </button>
                    </div>

                    {/* Stats (after search) */}
                    {searched && bookings.length > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '2.5rem',
                            marginTop: '1.5rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-sport)' }}>{totalBookings}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Bookings</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-sport)' }}>{activeBookings}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <section className="section" style={{ paddingTop: '1.5rem' }}>
                <div className="container">
                    {searched && bookings.length > 0 && (
                        <div>
                            {/* Section Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Bookings</h2>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Results for: <span style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            padding: '0.15rem 0.6rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontFamily: 'var(--font-mono)',
                                            color: 'var(--accent-sport)'
                                        }}>{phone}</span>
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div style={{
                                    display: 'flex',
                                    background: 'var(--bg-card)',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden'
                                }}>
                                    {['upcoming', 'history'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setFilter(tab)}
                                            style={{
                                                padding: '0.45rem 1rem',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: filter === tab ? 'var(--accent-sport)' : 'transparent',
                                                color: filter === tab ? 'white' : 'var(--text-muted)',
                                                transition: 'all 0.2s',
                                                borderRadius: 'var(--radius-full)'
                                            }}
                                        >
                                            {tab === 'upcoming' ? 'Upcoming' : 'History'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Cards Grid */}
                            {filteredBookings.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.25rem'
                                }}>
                                    {filteredBookings.map(booking => (
                                        <div key={booking.id} style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xl)',
                                            overflow: 'hidden',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                                        >
                                            {/* Card Image */}
                                            <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                                                <img
                                                    src={booking.fieldImage}
                                                    alt={booking.fieldName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}></div>
                                                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', right: '1rem' }}>
                                                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-sport)', fontWeight: 600, marginBottom: '0.2rem' }}>
                                                        {typeLabels[booking.fieldType] || 'กีฬา'}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'white' }}>{booking.fieldName}</h3>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div style={{ padding: '1rem 1.25rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <span style={{ color: 'var(--accent-sport)', display: 'flex' }}><IoCalendar /></span>
                                                        <span style={{ fontWeight: 600 }}>DATE</span>
                                                        <span style={{ marginLeft: 'auto' }}>{formatDateThai(booking.date)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <span style={{ color: 'var(--accent-sport)', display: 'flex' }}><IoTime /></span>
                                                        <span style={{ fontWeight: 600 }}>TIME</span>
                                                        <span style={{ marginLeft: 'auto' }}>
                                                            {booking.timeSlot}
                                                            {booking.slots && <span style={{ color: 'var(--text-muted)' }}> ({booking.slots.length * 60} mins)</span>}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                                                    <div style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: 700,
                                                        fontFamily: 'var(--font-numbers)',
                                                        color: booking.status === 'cancelled' || booking.status === 'expired' ? 'var(--text-muted)' : 'var(--text-primary)',
                                                        textDecoration: booking.status === 'cancelled' || booking.status === 'expired' ? 'line-through' : 'none'
                                                    }}>
                                                        ฿{formatPrice(booking.totalPrice || booking.price)}
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        {booking.status === 'pending' && (
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => setShowQR(booking)}
                                                                style={{
                                                                    background: 'var(--accent-sport)',
                                                                    color: 'white',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    padding: '0.35rem 0.75rem',
                                                                    borderRadius: 'var(--radius-md)'
                                                                }}
                                                            >
                                                                PAY NOW
                                                            </button>
                                                        )}
                                                        {booking.status === 'cancelled' || booking.status === 'expired' ? (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                {booking.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setSelectedBooking(booking)}
                                                                style={{
                                                                    fontSize: '0.8rem',
                                                                    color: 'var(--accent-sport)',
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    padding: 0
                                                                }}
                                                            >
                                                                Details →
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pending action */}
                                                {booking.status === 'pending' && canCancel(booking) && (
                                                    <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.15)',
                                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                color: '#ef4444',
                                                                fontSize: '0.7rem',
                                                                cursor: 'pointer',
                                                                textDecoration: 'none',
                                                                padding: '0.3rem 0.75rem',
                                                                borderRadius: '6px'
                                                            }}
                                                        >
                                                            ยกเลิกการจอง
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '2rem' }}>
                                    <div className="empty-state-icon">{filter === 'upcoming' ? <IoCalendar /> : <HiClipboardList />}</div>
                                    <h3 className="empty-state-title">
                                        {filter === 'upcoming' ? 'ไม่มีการจองที่กำลังจะถึง' : 'ไม่มีประวัติการจอง'}
                                    </h3>
                                </div>
                            )}
                        </div>
                    )}

                    {searched && bookings.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon"><HiClipboardList /></div>
                            <h3 className="empty-state-title">ไม่พบการจอง</h3>
                            <p className="empty-state-description">
                                ยังไม่มีการจองในระบบสำหรับเบอร์โทรศัพท์นี้
                            </p>
                            <Link to="/" className="btn btn-primary">
                                จองสนามกีฬา
                            </Link>
                        </div>
                    )}

                    {!searched && (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <div className="empty-state-icon"><IoSearch /></div>
                            <h3 className="empty-state-title">กรอกเบอร์โทรศัพท์เพื่อค้นหา</h3>
                            <p className="empty-state-description">
                                ใช้เบอร์โทรศัพท์ที่คุณใช้ในการจองสนาม
                            </p>
                        </div>
                    )}
                </div>
            </section>

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

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="ยกเลิกการจอง"
                message="คุณต้องการยกเลิกการจองนี้หรือไม่? การยกเลิกไม่สามารถเรียกคืนได้"
                confirmLabel="ยกเลิกการจอง"
                onConfirm={confirmCancel}
                onCancel={() => setConfirmState({ isOpen: false, bookingId: null })}
            />

            {showToast && (
                <div className="toast-container">
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setShowToast(false)}
                    />
                </div>
            )}

            {/* Booking Detail Popup */}
            {selectedBooking && (
                <div className="modal-overlay active" onClick={() => setSelectedBooking(null)} role="dialog" aria-modal="true">
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border-color)',
                        maxWidth: '440px',
                        width: '90%',
                        overflow: 'hidden',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        maxHeight: '85vh',
                        overflowY: 'auto'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>รายละเอียดการจอง</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem' }}
                            >✕</button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            {/* Status */}
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                <StatusBadge status={selectedBooking.status} />
                            </div>

                            {/* Booking Info */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.25rem',
                                marginBottom: '1rem'
                            }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ข้อมูลการจอง</h4>
                                {[{label:'สนาม', value: selectedBooking.fieldName, accent: true},
                                  {label:'วันที่', value: formatDateThai(selectedBooking.date)},
                                  {label:'เวลา', value: selectedBooking.timeSlot},
                                  {label:'รหัสการจอง', value: '#' + (selectedBooking.id?.slice(-8).toUpperCase()), mono: true}
                                ].map((row, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.label}</span>
                                        <span style={{
                                            color: row.accent ? 'var(--accent-sport)' : 'var(--text-primary)',
                                            fontWeight: row.accent ? 600 : 400,
                                            fontFamily: row.mono ? 'monospace' : 'inherit',
                                            fontSize: '0.85rem'
                                        }}>{row.value}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>ราคารวม</span>
                                    <span style={{ color: 'var(--accent-sport)', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-numbers)' }}>
                                        ฿{formatPrice(selectedBooking.totalPrice || selectedBooking.price)}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.25rem',
                                marginBottom: '1rem'
                            }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ข้อมูลผู้จอง</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ชื่อ</span>
                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{selectedBooking.customerName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>เบอร์โทร</span>
                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{selectedBooking.customerPhone}</span>
                                </div>
                            </div>

                            {/* Payment Slip */}
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.25rem',
                                marginBottom: '1.25rem'
                            }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>สลิปการโอน</h4>
                                {selectedBooking.paymentSlip ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <img
                                            src={selectedBooking.paymentSlip}
                                            alt="สลิป"
                                            style={{
                                                maxWidth: '100%', maxHeight: '200px',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(selectedBooking.paymentSlip, '_blank')}
                                        />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>ส่งแล้ว รอ Admin ตรวจสอบ</p>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>ยังไม่ได้แนบสลิป</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {selectedBooking.status === 'pending' && (
                                    <button
                                        onClick={() => { setShowQR(selectedBooking); setSelectedBooking(null); }}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        ชำระเงิน / แนบสลิป
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="btn btn-secondary"
                                    style={{ flex: selectedBooking.status === 'pending' ? 'none' : 1 }}
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
