import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function DashboardLayout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/dashboard', label: 'ภาพรวม', icon: '📊' },
        { path: '/dashboard/bookings', label: 'จัดการการจอง', icon: '📅' },
        { path: '/dashboard/schedule', label: 'ตารางสนาม', icon: '🏟️' },
        { path: '/dashboard/fields', label: 'จัดการสนาม', icon: '⚽' },
        { path: '/dashboard/settings', label: 'ตั้งค่า', icon: '⚙️' },
    ];

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`} style={{
                width: sidebarOpen ? '260px' : '80px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="sidebar-header" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarOpen ? 'space-between' : 'center',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    {sidebarOpen && (
                        <div className="brand" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                            SPORT<span style={{ color: 'var(--accent-sport)' }}>ADMIN</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="sidebar-nav" style={{ flex: 1, padding: '1rem 0' }}>
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1.5rem',
                                color: location.pathname === item.path ? 'var(--accent-sport)' : 'var(--text-secondary)',
                                textDecoration: 'none',
                                background: location.pathname === item.path ? 'var(--bg-card)' : 'transparent',
                                borderLeft: location.pathname === item.path ? '3px solid var(--accent-sport)' : '3px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '1.25rem', marginRight: sidebarOpen ? '0.75rem' : '0' }}>{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}>
                        {sidebarOpen ? 'ออกจากระบบ' : '🚪'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main" style={{ flex: 1, overflow: 'auto' }}>
                <header className="dashboard-header" style={{
                    padding: '1rem 2rem',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Dashboard</h2>
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>A</div>
                        <span style={{ color: 'var(--text-primary)' }}>Admin User</span>
                    </div>
                </header>
                <div className="dashboard-content" style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
