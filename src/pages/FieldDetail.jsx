import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import Toast from '../components/Toast';
import QRPayment from '../components/QRPayment';
import {
    getFieldById,
    timeSlots,
    isSlotBooked,
    addBooking,
    getSettings,
    formatPrice,
    formatDateThai
} from '../data';

export default function FieldDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const field = getFieldById(id);
    const settings = getSettings();

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [showQR, setShowQR] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);

    const maxSlots = settings.maxHoursPerBooking || 4;

    if (!field) {
        return (
            <div className="page-header">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">❌</div>
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
            // Deselect: only allow if it's at the edge
            const selectedIndices = selectedSlots.map(s => timeSlots.indexOf(s)).sort((a, b) => a - b);
            if (slotIndex === selectedIndices[0] || slotIndex === selectedIndices[selectedIndices.length - 1]) {
                setSelectedSlots(prev => prev.filter(s => s !== slot));
            }
        } else {
            if (selectedSlots.length === 0) {
                // First selection
                setSelectedSlots([slot]);
            } else if (selectedSlots.length < maxSlots) {
                // Check if consecutive
                const selectedIndices = selectedSlots.map(s => timeSlots.indexOf(s)).sort((a, b) => a - b);
                const minIndex = selectedIndices[0];
                const maxIndex = selectedIndices[selectedIndices.length - 1];

                // Allow only if adjacent to current selection
                if (slotIndex === minIndex - 1 || slotIndex === maxIndex + 1) {
                    // Check if all slots in between are available
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
        const minIndex = selectedIndices[0];
        const maxIndex = selectedIndices[selectedIndices.length - 1];

        return slotIndex === minIndex - 1 || slotIndex === maxIndex + 1;
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

        // Check all slots are still available
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

    const typeLabels = {
        football: 'ฟุตบอล',
        badminton: 'แบดมินตัน',
        basketball: 'บาสเกตบอล',
        tennis: 'เทนนิส'
    };

    return (
        <div>
            <div className="page-header">
                <div className="container page-header-content">
                    <h1 className="page-title">{field.name}</h1>
                    <p className="page-description">{typeLabels[field.type]}</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <div className="field-detail-layout">
                        {/* Left Column - Field Info */}
                        <div>
                            <div className="field-gallery">
                                <img src={field.image} alt={field.name} />
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <h2 style={{ marginBottom: '1rem' }}>รายละเอียดสนาม</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {field.description}
                                </p>

                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>สิ่งอำนวยความสะดวก</h3>
                                <div className="field-facilities">
                                    {field.facilities && Array.isArray(field.facilities) ? field.facilities.map((facility, index) => (
                                        <span key={index} className="field-facility">
                                            ✓ {facility}
                                        </span>
                                    )) : <span style={{ color: 'var(--text-muted)' }}>ไม่มีข้อมูลสิ่งอำนวยความสะดวก</span>}
                                </div>

                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-lg)',
                                    marginTop: '1rem'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>ราคา:</span>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: 'var(--primary-400)',
                                        marginLeft: '0.5rem'
                                    }}>
                                        ฿{formatPrice(field.price)}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/ชั่วโมง</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Booking */}
                        <div className="booking-sidebar">
                            <h2 className="booking-sidebar-title">จองสนาม</h2>

                            {/* Info */}
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1rem',
                                fontSize: '0.875rem',
                                color: 'var(--primary-400)'
                            }}>
                                💡 เลือกได้สูงสุด {maxSlots} ชั่วโมงติดต่อกัน
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
                                    <label className="form-label">
                                        เลือกเวลา ({formatDateThai(selectedDate)})
                                        {selectedSlots.length > 0 && (
                                            <span style={{ color: 'var(--primary-400)', marginLeft: '0.5rem' }}>
                                                - เลือกแล้ว {selectedSlots.length} ชม.
                                            </span>
                                        )}
                                    </label>
                                    <div className="time-slots">
                                        {timeSlots.map(slot => {
                                            const booked = isSlotBooked(field.id, selectedDate, slot);
                                            const selected = selectedSlots.includes(slot);
                                            const canSelect = canSelectSlot(slot);

                                            return (
                                                <button
                                                    key={slot}
                                                    className={`time-slot ${booked ? 'booked' : ''} ${selected ? 'selected' : ''}`}
                                                    onClick={() => handleSlotClick(slot)}
                                                    disabled={booked}
                                                    style={{
                                                        opacity: !booked && !selected && !canSelect ? 0.5 : 1,
                                                        cursor: booked ? 'not-allowed' : canSelect || selected ? 'pointer' : 'default'
                                                    }}
                                                >
                                                    <div className="time-slot-time">{slot}</div>
                                                    <div className="time-slot-status">
                                                        {booked ? 'จองแล้ว' : selected ? '✓ เลือก' : 'ว่าง'}
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
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div className="booking-summary">
                                        <div className="booking-summary-row">
                                            <span className="booking-summary-label">สนาม</span>
                                            <span className="booking-summary-value">{field.name}</span>
                                        </div>
                                        <div className="booking-summary-row">
                                            <span className="booking-summary-label">วันที่</span>
                                            <span className="booking-summary-value">{formatDateThai(selectedDate)}</span>
                                        </div>
                                        <div className="booking-summary-row">
                                            <span className="booking-summary-label">เวลา</span>
                                            <span className="booking-summary-value">
                                                {selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1].split('-')[1]}
                                            </span>
                                        </div>
                                        <div className="booking-summary-row">
                                            <span className="booking-summary-label">จำนวน</span>
                                            <span className="booking-summary-value">{selectedSlots.length} ชั่วโมง</span>
                                        </div>
                                        <div className="booking-summary-row">
                                            <span className="booking-summary-label">ราคาต่อชม.</span>
                                            <span className="booking-summary-value">฿{formatPrice(field.price)}</span>
                                        </div>
                                        <div className="booking-summary-row">
                                            <span className="booking-summary-label">รวมทั้งสิ้น</span>
                                            <span className="booking-summary-value booking-summary-total">
                                                ฿{formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%' }}
                                        onClick={handleBooking}
                                    >
                                        จองและชำระเงิน
                                    </button>

                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        textAlign: 'center',
                                        marginTop: '0.75rem'
                                    }}>
                                        ⏱️ มีเวลา {settings.bookingTimeoutMinutes} นาที ในการชำระเงิน
                                    </p>
                                </div>
                            )}

                            {!selectedDate && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                    กรุณาเลือกวันที่เพื่อดูช่วงเวลาว่าง
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* QR Payment Modal */}
            {showQR && currentBooking && (
                <QRPayment
                    amount={totalPrice}
                    booking={currentBooking}
                    onClose={handleQRClose}
                    onTimeout={handleQRTimeout}
                />
            )}

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
