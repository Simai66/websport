import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoFootball, IoCalendar, IoSettings, IoLogOut, IoPeople } from 'react-icons/io5';
import { MdDashboard, MdStadium } from 'react-icons/md';

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, isOwner, logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'ภาพรวม', icon: <MdDashboard /> },
        { path: '/dashboard/bookings', label: 'จัดการการจอง', icon: <IoCalendar /> },
        { path: '/dashboard/schedule', label: 'ตารางสนาม', icon: <MdStadium /> },
        { path: '/dashboard/fields', label: 'จัดการสนาม', icon: <IoFootball /> },
        ...(isOwner ? [{ path: '/dashboard/users', label: 'จัดการผู้ใช้', icon: <IoPeople /> }] : []),
        { path: '/dashboard/settings', label: 'ตั้งค่า', icon: <IoSettings /> },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const roleBadge = user?.role === 'owner'
        ? { label: 'Owner', color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' }
        : user?.role === 'admin'
            ? { label: 'Admin', color: '#818CF8', bg: 'rgba(99, 102, 241, 0.15)' }
            : null;

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
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        <IoLogOut style={{ fontSize: '1.25rem' }} />
                        {sidebarOpen && 'ออกจากระบบ'}
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
                        {roleBadge && (
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                background: roleBadge.bg,
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: roleBadge.color
                            }}>
                                {roleBadge.label}
                            </span>
                        )}
                        <div className="avatar" style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {user?.photoURL ? (
                                <>
                                    <img 
                                        src={user.photoURL} 
                                        alt="" 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </span>
                                </>
                            ) : (
                                user?.name?.charAt(0)?.toUpperCase() || 'A'
                            )}
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user?.name || 'Admin'}</span>
                    </div>
                </header>
                <div className="dashboard-content" style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
