import { Link } from 'react-router-dom';
import { IoDocumentText, IoTrash } from 'react-icons/io5';
import StatusBadge from '../../../components/StatusBadge';
import { BOOKING_STATUS } from './BookingFilter';

export default function BookingTable({ paginatedBookings, search, handleDeleteBooking }) {
    const formatDateShort = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>Booking ID</th>
                        <th>Field</th>
                        <th>User Info</th>
                        <th>Date & Time</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedBookings.map(b => (
                        <tr key={b.id}>
                            <td style={{ textAlign: 'center', fontFamily: 'var(--font-numbers)', fontWeight: 600 }}>
                                <span className="booking-id">#{b.id.slice(-6).toUpperCase()}</span>
                            </td>
                            <td>
                                <div className="field-cell">
                                    {b.fieldImage && <img src={b.fieldImage} alt="" className="field-cell-img" />}
                                    <div>
                                        <div className="field-cell-name">{b.fieldName}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="user-cell-name">{b.customerName}</div>
                                <div className="user-cell-phone">{b.customerPhone}</div>
                            </td>
                            <td>
                                <div className="date-cell-date">{formatDateShort(b.date)}</div>
                                <div className={`date-cell-time ${b.status === BOOKING_STATUS.PENDING ? 'highlight' : ''}`}>
                                    {b.timeSlot}
                                </div>
                            </td>
                            <td style={{ textAlign: 'center' }}><StatusBadge status={b.status} /></td>
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <Link to={`/dashboard/bookings/${b.id}`} className="btn btn-sm btn-secondary" aria-label={`ดูรายละเอียดการจอง ${b.id.slice(-6).toUpperCase()}`}>
                                        <IoDocumentText />
                                    </Link>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBooking(b.id)} aria-label={`ลบการจอง ${b.id.slice(-6).toUpperCase()}`}>
                                        <IoTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {paginatedBookings.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {search ? 'ไม่พบผลลัพธ์' : 'ยังไม่มีการจอง'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
