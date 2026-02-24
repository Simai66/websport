export default function BookingPagination({ filteredBookingsLength, currentPage, setCurrentPage, totalPages, getPageNumbers, ITEMS_PER_PAGE }) {
    if (filteredBookingsLength === 0) return null;

    return (
        <div className="admin-pagination">
            <div className="admin-pagination-info">
                Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBookingsLength)}</strong> to{' '}
                <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookingsLength)}</strong> of{' '}
                <strong>{filteredBookingsLength}</strong> results
            </div>
            <div className="admin-pagination-controls">
                <button
                    className="admin-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    aria-label="หน้าก่อนหน้า"
                >‹</button>
                {getPageNumbers().map((page, i) =>
                    page === '...' ? (
                        <span key={`dots-${i}`} className="admin-page-btn" style={{ cursor: 'default', border: 'none' }}>…</span>
                    ) : (
                        <button
                            key={page}
                            className={`admin-page-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                            aria-label={`ไปหน้า ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >{page}</button>
                    )
                )}
                <button
                    className="admin-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    aria-label="หน้าถัดไป"
                >›</button>
            </div>
        </div>
    );
}
