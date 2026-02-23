import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import Toast from '../components/Toast';
import QRPayment from '../components/QRPayment';
import { IoCloseCircle, IoTimer, IoWater, IoCarSport, IoSparkles, IoWifi, IoCheckmark } from 'react-icons/io5';
import { MdDry } from 'react-icons/md';
import { BiDroplet } from 'react-icons/bi';
import {
    getFieldById,
    timeSlots,
    isSlotBooked,
    addBooking,
    getSettings,
    formatPrice,
    formatDateThai,
    typeLabels
} from '../data';
import { useAuth } from '../contexts/AuthContext';

export default function FieldDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const field = getFieldById(id);
    const settings = getSettings();

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const { user } = useAuth();

    // Auto-fill from user profile
    useEffect(() => {
        if (user) {
            if (user.name && !customerName) setCustomerName(user.name);
            if (user.phone && !customerPhone) setCustomerPhone(user.phone);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [showQR, setShowQR] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [showThankYou, setShowThankYou] = useState(false);

    const maxSlots = settings.maxHoursPerBooking || 4;

    if (!field) {
        return (
            <div className="page-header">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon"><IoCloseCircle /></div>
                        <h3 className="empty-state-title">ไม่พบสนามที่ต้องการ</h3>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            กลับหน้าแรก
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSlotClick = (slot) => {
        if (isSlotBooked(field.id, selectedDate, slot)) return;
        const slotIndex = timeSlots.indexOf(slot);
        if (selectedSlots.includes(slot)) {
            const selectedIndices = selectedSlots.map(s => timeSlots.indexOf(s)).sort((a, b) => a - b);
            if (slotIndex === selectedIndices[0] || slotIndex === selectedIndices[selectedIndices.length - 1]) {
                setSelectedSlots(prev => prev.filter(s => s !== slot));
            }
        } else {
            if (selectedSlots.length === 0) {
                setSelectedSlots([slot]);
            } else if (selectedSlots.length < maxSlots) {
                const selectedIndices = selectedSlots.map(s => timeSlots.indexOf(s)).sort((a, b) => a - b);
                const minIndex = selectedIndices[0];
                const maxIndex = selectedIndices[selectedIndices.length - 1];
                if (slotIndex === minIndex - 1 || slotIndex === maxIndex + 1) {
                    const newMin = Math.min(minIndex, slotIndex);
                    const newMax = Math.max(maxIndex, slotIndex);
                    let allAvailable = true;
                    for (let i = newMin; i <= newMax; i++) {
                        if (isSlotBooked(field.id, selectedDate, timeSlots[i])) {
                            allAvailable = false;
                            break;
                        }
                    }
                    if (allAvailable) {
                        setSelectedSlots(prev => [...prev, slot].sort((a, b) =>
                            timeSlots.indexOf(a) - timeSlots.indexOf(b)
                        ));
                    }
                }
            }
        }
    };

    const canSelectSlot = (slot) => {
        if (isSlotBooked(field.id, selectedDate, slot)) return false;
        if (selectedSlots.length === 0) return true;
        if (selectedSlots.includes(slot)) return true;
        if (selectedSlots.length >= maxSlots) return false;
        const slotIndex = timeSlots.indexOf(slot);
        const selectedIndices = selectedSlots.map(s => timeSlots.indexOf(s)).sort((a, b) => a - b);
        return slotIndex === selectedIndices[0] - 1 || slotIndex === selectedIndices[selectedIndices.length - 1] + 1;
    };

    const totalPrice = selectedSlots.length * field.price;

    const handleBooking = () => {
        if (!selectedDate || selectedSlots.length === 0) {
            setToastMessage('กรุณาเลือกวันที่และเวลา');
            setToastType('error');
            setShowToast(true);
            return;
        }
        if (!customerName.trim() || !customerPhone.trim()) {
            setToastMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
            setToastType('error');
            setShowToast(true);
            return;
        }
        for (const slot of selectedSlots) {
            if (isSlotBooked(field.id, selectedDate, slot)) {
                setToastMessage('บางช่วงเวลาถูกจองไปแล้ว กรุณาเลือกใหม่');
                setToastType('error');
                setShowToast(true);
                setSelectedSlots([]);
                return;
            }
        }
        const booking = addBooking({
            fieldId: field.id,
            fieldName: field.name,
            fieldImage: field.image,
            date: selectedDate,
            slots: selectedSlots,
            timeSlot: `${selectedSlots[0]} - ${selectedSlots[selectedSlots.length - 1].split('-')[1]}`,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            price: field.price,
            totalPrice: totalPrice
        });
        setCurrentBooking(booking);
        setShowQR(true);
        setToastMessage('จองสำเร็จ! กรุณาชำระเงินภายในเวลาที่กำหนด');
        setToastType('success');
        setShowToast(true);
    };

    const handleQRClose = () => {
        setShowQR(false);
        setShowThankYou(true);
    };

    const handleThankYouClose = () => {
        setShowThankYou(false);
        setSelectedSlots([]);
        setCustomerName('');
        setCustomerPhone('');
        navigate('/my-bookings');
    };

    const handleQRTimeout = () => {
        setShowQR(false);
        setToastMessage('หมดเวลาชำระเงิน การจองถูกยกเลิก');
        setToastType('error');
        setShowToast(true);
        setSelectedSlots([]);
    };

    const facilityIcons = {
        'ห้องน้ำ': <IoWater />,
        'ที่จอดรถ': <IoCarSport />,
        'ไฟส่องสว่าง': <IoSparkles />,
        'ห้องแต่งตัว': <MdDry />,
        'Wifi ฟรี': <IoWifi />,
        'น้ำดื่มฟรี': <BiDroplet />
    };

    const getFacilityIcon = (facility) => facilityIcons[facility] || <IoCheckmark />;

    // Check if a time slot is in the past (for today's date)
    const isSlotPast = (slot) => {
        if (!selectedDate) return false;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (selectedDate !== todayStr) return false;
        // slot format: "08:00-09:00" — check if the start hour has passed
        const slotHour = parseInt(slot.split(':')[0], 10);
        return slotHour <= now.getHours();
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header" style={{ paddingBottom: '1.5rem' }}>
                <div className="container page-header-content">
                    <h1 className="page-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.02em' }}>{field.name}</h1>
                    <p className="page-description" style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{typeLabels[field.type]}</p>
                </div>
            </div>

            <section className="section" style={{ paddingTop: '2rem' }}>
                <div className="container">
                    <div className="field-detail-layout">
                        {/* Left Column - Field Info */}
                        <div>
                            <div className="field-gallery" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
                                <img src={field.image} alt={field.name} />
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                {/* Section title with orange accent */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ width: '4px', height: '28px', background: 'var(--accent-sport)', borderRadius: '2px' }}></div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>รายละเอียดสนาม</h2>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                    {field.description}
                                </p>

                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>สิ่งอำนวยความสะดวก</h3>
                                <div className="field-facilities" style={{ gap: '0.6rem' }}>
                                    {field.facilities && Array.isArray(field.facilities) ? field.facilities.map((facility, index) => (
                                        <span key={index} className="field-facility" style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            padding: '0.45rem 0.85rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.8rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}>
                                            {getFacilityIcon(facility)} {facility}
                                        </span>
                                    )) : <span style={{ color: 'var(--text-muted)' }}>ไม่มีข้อมูล</span>}
                                </div>

                                {/* Price bar */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-xl)',
                                    marginTop: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ราคาต่อบริการ</span>
                                    <div>
                                        <span style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-numbers)',
                                            color: 'var(--accent-sport)'
                                        }}>
                                            ฿{formatPrice(field.price)}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>/ชั่วโมง</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Booking Sidebar */}
                        <div className="booking-sidebar" style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>จองสนาม</h2>

                            {/* Info pill */}
                            <div style={{
                                padding: '0.65rem 1rem',
                                background: 'rgba(255, 107, 53, 0.08)',
                                border: '1px solid rgba(255, 107, 53, 0.15)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: '1.25rem',
                                fontSize: '0.85rem',
                                color: 'var(--accent-sport)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📍 เลือกได้สูงสุด {maxSlots} ชั่วโมงติดต่อกัน
                            </div>

                            {/* Calendar */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">เลือกวันที่</label>
                                <Calendar
                                    selectedDate={selectedDate}
                                    onDateSelect={(date) => {
                                        setSelectedDate(date);
                                        setSelectedSlots([]);
                                    }}
                                />
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                                        เลือกเวลา ({formatDateThai(selectedDate)})
                                        {selectedSlots.length > 0 && (
                                            <span style={{ color: 'var(--accent-sport)', marginLeft: '0.5rem', fontWeight: 600 }}>
                                                — เลือกแล้ว {selectedSlots.length} ชม.
                                            </span>
                                        )}
                                    </label>
                                    <div className="time-slots">
                                        {timeSlots.map(slot => {
                                            const booked = isSlotBooked(field.id, selectedDate, slot);
                                            const past = isSlotPast(slot);
                                            const selected = selectedSlots.includes(slot);
                                            const canSelect = canSelectSlot(slot) && !past;
                                            return (
                                                <button
                                                    key={slot}
                                                    className={`time-slot ${booked ? 'booked' : ''} ${selected ? 'selected' : ''} ${past ? 'booked' : ''}`}
                                                    onClick={() => selectedDate && !booked && !past && canSelect && handleSlotClick(slot)}
                                                    disabled={booked || past}
                                                    style={{
                                                        opacity: past ? 0.35 : (!booked && !selected && !canSelect ? 0.4 : 1),
                                                        cursor: booked || past ? 'not-allowed' : canSelect || selected ? 'pointer' : 'default'
                                                    }}
                                                >
                                                    <div className="time-slot-time">{slot}</div>
                                                    <div className="time-slot-status">
                                                        {past ? 'ผ่านไปแล้ว' : booked ? 'จองแล้ว' : selected ? '✓ เลือก' : 'ว่าง'}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Booking Form */}
                            {selectedDate && selectedSlots.length > 0 && (
                                <div>
                                    <div className="form-group">
                                        <label className="form-label">ชื่อผู้จอง</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="กรอกชื่อ-นามสกุล"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            style={{ background: 'var(--bg-secondary)' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">เบอร์โทรศัพท์</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="0xx-xxx-xxxx"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            style={{ background: 'var(--bg-secondary)' }}
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div style={{
                                        padding: '1rem 1.25rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>รวมทั้งหมด</span>
                                        <span style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-numbers)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            ฿{formatPrice(totalPrice)}
                                        </span>
                                    </div>

                                    <button
                                        className="btn btn-lg btn-glow"
                                        style={{
                                            width: '100%',
                                            background: 'var(--accent-sport)',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.35)'
                                        }}
                                        onClick={handleBooking}
                                    >
                                        ดำเนินการต่อ →
                                    </button>

                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        textAlign: 'center',
                                        marginTop: '0.75rem'
                                    }}>
                                        <IoTimer style={{ verticalAlign: '-0.1em' }} /> มีเวลา {settings.bookingTimeoutMinutes} นาที ในการชำระเงิน
                                    </p>
                                </div>
                            )}

                            {!selectedDate && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                                    กรุณาเลือกวันที่เพื่อดูช่วงเวลาว่าง
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {showQR && currentBooking && (
                <QRPayment
                    amount={totalPrice}
                    booking={currentBooking}
                    onClose={handleQRClose}
                    onTimeout={handleQRTimeout}
                />
            )}

            {/* Thank You Summary Popup */}
            {showThankYou && currentBooking && (
                <div className="modal-overlay active" onClick={handleThankYouClose} role="dialog" aria-modal="true">
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border-color)',
                        maxWidth: '420px',
                        width: '90%',
                        overflow: 'hidden',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        animation: 'fadeInUp 0.3s ease'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                                ขอบคุณที่จอง!
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                การจองของคุณถูกบันทึกเรียบร้อยแล้ว
                            </p>
                        </div>

                        {/* Booking Summary */}
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.25rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>สนาม</span>
                                    <span style={{ color: 'var(--accent-sport)', fontWeight: 600 }}>{currentBooking.fieldName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>วันที่</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatDateThai(currentBooking.date)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>เวลา</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{currentBooking.timeSlot}</span>
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>ราคารวม</span>
                                    <span style={{
                                        color: 'var(--accent-sport)',
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-numbers)'
                                    }}>
                                        ฿{formatPrice(currentBooking.totalPrice || currentBooking.price)}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: '1rem'
                            }}>
                                รหัสการจอง: <span style={{ fontFamily: 'monospace', color: 'var(--accent-sport)' }}>#{currentBooking.id?.slice(-8).toUpperCase()}</span>
                            </div>

                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(255, 159, 28, 0.08)',
                                border: '1px solid rgba(255, 159, 28, 0.15)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                color: 'var(--accent-sport)',
                                marginBottom: '1.25rem'
                            }}>
                                รอ Admin ตรวจสอบสลิป สถานะจะเปลี่ยนเป็น "ชำระแล้ว" เมื่ออนุมัติ
                            </div>

                            <button
                                onClick={handleThankYouClose}
                                className="btn btn-primary btn-glow"
                                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                            >
                                ดูรายการจองของฉัน →
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
