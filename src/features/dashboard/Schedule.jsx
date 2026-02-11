import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getFields, getBookings, timeSlots, fieldTypes, expireOverdueBookings, formatPrice } from '../../data';

export default function Schedule() {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedType, setSelectedType] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [fields, setFields] = useState([]);
    const [popup, setPopup] = useState(null);
    const popupRef = useRef(null);

    useEffect(() => {
        const loadData = () => {
            expireOverdueBookings();
            setFields(getFields());
            setBookings(getBookings());
        };
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setPopup(null);
            }
        };
        if (popup) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popup]);

    // Filter fields by type
    const filteredFields = selectedType === 'all'
        ? fields
        : fields.filter(f => f.type === selectedType);

    // Get booking info for a specific field + date + slot
    const getSlotBooking = (fieldId, date, slot) => {
        return bookings.find(b => {
            if (b.fieldId !== fieldId || b.date !== date) return false;
            if (b.status === 'cancelled' || b.status === 'expired') return false;
            const slots = b.slots || [b.timeSlot];
            return slots.includes(slot);
        });
    };

    // Calculate stats
    const stats = (() => {
        let available = 0, pending = 0, confirmed = 0;
        filteredFields.forEach(field => {
            timeSlots.forEach(slot => {
                const booking = getSlotBooking(field.id, selectedDate, slot);
                if (!booking) available++;
                else if (booking.status === 'pending') pending++;
                else if (booking.status === 'confirmed') confirmed++;
            });
        });
        return { available, pending, confirmed, total: available + pending + confirmed };
    })();

    // Navigate date
    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const formatThaiDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusClass = (booking) => {
        if (!booking) return '';
        return booking.status === 'confirmed' ? 'confirmed' : 'pending';
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return '✓ ชำระแล้ว';
            case 'pending': return '⏳ รอชำระ';
            default: return status;
        }
    };

    const getFieldTypeIcon = (type) => {
        switch (type) {
            case 'football': return '⚽';
            case 'badminton': return '🏸';
            case 'basketball': return '🏀';
            case 'tennis': return '🎾';
            default: return '🏟️';
        }
    };

    const handleCellClick = (field, slot, booking, e) => {
        if (!booking) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPopup({
            booking,
            fieldName: field.name,
            slot,
            x: Math.min(rect.left, window.innerWidth - 320),
            y: rect.bottom + 8
        });
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>📅 ตารางสนาม</h2>
            </div>

            {/* Date Navigation */}
            <div className="premium-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => changeDate(-1)}
                        >
                            ← ก่อนหน้า
                        </button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => changeDate(1)}
                        >
                            ถัดไป →
                        </button>
                        {selectedDate !== today && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => setSelectedDate(today)}
                            >
                                วันนี้
                            </button>
                        )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {formatThaiDate(selectedDate)}
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="premium-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
                    <div className="schedule-stat-label">Slot ทั้งหมด</div>
                </div>
                <div className="premium-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--success-400)' }}>{stats.available}</div>
                    <div className="schedule-stat-label">ว่าง</div>
                </div>
                <div className="premium-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--warning-400)' }}>{stats.pending}</div>
                    <div className="schedule-stat-label">รอชำระ</div>
                </div>
                <div className="premium-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--success-400)' }}>{stats.confirmed}</div>
                    <div className="schedule-stat-label">ชำระแล้ว</div>
                </div>
            </div>

            {/* Filter + Legend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Field Type Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {fieldTypes.map(type => (
                        <button
                            key={type.id}
                            className={`filter-pill ${selectedType === type.id ? 'active' : ''}`}
                            onClick={() => setSelectedType(type.id)}
                        >
                            {type.id !== 'all' && getFieldTypeIcon(type.id)} {type.name}
                        </button>
                    ))}
                </div>

                {/* Legend */}
                <div className="schedule-legend">
                    <div className="schedule-legend-item">
                        <span className="schedule-legend-dot schedule-legend-available"></span>
                        ว่าง
                    </div>
                    <div className="schedule-legend-item">
                        <span className="schedule-legend-dot schedule-legend-pending"></span>
                        รอชำระ
                    </div>
                    <div className="schedule-legend-item">
                        <span className="schedule-legend-dot schedule-legend-confirmed"></span>
                        ชำระแล้ว
                    </div>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <div className="schedule-grid-wrapper">
                    <table className="schedule-grid">
                        <thead>
                            <tr>
                                <th className="schedule-grid-header schedule-field-col">สนาม</th>
                                {timeSlots.map(slot => (
                                    <th key={slot} className="schedule-grid-header schedule-time-col">
                                        {slot.split('-')[0]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFields.map(field => (
                                <tr key={field.id}>
                                    <td className="schedule-field-cell">
                                        <div className="schedule-field-name">
                                            <span className="schedule-field-icon">{getFieldTypeIcon(field.type)}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{field.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    ฿{formatPrice(field.price)}/ชม.
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {timeSlots.map(slot => {
                                        const booking = getSlotBooking(field.id, selectedDate, slot);
                                        const statusClass = getStatusClass(booking);
                                        return (
                                            <td
                                                key={slot}
                                                className={`schedule-cell ${statusClass}`}
                                                onClick={(e) => handleCellClick(field, slot, booking, e)}
                                                title={booking ? `${booking.customerName} - ${getStatusLabel(booking.status)}` : 'ว่าง'}
                                            >
                                                {booking && (
                                                    <div className="schedule-cell-content">
                                                        <span className="schedule-cell-icon">
                                                            {booking.status === 'confirmed' ? '✓' : '⏳'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {filteredFields.length === 0 && (
                                <tr>
                                    <td colSpan={timeSlots.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        ไม่พบสนามในประเภทนี้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Popup */}
            {popup && (
                <div
                    ref={popupRef}
                    className="schedule-popup"
                    style={{
                        position: 'fixed',
                        top: Math.min(popup.y, window.innerHeight - 250),
                        left: Math.min(popup.x, window.innerWidth - 320),
                        zIndex: 1000
                    }}
                >
                    <div className="schedule-popup-header">
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>📋 รายละเอียดการจอง</h4>
                        <button
                            onClick={() => setPopup(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="schedule-popup-body">
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">สนาม</span>
                            <span>{popup.fieldName}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">เวลา</span>
                            <span>{popup.booking.timeSlot || popup.slot}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">ผู้จอง</span>
                            <span>{popup.booking.customerName}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">เบอร์โทร</span>
                            <span>{popup.booking.customerPhone}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">ยอดรวม</span>
                            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                                ฿{formatPrice(popup.booking.totalPrice || popup.booking.price)}
                            </span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">สถานะ</span>
                            <span className={`badge ${popup.booking.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                                {getStatusLabel(popup.booking.status)}
                            </span>
                        </div>
                    </div>
                    <div className="schedule-popup-footer">
                        <Link
                            to={`/dashboard/bookings/${popup.booking.id}`}
                            className="btn btn-sm btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            📄 ดูรายละเอียดเต็ม
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
