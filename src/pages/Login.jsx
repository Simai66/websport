import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoLogIn, IoMail, IoLockClosed, IoAlertCircle } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const { login, loginWithGoogle, resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }

        setLoading(true);
        const result = await login(email.trim(), password);
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const result = await loginWithGoogle();
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            if (result.message) setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-glow-bg"></div>
            <div className="premium-card register-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
                <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    เข้าสู่ระบบ
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    เข้าสู่ระบบด้วยอีเมลของคุณ
                </p>

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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                            <IoMail /> อีเมล
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {!forgotMode ? (
                        <>
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
                                <button
                                    type="button"
                                    onClick={() => { setForgotMode(true); setError(''); setResetSent(false); }}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: 'var(--primary-400)', fontSize: '0.8rem',
                                        cursor: 'pointer', marginTop: '0.5rem', padding: 0
                                    }}
                                >
                                    ลืมรหัสผ่าน?
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-glow"
                                disabled={loading}
                                style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                {loading ? <><AiOutlineLoading3Quarters className="spin" /> กำลังเข้าสู่ระบบ...</> : <><IoLogIn /> เข้าสู่ระบบ</>}
                            </button>
                        </>
                    ) : (
                        <>
                            {resetSent ? (
                                <div style={{
                                    padding: '1rem', background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: 'var(--radius-md)', color: 'var(--success-400)',
                                    fontSize: '0.875rem', textAlign: 'center'
                                }}>
                                    ✓ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ <strong>{email}</strong> แล้ว กรุณาเช็คอีเมลของคุณ
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!email.trim()) { setError('กรุณากรอกอีเมลก่อน'); return; }
                                        setLoading(true);
                                        const result = await resetPassword(email.trim());
                                        setLoading(false);
                                        if (result.success) { setResetSent(true); setError(''); }
                                        else { setError(result.message); }
                                    }}
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => { setForgotMode(false); setError(''); setResetSent(false); }}
                                style={{
                                    background: 'none', border: 'none',
                                    color: 'var(--text-muted)', fontSize: '0.85rem',
                                    cursor: 'pointer', textAlign: 'center'
                                }}
                            >
                                ← กลับไปหน้าเข้าสู่ระบบ
                            </button>
                        </>
                    )}
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex', alignItems: 'center', margin: '1.5rem 0',
                    gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    หรือ
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        opacity: loading ? 0.6 : 1,
                        transition: 'var(--transition-fast)'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    เข้าสู่ระบบด้วย Google
                </button>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    ยังไม่มีบัญชี?{' '}
                    <Link to="/register" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
                        สมัครสมาชิก
                    </Link>
                </p>
            </div>
        </div>
    );
}
