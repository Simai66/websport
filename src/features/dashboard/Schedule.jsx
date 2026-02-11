import { useState, useEffect } from 'react';
import { getBookings, getFields, timeSlots, fieldTypes, expireOverdueBookings, formatPrice, confirmBookingPayment } from '../../data';

export default function Schedule() {
    const [fields, setFields] = useState(() => { expireOverdueBookings(); return getFields(); });
    const [bookings, setBookings] = useState(() => getBookings());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState('all');
    const [popup, setPopup] = useState(null);

    const loadData = () => {
        expireOverdueBookings();
        setFields(getFields());
        setBookings(getBookings());
    };

    useEffect(() => {
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
        setPopup(null);
    };

    const getSlotBooking = (fieldId, date, slot) => {
        return bookings.find(b => {
            if (b.fieldId !== fieldId || b.date !== date) return false;
            if (b.status === 'cancelled' || b.status === 'expired') return false;
            const slots = b.slots || [b.timeSlot];
            return slots.includes(slot);
        });
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

    const handleConfirmBooking = (bookingId) => {
        confirmBookingPayment(bookingId);
        loadData();
        setPopup(null);
    };

    const filteredFields = filterType === 'all'
        ? fields
        : fields.filter(f => f.type === filterType);

    const formatSelectedDate = () => {
        const d = new Date(selectedDate);
        return d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;

    // Stats for the day
    const dayBookings = bookings.filter(b => b.date === selectedDate && b.status !== 'cancelled' && b.status !== 'expired');
    const pendingCount = dayBookings.filter(b => b.status === 'pending').length;
    const confirmedCount = dayBookings.filter(b => b.status === 'confirmed').length;
    const dayRevenue = dayBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0);

    return (
        <div onClick={() => popup && setPopup(null)}>
            {/* Page Title */}
            <div className="admin-page-title">
                <h2>ตารางสนาม</h2>
            </div>

            {/* Date Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => changeDate(-1)}>◀</button>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {formatSelectedDate()}
                        </div>
                        {isToday && <div style={{ fontSize: '0.75rem', color: 'var(--accent-sport)' }}>Today</div>}
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => changeDate(1)}>▶</button>
                    {!isToday && (
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelectedDate(today)}>Today</button>
                    )}
                </div>

                {/* Filter by Type */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="schedule-legend">
                        <div className="schedule-legend-item">
                            <div className="schedule-legend-dot schedule-legend-available"></div>
                            <span>Available</span>
                        </div>
                        <div className="schedule-legend-item">
                            <div className="schedule-legend-dot schedule-legend-pending"></div>
                            <span>Pending</span>
                        </div>
                        <div className="schedule-legend-item">
                            <div className="schedule-legend-dot schedule-legend-confirmed"></div>
                            <span>Confirmed</span>
                        </div>
                    </div>
                    <select
                        value={filterType}
                        onChange={e => {
                            setFilterType(e.target.value);
                            setPopup(null);
                        }}
                        style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                        }}
                    >
                        {fieldTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Day Stats */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.25rem' }}>
                <div className="admin-stat-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--text-primary)' }}>{dayBookings.length}</div>
                    <div className="schedule-stat-label">Total Bookings</div>
                </div>
                <div className="admin-stat-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--accent-sport)' }}>{pendingCount}</div>
                    <div className="schedule-stat-label">Pending</div>
                </div>
                <div className="admin-stat-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--success-400)' }}>{confirmedCount}</div>
                    <div className="schedule-stat-label">Confirmed</div>
                </div>
                <div className="admin-stat-card schedule-stat-card">
                    <div className="schedule-stat-value" style={{ color: 'var(--accent-gold)' }}>฿{formatPrice(dayRevenue)}</div>
                    <div className="schedule-stat-label">Revenue</div>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <div className="schedule-grid-wrapper">
                    <table className="schedule-grid">
                        <thead>
                            <tr>
                                <th className="schedule-grid-header schedule-field-col">Field</th>
                                {timeSlots.map(slot => (
                                    <th key={slot} className="schedule-grid-header schedule-time-col">{slot}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFields.map(field => (
                                <tr key={field.id}>
                                    <td className="schedule-field-cell">
                                        <div className="schedule-field-name">
                                            <span className="schedule-field-icon">
                                                {field.type === 'football' ? '⚽' : field.type === 'badminton' ? '🏸' : field.type === 'basketball' ? '🏀' : '🎾'}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{field.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--accent-sport)' }}>฿{formatPrice(field.price)}/hr</div>
                                            </div>
                                        </div>
                                    </td>
                                    {timeSlots.map(slot => {
                                        const booking = getSlotBooking(field.id, selectedDate, slot);
                                        const status = booking ? booking.status : 'available';
                                        return (
                                            <td
                                                key={slot}
                                                className={`schedule-cell ${status}`}
                                                onClick={(e) => handleCellClick(field, slot, booking, e)}
                                            >
                                                <div className="schedule-cell-content">
                                                    {status === 'pending' && <span className="schedule-cell-icon">⏳</span>}
                                                    {status === 'confirmed' && <span className="schedule-cell-icon">✓</span>}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Popup */}
            {popup && (
                <div
                    className="schedule-popup"
                    style={{ position: 'fixed', top: popup.y, left: popup.x, zIndex: 999 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="schedule-popup-header">
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Booking Details</h4>
                        <button
                            onClick={() => setPopup(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                        >✕</button>
                    </div>
                    <div className="schedule-popup-body">
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">Field</span>
                            <span style={{ fontWeight: 600 }}>{popup.fieldName}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">Time</span>
                            <span style={{ fontWeight: 600, color: 'var(--accent-sport)' }}>{popup.slot}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">Customer</span>
                            <span>{popup.booking.customerName}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">Phone</span>
                            <span>{popup.booking.customerPhone}</span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">Status</span>
                            <span className={`badge badge-${popup.booking.status === 'confirmed' ? 'success' : 'warning'}`}>
                                {popup.booking.status === 'confirmed' ? '✓ ชำระแล้ว' : '⏳ รอชำระ'}
                            </span>
                        </div>
                        <div className="schedule-popup-row">
                            <span className="schedule-popup-label">Amount</span>
                            <span style={{ fontWeight: 700 }}>฿{formatPrice(popup.booking.totalPrice || popup.booking.price)}</span>
                        </div>
                    </div>
                    {popup.booking.status === 'pending' && (
                        <div className="schedule-popup-footer">
                            <button
                                className="btn btn-success btn-sm"
                                style={{ width: '100%' }}
                                onClick={() => handleConfirmBooking(popup.booking.id)}
                            >
                                ✓ Confirm Payment
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
