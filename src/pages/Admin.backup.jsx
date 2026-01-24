import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import {
    getBookings, cancelBooking, deleteBooking, confirmBookingPayment, expireOverdueBookings,
    getFields, addField, updateField, deleteField,
    getSettings, saveSettings,
    fieldTypes,
    formatDateThai, formatPrice
} from '../data';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState([]);
    const [fields, setFieldsList] = useState([]);
    const [settings, setSettingsState] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    // Field edit modal state
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [fieldForm, setFieldForm] = useState({
        name: '',
        type: 'football',
        description: '',
        price: '',
        image: '',
        facilities: ''
    });

    // Slip viewer modal state
    const [viewingSlip, setViewingSlip] = useState(null);

    const loadData = () => {
        expireOverdueBookings(); // Auto-expire overdue bookings
        setBookings(getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setFieldsList(getFields());
        setSettingsState(getSettings());
    };

    useEffect(() => {
        loadData();
        // Check for expired bookings every 30 seconds
        const interval = setInterval(() => {
            expireOverdueBookings();
            setBookings(getBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmPayment = (bookingId) => {
        if (confirm('ยืนยันว่าได้รับชำระเงินแล้ว?')) {
            confirmBookingPayment(bookingId);
            showNotification('ยืนยันการชำระเงินเรียบร้อย', 'success');
            loadData();
        }
    };

    const handleCancelBooking = (bookingId) => {
        if (confirm('ยืนยันการยกเลิกการจองนี้?')) {
            cancelBooking(bookingId);
            showNotification('ยกเลิกการจองเรียบร้อย', 'success');
            loadData();
        }
    };

    const handleDeleteBooking = (bookingId) => {
        if (confirm('ยืนยันการลบการจองนี้? (ข้อมูลจะหายถาวร)')) {
            deleteBooking(bookingId);
            showNotification('ลบการจองเรียบร้อย', 'success');
            loadData();
        }
    };

    const handleSaveSettings = () => {
        saveSettings(settings);
        showNotification('บันทึกการตั้งค่าเรียบร้อย', 'success');
    };

    const showNotification = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Field Management
    const openAddFieldModal = () => {
        setEditingField(null);
        setFieldForm({ name: '', type: 'football', description: '', price: '', image: '', facilities: '' });
        setShowFieldModal(true);
    };

    const openEditFieldModal = (field) => {
        setEditingField(field);
        setFieldForm({
            name: field.name,
            type: field.type,
            description: field.description,
            price: field.price.toString(),
            image: field.image,
            facilities: field.facilities.join(', ')
        });
        setShowFieldModal(true);
    };

    const handleFieldFormChange = (e) => {
        const { name, value } = e.target;
        setFieldForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveField = () => {
        if (!fieldForm.name || !fieldForm.price) {
            showNotification('กรุณากรอกชื่อสนามและราคา', 'error');
            return;
        }
        const fieldData = {
            name: fieldForm.name,
            type: fieldForm.type,
            description: fieldForm.description,
            price: parseInt(fieldForm.price) || 0,
            image: fieldForm.image || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format',
            facilities: fieldForm.facilities.split(',').map(f => f.trim()).filter(f => f)
        };
        if (editingField) {
            updateField(editingField.id, fieldData);
            showNotification('แก้ไขข้อมูลสนามเรียบร้อย', 'success');
        } else {
            addField(fieldData);
            showNotification('เพิ่มสนามใหม่เรียบร้อย', 'success');
        }
        setShowFieldModal(false);
        loadData();
    };

    const handleDeleteField = (fieldId) => {
        if (confirm('ยืนยันการลบสนามนี้?')) {
            deleteField(fieldId);
            showNotification('ลบสนามเรียบร้อย', 'success');
            loadData();
        }
    };

    // Stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        expired: bookings.filter(b => b.status === 'expired').length,
        totalRevenue: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0),
        todayBookings: bookings.filter(b => {
            const today = new Date().toISOString().split('T')[0];
            return b.date === today && b.status === 'confirmed';
        }).length
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="badge badge-success">✓ ชำระแล้ว</span>;
            case 'pending': return <span className="badge badge-warning">⏳ รอชำระ</span>;
            case 'cancelled': return <span className="badge badge-danger">✕ ยกเลิก</span>;
            case 'expired': return <span className="badge badge-danger">⏱ หมดเวลา</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const getTypeName = (type) => {
        const t = fieldTypes.find(ft => ft.id === type);
        return t ? t.name : type;
    };

    return (
        <div>
            <div className="page-header">
                <div className="container page-header-content">
                    <h1 className="page-title">🔐 ระบบหลังบ้าน</h1>
                    <p className="page-description">จัดการสนามกีฬาและการจอง</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {[
                            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                            { id: 'bookings', icon: '📋', label: `การจอง ${stats.pending > 0 ? `(${stats.pending})` : ''}` },
                            { id: 'fields', icon: '🏟️', label: 'จัดการสนาม' },
                            { id: 'settings', icon: '⚙️', label: 'ตั้งค่า' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>ภาพรวม</h2>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                <div className="stat-card">
                                    <div className="stat-icon warning">⏳</div>
                                    <div className="stat-value">{stats.pending}</div>
                                    <div className="stat-label">รอชำระเงิน</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon success">✓</div>
                                    <div className="stat-value">{stats.confirmed}</div>
                                    <div className="stat-label">ชำระแล้ว</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon primary">📅</div>
                                    <div className="stat-value">{stats.todayBookings}</div>
                                    <div className="stat-label">จองวันนี้</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon success">💰</div>
                                    <div className="stat-value">฿{formatPrice(stats.totalRevenue)}</div>
                                    <div className="stat-label">รายได้รวม</div>
                                </div>
                            </div>

                            {/* Pending Payments Alert */}
                            {stats.pending > 0 && (
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '1rem',
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: 'var(--radius-lg)'
                                }}>
                                    <h3 style={{ color: 'var(--warning-400)', marginBottom: '0.5rem' }}>
                                        ⚠️ มี {stats.pending} รายการรอยืนยันการชำระเงิน
                                    </h3>
                                    <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('bookings')}>
                                        ตรวจสอบเลย →
                                    </button>
                                </div>
                            )}

                            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>การจองล่าสุด</h3>
                            {bookings.slice(0, 5).length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr><th>สนาม</th><th>ผู้จอง</th><th>วันที่</th><th>เวลา</th><th>ยอด</th><th>สถานะ</th></tr>
                                        </thead>
                                        <tbody>
                                            {bookings.slice(0, 5).map(b => (
                                                <tr key={b.id}>
                                                    <td>{b.fieldName}</td>
                                                    <td>{b.customerName}</td>
                                                    <td>{b.date}</td>
                                                    <td>{b.timeSlot}</td>
                                                    <td>฿{formatPrice(b.totalPrice || b.price)}</td>
                                                    <td>{getStatusBadge(b.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีการจอง</p>}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>การจองทั้งหมด ({bookings.length})</h2>
                            {bookings.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr><th>ID</th><th>สนาม</th><th>ผู้จอง</th><th>โทร</th><th>วันที่</th><th>เวลา</th><th>ยอด</th><th>สลิป</th><th>สถานะ</th><th>จัดการ</th></tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(b => (
                                                <tr key={b.id}>
                                                    <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.id.slice(-6)}</td>
                                                    <td>{b.fieldName}</td>
                                                    <td>{b.customerName}</td>
                                                    <td>{b.customerPhone}</td>
                                                    <td>{b.date}</td>
                                                    <td>{b.timeSlot}</td>
                                                    <td>฿{formatPrice(b.totalPrice || b.price)}</td>
                                                    <td>
                                                        {b.paymentSlip ? (
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={() => setViewingSlip(b)}
                                                                style={{ padding: '0.25rem 0.5rem' }}
                                                            >
                                                                🖼️ ดูสลิป
                                                            </button>
                                                        ) : (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ไม่มี</span>
                                                        )}
                                                    </td>
                                                    <td>{getStatusBadge(b.status)}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                            {b.status === 'pending' && (
                                                                <button className="btn btn-sm btn-success" onClick={() => handleConfirmPayment(b.id)}>
                                                                    ✓ ยืนยัน
                                                                </button>
                                                            )}
                                                            {(b.status === 'pending' || b.status === 'confirmed') && (
                                                                <button className="btn btn-sm btn-secondary" onClick={() => handleCancelBooking(b.id)}>
                                                                    ยกเลิก
                                                                </button>
                                                            )}
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBooking(b.id)}>
                                                                ลบ
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <h3 className="empty-state-title">ยังไม่มีการจอง</h3>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fields Tab */}
                    {activeTab === 'fields' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>จัดการสนามกีฬา ({fields.length})</h2>
                                <button className="btn btn-primary" onClick={openAddFieldModal}>➕ เพิ่มสนาม</button>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead><tr><th>รูป</th><th>ชื่อสนาม</th><th>ประเภท</th><th>ราคา/ชม.</th><th>จัดการ</th></tr></thead>
                                    <tbody>
                                        {fields.map(field => (
                                            <tr key={field.id}>
                                                <td><img src={field.image} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                                <td style={{ fontWeight: '600' }}>{field.name}</td>
                                                <td><span className="badge badge-primary">{getTypeName(field.type)}</span></td>
                                                <td>฿{formatPrice(field.price)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => openEditFieldModal(field)}>✏️ แก้ไข</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteField(field.id)}>🗑️ ลบ</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>⚙️ ตั้งค่าระบบ</h2>

                            <div style={{ maxWidth: '500px' }}>
                                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>💳 PromptPay</h3>

                                    <div className="form-group">
                                        <label className="form-label">เบอร์ PromptPay</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="0812345678"
                                            value={settings.promptPayNumber || ''}
                                            onChange={(e) => setSettingsState(prev => ({ ...prev, promptPayNumber: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">ชื่อบัญชี</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="ชื่อที่จะแสดงใน QR"
                                            value={settings.promptPayName || ''}
                                            onChange={(e) => setSettingsState(prev => ({ ...prev, promptPayName: e.target.value }))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">URL รูป QR Code (ไม่บังคับ)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="https://... หรือเว้นว่างเพื่อใช้ QR อัตโนมัติ"
                                            value={settings.customQRImage || ''}
                                            onChange={(e) => setSettingsState(prev => ({ ...prev, customQRImage: e.target.value }))}
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

                                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>⏱️ การจอง</h3>

                                    <div className="form-group">
                                        <label className="form-label">เวลาชำระเงิน (นาที)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="10"
                                            value={settings.bookingTimeoutMinutes || ''}
                                            onChange={(e) => setSettingsState(prev => ({ ...prev, bookingTimeoutMinutes: parseInt(e.target.value) || 10 }))}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            ลูกค้าต้องชำระภายในเวลานี้ หลังจากจอง
                                        </p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">จองสูงสุด (ชั่วโมง)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="4"
                                            min="1"
                                            max="8"
                                            value={settings.maxHoursPerBooking || ''}
                                            onChange={(e) => setSettingsState(prev => ({ ...prev, maxHoursPerBooking: parseInt(e.target.value) || 4 }))}
                                        />
                                    </div>
                                </div>

                                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSaveSettings}>
                                    💾 บันทึกการตั้งค่า
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Field Edit Modal */}
            {showFieldModal && (
                <div className="modal-overlay active" onClick={() => setShowFieldModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingField ? '✏️ แก้ไขสนาม' : '➕ เพิ่มสนามใหม่'}</h3>
                            <button className="modal-close" onClick={() => setShowFieldModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">ชื่อสนาม *</label>
                                <input type="text" name="name" className="form-input" placeholder="เช่น สนามฟุตบอล A" value={fieldForm.name} onChange={handleFieldFormChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ประเภท</label>
                                <select name="type" className="form-select" value={fieldForm.type} onChange={handleFieldFormChange}>
                                    <option value="football">ฟุตบอล</option>
                                    <option value="badminton">แบดมินตัน</option>
                                    <option value="basketball">บาสเกตบอล</option>
                                    <option value="tennis">เทนนิส</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">รายละเอียด</label>
                                <textarea name="description" className="form-input" rows="3" placeholder="รายละเอียดสนาม..." value={fieldForm.description} onChange={handleFieldFormChange} style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ราคา (บาท/ชม.) *</label>
                                <input type="number" name="price" className="form-input" placeholder="500" value={fieldForm.price} onChange={handleFieldFormChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">URL รูปภาพ</label>
                                <input type="text" name="image" className="form-input" placeholder="https://..." value={fieldForm.image} onChange={handleFieldFormChange} />
                                {fieldForm.image && <img src={fieldForm.image} alt="" style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '8px' }} onError={(e) => e.target.style.display = 'none'} />}
                            </div>
                            <div className="form-group">
                                <label className="form-label">สิ่งอำนวยความสะดวก (คั่นด้วย ,)</label>
                                <input type="text" name="facilities" className="form-input" placeholder="ห้องน้ำ, ที่จอดรถ" value={fieldForm.facilities} onChange={handleFieldFormChange} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowFieldModal(false)}>ยกเลิก</button>
                            <button className="btn btn-primary" onClick={handleSaveField}>{editingField ? 'บันทึก' : 'เพิ่มสนาม'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slip Viewer Modal */}
            {viewingSlip && (
                <div className="modal-overlay active" onClick={() => setViewingSlip(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">🧾 สลิปการโอนเงิน</h3>
                            <button className="modal-close" onClick={() => setViewingSlip(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {/* Booking Info */}
                            <div style={{
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'left',
                                fontSize: '0.875rem'
                            }}>
                                <div><strong>สนาม:</strong> {viewingSlip.fieldName}</div>
                                <div><strong>ผู้จอง:</strong> {viewingSlip.customerName} ({viewingSlip.customerPhone})</div>
                                <div><strong>วันที่:</strong> {viewingSlip.date} | {viewingSlip.timeSlot}</div>
                                <div><strong>ยอด:</strong> <span style={{ color: 'var(--primary-400)' }}>฿{formatPrice(viewingSlip.totalPrice || viewingSlip.price)}</span></div>
                                <div><strong>สถานะ:</strong> {getStatusBadge(viewingSlip.status)}</div>
                            </div>

                            {/* Slip Image */}
                            <img
                                src={viewingSlip.paymentSlip}
                                alt="สลิปการโอน"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                }}
                            />
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                            {viewingSlip.status === 'pending' && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        handleConfirmPayment(viewingSlip.id);
                                        setViewingSlip(null);
                                    }}
                                >
                                    ✓ ยืนยันชำระเงิน
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setViewingSlip(null)}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className="toast-container">
                    <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
                </div>
            )}
        </div>
    );
}
