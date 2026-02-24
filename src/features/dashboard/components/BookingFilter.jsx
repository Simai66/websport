import { IoSearch } from 'react-icons/io5';

// eslint-disable-next-line react-refresh/only-export-components
export const BOOKING_STATUS = {
    ALL: 'all',
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
};

export default function BookingFilter({ filter, setFilter, pendingCount, search, setSearch }) {
    return (
        <div className="admin-filter-bar">
            <div className="admin-filter-tabs">
                <button className={`admin-filter-tab ${filter === BOOKING_STATUS.ALL ? 'active' : ''}`} onClick={() => setFilter(BOOKING_STATUS.ALL)}>
                    All Bookings
                </button>
                <button className={`admin-filter-tab ${filter === BOOKING_STATUS.PENDING ? 'active' : ''}`} onClick={() => setFilter(BOOKING_STATUS.PENDING)}>
                    Pending {pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
                </button>
                <button className={`admin-filter-tab ${filter === BOOKING_STATUS.CONFIRMED ? 'active' : ''}`} onClick={() => setFilter(BOOKING_STATUS.CONFIRMED)}>
                    Paid
                </button>
                <button className={`admin-filter-tab ${filter === BOOKING_STATUS.CANCELLED ? 'active' : ''}`} onClick={() => setFilter(BOOKING_STATUS.CANCELLED)}>
                    Cancelled
                </button>
            </div>
            <div className="admin-search">
                <span className="admin-search-icon"><IoSearch /></span>
                <input
                    type="text"
                    placeholder="Search by phone number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="ค้นหาข้อมูลการจองด้วยเบอร์โทร ชื่อ หรือสนาม"
                />
            </div>
        </div>
    );
}
