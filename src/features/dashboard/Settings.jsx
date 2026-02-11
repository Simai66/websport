import { useState } from 'react';
import { getSettings, saveSettings } from '../../data';

export default function Settings() {
    const [settings, setSettingsState] = useState(() => getSettings());
    const [saved, setSaved] = useState(false);

    const updateField = (key, value) => {
        setSettingsState(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <div className="admin-page-title" style={{ marginBottom: '2rem' }}>
                <h2>ตั้งค่า</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>Settings</span>
            </div>

            {/* General Information */}
            <div className="admin-settings-section">
                <div className="admin-settings-header">
                    <div className="admin-settings-accent"></div>
                    <h3>GENERAL INFORMATION</h3>
                </div>
                <div className="admin-settings-subtitle">ข้อมูลทั่วไปของสนามกีฬา</div>
                <div className="admin-settings-card">
                    <div className="admin-settings-grid">
                        <div>
                            <label className="admin-settings-label">Arena Name</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.arenaName || ''}
                                onChange={(e) => updateField('arenaName', e.target.value)}
                                placeholder="ชื่อสนาม"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Contact Number</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.contactPhone || ''}
                                onChange={(e) => updateField('contactPhone', e.target.value)}
                                placeholder="08x-xxx-xxxx"
                            />
                        </div>
                        <div className="full-width">
                            <label className="admin-settings-label">Address / Google Maps</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.address || ''}
                                onChange={(e) => updateField('address', e.target.value)}
                                placeholder="ที่อยู่หรือลิงก์ Google Maps"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Opening Time</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.openingTime || '08:00'}
                                onChange={(e) => updateField('openingTime', e.target.value)}
                                placeholder="08:00"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Closing Time</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.closingTime || '23:00'}
                                onChange={(e) => updateField('closingTime', e.target.value)}
                                placeholder="23:00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Configuration */}
            <div className="admin-settings-section">
                <div className="admin-settings-header">
                    <div className="admin-settings-accent"></div>
                    <h3>PAYMENT CONFIGURATION</h3>
                </div>
                <div className="admin-settings-subtitle">ตั้งค่าการชำระเงินและ PromptPay</div>
                <div className="admin-settings-card">
                    <div className="admin-settings-grid">
                        <div className="full-width" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Accept Payments</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เปิดรับชำระเงินผ่าน PromptPay</div>
                            </div>
                            <div
                                className={`admin-toggle ${settings.acceptPayments !== false ? 'active' : ''}`}
                                onClick={() => updateField('acceptPayments', settings.acceptPayments === false ? true : false)}
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">PromptPay ID</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.promptPayId || ''}
                                onChange={(e) => updateField('promptPayId', e.target.value)}
                                placeholder="0-xxxx-xxxxx"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Account Name</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.accountName || ''}
                                onChange={(e) => updateField('accountName', e.target.value)}
                                placeholder="ชื่อบัญชี"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Account Number</label>
                            <input
                                type="text"
                                className="admin-settings-input"
                                value={settings.accountNumber || ''}
                                onChange={(e) => updateField('accountNumber', e.target.value)}
                                placeholder="xxx-x-xxxxx-x"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Booking Timeout (Minutes)</label>
                            <input
                                type="number"
                                className="admin-settings-input"
                                value={settings.bookingTimeoutMinutes || 30}
                                onChange={(e) => updateField('bookingTimeoutMinutes', parseInt(e.target.value) || 30)}
                                placeholder="30"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Security */}
            <div className="admin-settings-section">
                <div className="admin-settings-header">
                    <div className="admin-settings-accent"></div>
                    <h3>ADMIN SECURITY</h3>
                </div>
                <div className="admin-settings-subtitle">เปลี่ยนรหัสผ่านผู้ดูแลระบบ</div>
                <div className="admin-settings-card">
                    <div className="admin-settings-grid">
                        <div className="full-width">
                            <label className="admin-settings-label">Current Password</label>
                            <input
                                type="password"
                                className="admin-settings-input"
                                value={settings.currentPassword || ''}
                                onChange={(e) => updateField('currentPassword', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">New Password</label>
                            <input
                                type="password"
                                className="admin-settings-input"
                                value={settings.newPassword || ''}
                                onChange={(e) => updateField('newPassword', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="admin-settings-label">Confirm Password</label>
                            <input
                                type="password"
                                className="admin-settings-input"
                                value={settings.confirmPassword || ''}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="admin-sticky-footer">
                <div className="admin-sticky-footer-warn">
                    <span className="dot"></span>
                    Unsaved changes will be lost
                </div>
                <div className="admin-sticky-footer-actions">
                    <button className="btn btn-secondary" onClick={() => setSettingsState(getSettings())}>Cancel</button>
                    <button className="btn btn-primary btn-glow" onClick={handleSave}>
                        {saved ? '✓ Saved' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
