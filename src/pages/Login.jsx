import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoLogIn, IoCall, IoLockClosed, IoAlertCircle, IoShield } from 'react-icons/io5';

export default function Login() {
    const [mode, setMode] = useState('user'); // 'user' or 'admin'
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithPhone } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || (mode === 'admin' ? '/dashboard' : '/');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'user') {
            if (!phone.trim() || !password.trim()) {
                setError('กรุณากรอกเบอร์โทรและรหัสผ่าน');
                return;
            }
            setLoading(true);
            const result = await loginWithPhone(phone.trim(), password);
            if (result.success) {
                navigate('/', { replace: true });
            } else {
                setError(result.message || 'เบอร์โทร หรือ รหัสผ่านไม่ถูกต้อง');
                setLoading(false);
            }
        } else {
            if (!email.trim() || !password.trim()) {
                setError('กรุณากรอก Email และ Password');
                return;
            }
            setLoading(true);
            const success = await login({ identifier: email.trim(), password });
            if (success) {
                navigate(from, { replace: true });
            } else {
                setError('Email หรือ Password ไม่ถูกต้อง');
                setLoading(false);
            }
        }
    };

    return (
        <div className="login-page" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)'
        }}>
            <div className="premium-card" style={{ padding: '3rem', width: '100%', maxWidth: '420px' }}>
                <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    เข้าสู่ระบบ
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {mode === 'user' ? 'เข้าสู่ระบบด้วยเบอร์โทรศัพท์' : 'ระบบจัดการ SportBooking (Admin)'}
                </p>

                {/* Mode Tabs */}
                <div style={{
                    display: 'flex',
                    marginBottom: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }}>
                    <button
                        onClick={() => { setMode('user'); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: mode === 'user' ? 'var(--accent-sport)' : 'transparent',
                            color: mode === 'user' ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        <IoCall /> สมาชิก
                    </button>
                    <button
                        onClick={() => { setMode('admin'); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: mode === 'admin' ? 'var(--accent-sport)' : 'transparent',
                            color: mode === 'admin' ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        <IoShield /> Admin
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--danger-400)',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                    }}>
                        <IoAlertCircle /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {mode === 'user' ? (
                        <div>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                <IoCall /> เบอร์โทรศัพท์
                            </label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="0XX-XXX-XXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin@sport.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    )}
                    <div>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                            <IoLockClosed /> รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-glow"
                        disabled={loading}
                        style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <IoLogIn /> {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>

                {mode === 'user' && (
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        ยังไม่มีบัญชี?{' '}
                        <Link to="/register" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
                            สมัครสมาชิก
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
