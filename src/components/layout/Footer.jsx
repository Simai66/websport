import { IoFootball } from 'react-icons/io5';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'var(--accent-sport)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            boxShadow: '0 0 15px var(--accent-sport-glow)'
                        }}><IoFootball /></div>
                        <span style={{ color: 'var(--text-primary)' }}>SPORTBOOKING</span>
                    </div>

                    <div className="footer-social">
                        <a href="#" className="footer-social-link">f</a>
                        <a href="#" className="footer-social-link">IG</a>
                        <a href="#" className="footer-social-link">LINE</a>
                    </div>

                    <p className="footer-text">
                        © 2026 SportBooking - ระบบจองสนามกีฬาออนไลน์ระดับพรีเมียม
                    </p>
                </div>
            </div>
        </footer>
    );
}
