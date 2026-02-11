import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getBookings, deleteBooking, expireOverdueBookings, formatPrice } from '../../data';

const ITEMS_PER_PAGE = 5;

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [confirmState, setConfirmState] = useState({ isOpen: false, bookingId: null });
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = () => {
        expireOverdueBookings();
        setBookings(getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleDeleteBooking = (bookingId) => {
        setConfirmState({ isOpen: true, bookingId });
    };

    const confirmDelete = () => {
        deleteBooking(confirmState.bookingId);
        setConfirmState({ isOpen: false, bookingId: null });
        loadData();
    };

    // Counts
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled' || b.status === 'expired').length;

    // Stats
    const todayRevenue = (() => {
        const today = new Date().toISOString().split('T')[0];
        return bookings
            .filter(b => b.date === today && b.status === 'confirmed')
            .reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0);
    })();

    // Filtered bookings
    const filteredBookings = bookings.filter(b => {
        if (filter === 'pending' && b.status !== 'pending') return false;
        if (filter === 'confirmed' && b.status !== 'confirmed') return false;
        if (filter === 'cancelled' && b.status !== 'cancelled' && b.status !== 'expired') return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                (b.customerPhone && b.customerPhone.includes(q)) ||
                (b.customerName && b.customerName.toLowerCase().includes(q)) ||
                (b.fieldName && b.fieldName.toLowerCase().includes(q))
            );
        }
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page on filter/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, search]);

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="admin-page-title" style={{ marginBottom: 0 }}>
                    <h2>จัดการการจอง</h2>
                </div>
            </div>

            {/* Top Stats */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="admin-stat-label">รายได้วันนี้</div>
                            <div className="admin-stat-value" style={{ fontSize: '1.5rem' }}>฿{formatPrice(todayRevenue)}</div>
                        </div>
                        <div className="admin-stat-icon gold" style={{ marginBottom: 0 }}>💰</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="admin-stat-label">การจองทั้งหมด</div>
                            <div className="admin-stat-value" style={{ fontSize: '1.5rem' }}>{bookings.length}</div>
                        </div>
                        <div className="admin-stat-icon blue" style={{ marginBottom: 0 }}>📋</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="admin-stat-label">รออนุมัติ</div>
                            <div className="admin-stat-value" style={{ fontSize: '1.5rem', color: 'var(--accent-sport)' }}>{pendingCount}</div>
                        </div>
                        <div className="admin-stat-icon orange" style={{ marginBottom: 0 }}>⏳</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-bar">
                <div className="admin-filter-tabs">
                    <button className={`admin-filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All Bookings
                    </button>
                    <button className={`admin-filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        Pending {pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
                    </button>
                    <button className={`admin-filter-tab ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>
                        Paid
                    </button>
                    <button className={`admin-filter-tab ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
                        Cancelled
                    </button>
                </div>
                <div className="admin-search">
                    <span className="admin-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by phone number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Field</th>
                                <th>User Info</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBookings.map(b => (
                                <tr key={b.id}>
                                    <td>
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
                                        <div className={`date-cell-time ${b.status === 'pending' ? 'highlight' : ''}`}>
                                            {b.timeSlot}
                                        </div>
                                    </td>
                                    <td><StatusBadge status={b.status} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link to={`/dashboard/bookings/${b.id}`} className="btn btn-sm btn-secondary">
                                                📄
                                            </Link>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBooking(b.id)}>
                                                🗑️
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

                {/* Pagination */}
                {filteredBookings.length > 0 && (
                    <div className="admin-pagination">
                        <div className="admin-pagination-info">
                            Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBookings.length)}</strong> to{' '}
                            <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}</strong> of{' '}
                            <strong>{filteredBookings.length}</strong> results
                        </div>
                        <div className="admin-pagination-controls">
                            <button
                                className="admin-page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >‹</button>
                            {getPageNumbers().map((page, i) =>
                                page === '...' ? (
                                    <span key={`dots-${i}`} className="admin-page-btn" style={{ cursor: 'default', border: 'none' }}>…</span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`admin-page-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >{page}</button>
                                )
                            )}
                            <button
                                className="admin-page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >›</button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="ลบการจอง"
                message="ยืนยันการลบการจองนี้? ข้อมูลจะหายถาวรและไม่สามารถกู้คืนได้"
                confirmLabel="ลบถาวร"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ isOpen: false, bookingId: null })}
            />
        </div>
    );
}
