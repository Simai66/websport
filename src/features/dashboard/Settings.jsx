import { useState } from 'react';
import { getSettings, saveSettings } from '../../data';

export default function Settings() {
    const [settings, setSettingsState] = useState(() => getSettings());

    const handleSaveSettings = () => {
        saveSettings(settings);
        alert('บันทึกการตั้งค่าเรียบร้อย');
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>⚙️ ตั้งค่าระบบ</h2>

            <div style={{ maxWidth: '600px' }}>
                <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', color: 'var(--text-primary)' }}>💳 PromptPay</h3>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>เบอร์ PromptPay</label>
                        <input
                            type="text"
                            className="premium-input"
                            placeholder="0812345678"
                            value={settings.promptPayNumber || ''}
                            onChange={(e) => setSettingsState(prev => ({ ...prev, promptPayNumber: e.target.value }))}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ชื่อบัญชี</label>
                        <input
                            type="text"
                            className="premium-input"
                            placeholder="ชื่อที่จะแสดงใน QR"
                            value={settings.promptPayName || ''}
                            onChange={(e) => setSettingsState(prev => ({ ...prev, promptPayName: e.target.value }))}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>URL รูป QR Code (ไม่บังคับ)</label>
                        <input
                            type="text"
                            className="premium-input"
                            placeholder="https://... หรือเว้นว่างเพื่อใช้ QR อัตโนมัติ"
                            value={settings.customQRImage || ''}
                            onChange={(e) => setSettingsState(prev => ({ ...prev, customQRImage: e.target.value }))}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            ใส่ URL รูป QR PromptPay ของคุณ (ถ้าว่างจะ generate อัตโนมัติ)
                        </p>
                        {settings.customQRImage && (
                            <div style={{ marginTop: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '8px', display: 'inline-block' }}>
                                <img
                                    src={settings.customQRImage}
                                    alt="QR Preview"
                                    style={{ maxHeight: '100px' }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', color: 'var(--text-primary)' }}>⏱️ การจอง</h3>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>เวลาชำระเงิน (นาที)</label>
                        <input
                            type="number"
                            className="premium-input"
                            placeholder="10"
                            value={settings.bookingTimeoutMinutes || ''}
                            onChange={(e) => setSettingsState(prev => ({ ...prev, bookingTimeoutMinutes: parseInt(e.target.value) || 10 }))}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            ลูกค้าต้องชำระภายในเวลานี้ หลังจากจอง
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>จองสูงสุด (ชั่วโมง)</label>
                        <input
                            type="number"
                            className="premium-input"
                            placeholder="4"
                            min="1"
                            max="8"
                            value={settings.maxHoursPerBooking || ''}
                            onChange={(e) => setSettingsState(prev => ({ ...prev, maxHoursPerBooking: parseInt(e.target.value) || 4 }))}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                <button className="btn btn-primary btn-lg btn-glow" style={{ width: '100%' }} onClick={handleSaveSettings}>
                    💾 บันทึกการตั้งค่า
                </button>
            </div>
        </div>
    );
}
