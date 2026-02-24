import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IoFootball, IoPersonCircle, IoMenu, IoClose, IoLogOut, IoLogIn, IoGrid } from 'react-icons/io5';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { user, isAuthenticated, isAdmin, loginWithGoogle, logout } = useAuth();

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        await loginWithGoogle();
        setGoogleLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <NavLink to="/" className="navbar-brand">
                    <div className="navbar-brand-icon" style={{
                        background: 'var(--accent-sport)',
                        boxShadow: '0 0 25px var(--accent-sport-glow)'
                    }}><IoFootball /></div>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        fontSize: '1.25rem'
                    }}>SPORTBOOKING</span>
                </NavLink>

                <button
                    className="navbar-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <IoClose /> : <IoMenu />}
                </button>

                <div className={`navbar-nav ${mobileMenuOpen ? 'active' : ''}`}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        หน้าแรก
                    </NavLink>
                    <NavLink
                        to="/my-bookings"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        การจองของฉัน
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            {/* Dashboard link for admin/owner */}
                            {isAdmin && (
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        color: 'var(--accent-gold)',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <IoGrid /> Dashboard
                                </NavLink>
                            )}

                            <NavLink
                                to="/profile"
                                className="nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    color: 'var(--success-400)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {user?.photoURL ? (
                                    <>
                                        <img
                                            src={user.photoURL}
                                            alt=""
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{ 
                                            display: 'none', 
                                            width: 24, 
                                            height: 24, 
                                            borderRadius: '50%', 
                                            background: 'var(--accent-sport)', 
                                            color: '#fff', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '12px', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ 
                                        width: 24, 
                                        height: 24, 
                                        borderRadius: '50%', 
                                        background: 'var(--accent-sport)', 
                                        color: '#fff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                {user?.name || user?.phone || 'User'}
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="nav-link"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <IoLogOut style={{ verticalAlign: '-0.1em', marginRight: '0.25rem' }} />
                                ออกจากระบบ
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/register"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ color: 'var(--primary-400)', fontWeight: 600 }}
                            >
                                สมัครสมาชิก
                            </NavLink>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <IoLogIn /> เข้าสู่ระบบ
                            </NavLink>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                className="nav-link"
                                style={{
                                    background: 'none',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    opacity: googleLoading ? 0.6 : 1,
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                {googleLoading ? 'กำลังเข้าสู่ระบบ...' : 'Google'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
