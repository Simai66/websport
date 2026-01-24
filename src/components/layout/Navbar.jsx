import { NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <NavLink to="/" className="navbar-brand">
                    <div className="navbar-brand-icon" style={{
                        background: 'var(--accent-sport)',
                        boxShadow: '0 0 25px var(--accent-sport-glow)'
                    }}>⚽</div>
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
                    {mobileMenuOpen ? '✕' : '☰'}
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
                </div>
            </div>
        </nav>
    );
}
