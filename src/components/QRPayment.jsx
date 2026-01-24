import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';
import { getSettings, uploadPaymentSlip, getBookings } from '../data';

export default function QRPayment({ amount, onTimeout, onClose, booking, onSlipUploaded }) {
    const navigate = useNavigate();
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const settings = getSettings();
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load fresh booking data with slip from localStorage
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
        const payload = generatePayload(settings.promptPayNumber, { amount });
        QRCode.toDataURL(payload, { width: 300, margin: 2 })
            .then(url => setQrDataUrl(url))
            .catch(err => console.error(err));

        let initialTime;
        if (booking?.paymentDeadline) {
            const deadline = new Date(booking.paymentDeadline);
            const now = new Date();
            initialTime = Math.max(0, Math.floor((deadline - now) / 1000));
        } else {
            initialTime = settings.bookingTimeoutMinutes * 60;
        }
        setTimeLeft(initialTime);
    }, [amount, settings.promptPayNumber, booking, settings.bookingTimeoutMinutes]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            if (onTimeout) onTimeout();
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
    }, [timeLeft === null]);

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPrice = (price) => new Intl.NumberFormat('th-TH').format(price);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const slipData = event.target.result;
            setSlipPreview(slipData);

            if (booking?.id) {
                uploadPaymentSlip(booking.id, slipData);
                if (onSlipUploaded) onSlipUploaded(slipData);
            }
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const isUrgent = timeLeft !== null && timeLeft < 120;

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
                <div className="modal-header">
                    <h3 className="modal-title">💳 ชำระเงิน</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {/* Timer */}
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>กรุณาชำระภายใน</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: isUrgent ? 'var(--danger-400)' : 'var(--warning-400)' }}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Amount */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ยอดชำระ</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-400)' }}>
                            ฿{formatPrice(amount)}
                        </div>
                    </div>

                    {/* QR Code */}
                    {(settings.customQRImage || qrDataUrl) ? (
                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block' }}>
                            <img src={settings.customQRImage || qrDataUrl} alt="PromptPay QR" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>กำลังสร้าง QR Code...</div>
                    )}

                    {/* PromptPay Info */}
                    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <div><strong>PromptPay:</strong> {settings.promptPayNumber}</div>
                        <div><strong>ชื่อ:</strong> {settings.promptPayName}</div>
                    </div>

                    {/* Slip Upload Section */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                            📎 แนบสลิปการโอน
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {slipPreview ? (
                            <div>
                                <img
                                    src={slipPreview}
                                    alt="สลิป"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '150px',
                                        borderRadius: '8px',
                                        marginBottom: '0.5rem'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        เปลี่ยนรูป
                                    </button>
                                    <span style={{ color: 'var(--success-400)', fontSize: '0.75rem', alignSelf: 'center' }}>
                                        ✓ อัพโหลดแล้ว
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{ width: '100%' }}
                            >
                                {uploading ? '⏳ กำลังอัพโหลด...' : '📷 เลือกรูปสลิป'}
                            </button>
                        )}

                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            รองรับไฟล์ภาพ (JPG, PNG) ขนาดไม่เกิน 5MB
                        </p>
                    </div>

                    {/* Booking Info */}
                    {booking && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            รหัสการจอง: {booking.id?.slice(-8)}
                        </div>
                    )}
                </div>
                <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                    {slipPreview && (
                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                            style={{ width: '100%' }}
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
