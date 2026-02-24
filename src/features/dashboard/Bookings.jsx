import { useState, useEffect, useMemo, useCallback } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getBookings, deleteBooking, expireOverdueBookings } from '../../data';
import BookingStats from './components/BookingStats';
import BookingFilter, { BOOKING_STATUS } from './components/BookingFilter';
import BookingTable from './components/BookingTable';
import BookingPagination from './components/BookingPagination';

const ITEMS_PER_PAGE = 5;

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [confirmState, setConfirmState] = useState({ isOpen: false, bookingId: null });
    const [filter, setFilter] = useState(BOOKING_STATUS.ALL);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = useCallback(() => {
        expireOverdueBookings();
        setBookings(getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(loadData, 0);
        const interval = setInterval(loadData, 30000);
        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, [loadData]);

    const handleDeleteBooking = (bookingId) => {
        setConfirmState({ isOpen: true, bookingId });
    };

    const confirmDelete = () => {
        deleteBooking(confirmState.bookingId);
        setConfirmState({ isOpen: false, bookingId: null });
        loadData();
    };

    // Counts
    const pendingCount = useMemo(() => bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length, [bookings]);

    // Stats
    const todayRevenue = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return bookings
            .filter(b => b.date === today && b.status === BOOKING_STATUS.CONFIRMED)
            .reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0);
    }, [bookings]);

    // Filtered bookings
    const filteredBookings = useMemo(() => bookings.filter(b => {
        if (filter === BOOKING_STATUS.PENDING && b.status !== BOOKING_STATUS.PENDING) return false;
        if (filter === BOOKING_STATUS.CONFIRMED && b.status !== BOOKING_STATUS.CONFIRMED) return false;
        if (filter === BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.EXPIRED) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                (b.customerPhone && b.customerPhone.includes(q)) ||
                (b.customerName && b.customerName.toLowerCase().includes(q)) ||
                (b.fieldName && b.fieldName.toLowerCase().includes(q))
            );
        }
        return true;
    }), [bookings, filter, search]);

    // Pagination
    const totalPages = useMemo(() => Math.ceil(filteredBookings.length / ITEMS_PER_PAGE), [filteredBookings.length]);
    const paginatedBookings = useMemo(() => filteredBookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    ), [filteredBookings, currentPage]);

    // Reset page on filter/search change
    useEffect(() => {
        const timeoutId = setTimeout(() => setCurrentPage(1), 0);
        return () => clearTimeout(timeoutId);
    }, [filter, search]);

    const getPageNumbers = useCallback(() => {
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
    }, [totalPages, currentPage]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="admin-page-title" style={{ marginBottom: 0 }}>
                    <h2>จัดการการจอง</h2>
                </div>
            </div>

            <BookingStats 
                todayRevenue={todayRevenue} 
                totalBookings={bookings.length} 
                pendingCount={pendingCount} 
            />

            <BookingFilter 
                filter={filter} 
                setFilter={setFilter} 
                pendingCount={pendingCount} 
                search={search} 
                setSearch={setSearch} 
            />

            <div className="premium-card" style={{ overflow: 'hidden' }}>
                <BookingTable 
                    paginatedBookings={paginatedBookings} 
                    search={search} 
                    handleDeleteBooking={handleDeleteBooking} 
                />

                <BookingPagination 
                    filteredBookingsLength={filteredBookings.length}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    getPageNumbers={getPageNumbers}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                />
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
