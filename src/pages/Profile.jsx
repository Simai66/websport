import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoLockClosed, IoPersonCircle, IoCall, IoCheckmarkCircle, IoAlertCircle, IoSave, IoKey, IoEye, IoEyeOff } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function Profile() {
    const { user, isAuthenticated, updateUserProfile, changePassword } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Password change state
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const formatPhone = (num) => {
        if (num.length <= 3) return num;
        if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
        return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 10) setPhone(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!name.trim()) {
            setError('กรุณากรอกชื่อ');
            return;
        }

        setSaving(true);
        const result = await updateUserProfile({ name: name.trim(), phone });
        setSaving(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } else {
            setError(result.message || 'เกิดข้อผิดพลาด');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess(false);

        if (!currentPw || !newPw || !confirmPw) {
            setPwError('กรุณากรอกข้อมูลให้ครบ');
            return;
        }
        if (newPw.length < 6) {
            setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        if (newPw !== confirmPw) {
            setPwError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน');
            return;
        }

        setPwLoading(true);
        const result = await changePassword(currentPw, newPw);
        setPwLoading(false);

        if (result.success) {
            setPwSuccess(true);
            setCurrentPw('');
            setNewPw('');
            setConfirmPw('');
            setTimeout(() => setPwSuccess(false), 3000);
        } else {
            setPwError(result.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '70vh', paddingTop: '120px', padding: '2rem 1rem'
            }}>
                <div className="premium-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><IoLockClosed /></div>
                    <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>กรุณาเข้าสู่ระบบ</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        เข้าสู่ระบบเพื่อตั้งค่าโปรไฟล์ของคุณ
                    </p>
                    <Link to="/login" className="btn btn-primary btn-glow" style={{ textDecoration: 'none' }}>
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            minHeight: '70vh', padding: '2rem 1rem', paddingTop: '120px'
        }}>
            <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Profile Card */}
                <div className="premium-card register-card" style={{ padding: '2.5rem' }}>
                    <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                        ตั้งค่าโปรไฟล์
                    </h1>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                        ข้อมูลนี้จะถูกใช้อัตโนมัติเมื่อจองสนาม
                    </p>

                    {/* User Avatar/Info */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem'
                    }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" style={{
                                width: 48, height: 48, borderRadius: '50%', objectFit: 'cover'
                            }} />
                        ) : (
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: 'var(--accent-sport)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', color: 'white'
                            }}>
                                {(user?.name || 'U')[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                        </div>
                    </div>

                    {success && (
                        <div style={{
                            padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 'var(--radius-md)', color: 'var(--success-400)',
                            fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center'
                        }}>
                            <IoCheckmarkCircle style={{ verticalAlign: '-0.1em', marginRight: '0.25rem' }} /> บันทึกข้อมูลเรียบร้อยแล้ว
                        </div>
                    )}

                    {error && (
                        <div className="register-error"><IoAlertCircle style={{ verticalAlign: '-0.1em', marginRight: '0.25rem' }} /> {error}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                <IoPersonCircle style={{ verticalAlign: '-0.1em' }} /> ชื่อ-นามสกุล
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="กรอกชื่อ-นามสกุล"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                <IoCall style={{ verticalAlign: '-0.1em' }} /> เบอร์โทรศัพท์
                            </label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="0XX-XXX-XXXX"
                                value={formatPhone(phone)}
                                onChange={handlePhoneChange}
                                disabled={saving}
                                maxLength={12}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                เบอร์โทรนี้จะถูกใช้อัตโนมัติตอนจองสนาม
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-glow"
                            disabled={saving}
                            style={{ marginTop: '0.5rem', opacity: saving ? 0.6 : 1 }}
                        >
                            {saving ? <><AiOutlineLoading3Quarters className="spin" /> กำลังบันทึก...</> : <><IoSave /> บันทึกข้อมูล</>}
                        </button>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="premium-card register-card" style={{ padding: '2.5rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        <IoKey style={{ verticalAlign: '-0.1em', marginRight: '0.4rem', color: 'var(--accent-sport)' }} />
                        เปลี่ยนรหัสผ่าน
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                        สำหรับบัญชีที่สมัครด้วยอีเมล
                    </p>

                    {pwSuccess && (
                        <div style={{
                            padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 'var(--radius-md)', color: 'var(--success-400)',
                            fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center'
                        }}>
                            <IoCheckmarkCircle style={{ verticalAlign: '-0.1em', marginRight: '0.25rem' }} /> เปลี่ยนรหัสผ่านสำเร็จ
                        </div>
                    )}

                    {pwError && (
                        <div className="register-error"><IoAlertCircle style={{ verticalAlign: '-0.1em', marginRight: '0.25rem' }} /> {pwError}</div>
                    )}

                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                <IoLockClosed style={{ verticalAlign: '-0.1em' }} /> รหัสผ่านเดิม
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={currentPw}
                                    onChange={(e) => setCurrentPw(e.target.value)}
                                    disabled={pwLoading}
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="register-toggle-pw"
                                >
                                    {showCurrent ? <IoEyeOff /> : <IoEye />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                <IoKey style={{ verticalAlign: '-0.1em' }} /> รหัสผ่านใหม่
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    disabled={pwLoading}
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="register-toggle-pw"
                                >
                                    {showNew ? <IoEyeOff /> : <IoEye />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                <IoLockClosed style={{ verticalAlign: '-0.1em' }} /> ยืนยันรหัสผ่านใหม่
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)}
                                disabled={pwLoading}
                            />
                            {confirmPw.length > 0 && newPw !== confirmPw && (
                                <span className="register-field-hint register-field-hint--error">
                                    รหัสผ่านไม่ตรงกัน
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={pwLoading || !currentPw || !newPw || !confirmPw || newPw !== confirmPw}
                            style={{
                                marginTop: '0.5rem',
                                opacity: (pwLoading || !currentPw || !newPw || !confirmPw) ? 0.6 : 1,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {pwLoading ? <><AiOutlineLoading3Quarters className="spin" /> กำลังเปลี่ยน...</> : <><IoKey /> เปลี่ยนรหัสผ่าน</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
