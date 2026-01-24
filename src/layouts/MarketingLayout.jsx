import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MarketingLayout() {
    return (
        <div className="mesh-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Floating Orbs - Premium Background */}
            <div className="floating-orbs">
                <div className="floating-orb floating-orb-1"></div>
                <div className="floating-orb floating-orb-2"></div>
                <div className="floating-orb floating-orb-3"></div>
                <div className="floating-orb floating-orb-4"></div>
            </div>

            <Navbar />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
