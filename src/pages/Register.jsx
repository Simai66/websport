import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoCall, IoLockClosed, IoEye, IoEyeOff, IoCheckmarkCircle, IoCloseCircle, IoAlertCircle, IoHome, IoRocket } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { HiSparkles } from 'react-icons/hi';

export default function Register() {
    const [success, setSuccess] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { register } = useAuth();

    // Password validation rules
    const validations = [
        { label: 'อย่างน้อย 8 ตัวอักษร', test: (pw) => pw.length >= 8 },
        { label: 'มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว', test: (pw) => /[A-Z]/.test(pw) },
        { label: 'มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว', test: (pw) => /[a-z]/.test(pw) },
        { label: 'มีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*...)', test: (pw) => /[!@#$%^&*()\-_=+{};:'",.<>?/`~|\\]/.test(pw) },
    ];

    const allValid = validations.every((v) => v.test(password));
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const isPhoneValid = /^0\d{9}$/.test(phone);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 10) setPhone(val);
    };

    const formatPhone = (num) => {
        if (num.length <= 3) return num;
        if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
        return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isPhoneValid) {
            setError('กรุณากรอกเบอร์โทรศัพท์ 10 หลักที่ถูกต้อง');
            return;
        }
        if (!allValid) {
            setError('รหัสผ่านไม่ผ่านเงื่อนไขที่กำหนด');
            return;
        }
        if (!passwordsMatch) {
            setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
            return;
        }

        setLoading(true);

        const result = await register(phone, password);
        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                padding: '2rem 1rem',
                paddingTop: '120px'
            }}>
                <div className="premium-card register-card" style={{ padding: '3rem', width: '100%', maxWidth: '440px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><HiSparkles /></div>
                    <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>สมัครสมาชิกสำเร็จ!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        เบอร์โทร: <strong>{formatPhone(phone)}</strong>
                    </p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.85rem' }}>
                        ข้อมูลถูกบันทึกเรียบร้อยแล้ว คุณสามารถจองสนามกีฬาได้เลย
                    </p>
                    <Link to="/" className="btn btn-primary btn-glow" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <IoHome /> กลับหน้าแรก
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            padding: '2rem 1rem',
            paddingTop: '120px'
        }}>
            <div className="premium-card register-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '440px' }}>
                <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>
                    สมัครสมาชิก
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    สร้างบัญชีเพื่อจองสนามกีฬา
                </p>

                {error && (
                    <div className="register-error">
                        <IoAlertCircle style={{ verticalAlign: '-0.1em', marginRight: '0.25rem' }} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Phone Number */}
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
                            disabled={loading}
                            autoFocus
                            maxLength={12}
                        />
                        {phone.length > 0 && !isPhoneValid && (
                            <span className="register-field-hint register-field-hint--error">
                                กรุณากรอกเบอร์โทร 10 หลัก (เริ่มต้นด้วย 0)
                            </span>
                        )}
                        {isPhoneValid && (
                            <span className="register-field-hint register-field-hint--success">
                                ✓ เบอร์โทรถูกต้อง
                            </span>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            <IoLockClosed style={{ verticalAlign: '-0.1em' }} /> รหัสผ่าน
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                style={{ paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="register-toggle-pw"
                            >
                                {showPassword ? <IoEyeOff /> : <IoEye />}
                            </button>
                        </div>

                        {/* Password Validation Checklist */}
                        {password.length > 0 && (
                            <ul className="register-pw-checklist">
                                {validations.map((v, i) => (
                                    <li key={i} className={v.test(password) ? 'pw-check--pass' : 'pw-check--fail'}>
                                        <span className="pw-check-icon">{v.test(password) ? <IoCheckmarkCircle /> : <IoCloseCircle />}</span>
                                        {v.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            <IoLockClosed style={{ verticalAlign: '-0.1em' }} /> ยืนยันรหัสผ่าน
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                style={{ paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="register-toggle-pw"
                            >
                                {showConfirm ? <IoEyeOff /> : <IoEye />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <span className={`register-field-hint ${passwordsMatch ? 'register-field-hint--success' : 'register-field-hint--error'}`}>
                                {passwordsMatch ? '✓ รหัสผ่านตรงกัน' : '✗ รหัสผ่านไม่ตรงกัน'}
                            </span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-glow"
                        disabled={loading || !isPhoneValid || !allValid || !passwordsMatch}
                        style={{
                            marginTop: '0.5rem',
                            opacity: (loading || !isPhoneValid || !allValid || !passwordsMatch) ? 0.6 : 1,
                            cursor: (loading || !isPhoneValid || !allValid || !passwordsMatch) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? <><AiOutlineLoading3Quarters className="spin" /> กำลังสมัคร...</> : <><IoRocket /> สมัครสมาชิก</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
