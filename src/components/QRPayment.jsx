import { useState, useEffect, useRef } from 'react';
import { getSettings, uploadPaymentSlip, getBookings, formatPrice } from '../data';

function compressImage(dataUrl, maxWidth = 600, quality = 0.6) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

export default function QRPayment({ amount, onTimeout, onClose, booking, onSlipUploaded }) {
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const settings = getSettings();
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);
    const timerInitialized = useRef(false);

    useEffect(() => {
        if (booking?.id) {
            const allBookings = getBookings();
            const freshBooking = allBookings.find(b => b.id === booking.id);
            if (freshBooking?.paymentSlip) {
                setSlipPreview(freshBooking.paymentSlip);
            }
        }
    }, [booking?.id]);

    useEffect(() => {
        let cancelled = false;
        async function generateQR() {
            try {
                const { default: generatePayload } = await import('promptpay-qr');
                const { default: QRCode } = await import('qrcode');
                const payload = generatePayload(settings.promptPayNumber, { amount });
                const url = await QRCode.toDataURL(payload, { width: 300, margin: 2 });
                if (!cancelled) setQrDataUrl(url);
            } catch (err) {
                console.error('QR generation error:', err);
            }
        }
        generateQR();
        return () => { cancelled = true; };
    }, [amount, settings.promptPayNumber]);

    useEffect(() => {
        if (timerInitialized.current) return;
        timerInitialized.current = true;
        let initialTime;
        if (booking?.paymentDeadline) {
            const deadline = new Date(booking.paymentDeadline);
            const now = new Date();
            initialTime = Math.max(0, Math.floor((deadline - now) / 1000));
        } else {
            initialTime = settings.bookingTimeoutMinutes * 60;
        }
        setTimeLeft(initialTime);
    }, [booking?.paymentDeadline, settings.bookingTimeoutMinutes]);

    // Stop timer when slip is uploaded
    useEffect(() => {
        if (slipPreview && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [slipPreview]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || slipPreview) {
            if (timeLeft === 0 && !slipPreview && onTimeout) onTimeout();
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (onTimeout) onTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timeLeft === null, slipPreview]); // eslint-disable-line react-hooks/exhaustive-deps

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
            return;
        }
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const compressed = await compressImage(event.target.result);
                setSlipPreview(compressed);
                if (booking?.id) {
                    uploadPaymentSlip(booking.id, compressed);
                    if (onSlipUploaded) onSlipUploaded(compressed);
                }
            } catch {
                setSlipPreview(event.target.result);
            }
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const isUrgent = timeLeft !== null && timeLeft < 120;

    return (
        <div className="modal-overlay active" onClick={onClose} role="dialog" aria-modal="true" aria-label="ชำระเงิน">
            <div className="qr-payment-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="qr-payment-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                            background: 'var(--accent-sport)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1.1rem', color: 'white', fontWeight: 700
                        }}>฿</div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>ชำระเงิน</h3>
                    </div>
                    <button onClick={onClose} className="qr-payment-close" aria-label="ปิด">✕</button>
                </div>

                {/* Timer - Gold gradient bar */}
                <div style={{
                    margin: '0 1.5rem',
                    padding: '0.85rem 1.25rem',
                    background: slipPreview
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))'
                        : isUrgent
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.08))'
                            : 'linear-gradient(135deg, rgba(255, 159, 28, 0.2), rgba(255, 159, 28, 0.05))',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    border: slipPreview
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : isUrgent
                            ? '1px solid rgba(239, 68, 68, 0.2)'
                            : '1px solid rgba(255, 159, 28, 0.15)'
                }}>
                    {slipPreview ? (
                        <>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                สถานะ
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#22c55e',
                                lineHeight: 1.3
                            }}>
                                ✓ ส่งสลิปแล้ว
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                รอ Admin ตรวจสอบ
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                กรุณาชำระภายใน
                            </div>
                            <div style={{
                                fontSize: '2.75rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-numbers)',
                                color: isUrgent ? 'var(--danger-400)' : 'var(--accent-sport)',
                                lineHeight: 1.1,
                                letterSpacing: '0.05em'
                            }}>
                                {formatTime(timeLeft)}
                            </div>
                        </>
                    )}
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ยอดชำระ</div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-numbers)',
                        color: 'var(--accent-sport)',
                        letterSpacing: '0.02em'
                    }}>
                        ฿{formatPrice(amount)}
                    </div>
                </div>

                {/* QR Code */}
                <div style={{ textAlign: 'center', margin: '1.25rem 0' }}>
                    {(settings.customQRImage || qrDataUrl) ? (
                        <div style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            display: 'inline-block',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
                        }}>
                            <img src={settings.customQRImage || qrDataUrl} alt="PromptPay QR" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 0.5rem' }}></div>
                            กำลังสร้าง QR Code...
                        </div>
                    )}
                </div>

                {/* PromptPay Info */}
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600 }}>PromptPay: {settings.promptPayNumber}</div>
                    <div>ชื่อ: {settings.promptPayName}</div>
                </div>

                {/* Slip Upload Section */}
                <div style={{
                    margin: '1.25rem 1.5rem 0',
                    padding: '1.25rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.85rem', textAlign: 'center' }}>
                        แนบสลิปการโอน
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {slipPreview ? (
                        <div style={{ textAlign: 'center' }}>
                            <img
                                src={slipPreview}
                                alt="สลิป"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '140px',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.5rem',
                                    border: '1px solid var(--border-color)'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    เปลี่ยนรูป
                                </button>
                                <span style={{ color: 'var(--success-400)', fontSize: '0.8rem' }}>✓ อัพโหลดแล้ว</span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                cursor: uploading ? 'wait' : 'pointer',
                                background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-sport))',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'opacity 0.2s',
                                boxShadow: '0 4px 16px rgba(255, 159, 28, 0.25)'
                            }}
                        >
                            {uploading ? 'กำลังอัพโหลด...' : 'เลือกรูปสลิป'}
                        </button>
                    )}

                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        marginTop: '0.6rem',
                        marginBottom: 0
                    }}>
                        รองรับไฟล์ภาพ (JPG, PNG) ขนาดไม่เกิน 5MB — จะถูกบีบอัดอัตโนมัติ
                    </p>
                </div>

                {/* Booking ID */}
                {booking && (
                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--accent-sport)',
                        marginTop: '0.75rem'
                    }}>
                        รหัสการจอง: {booking.id?.slice(-8)}
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem 1.5rem',
                    textAlign: 'center'
                }}>
                    {slipPreview && (
                        <button
                            className="btn btn-primary btn-glow"
                            onClick={onClose}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        >
                            ✓ เสร็จสิ้น
                        </button>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {slipPreview ? '✓ สลิปถูกส่งแล้ว รอ Admin ตรวจสอบ' : 'แนบสลิปเพื่อให้ Admin ยืนยันเร็วขึ้น'}
                    </p>
                </div>
            </div>
        </div>
    );
}
