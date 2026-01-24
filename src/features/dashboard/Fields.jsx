import { useState, useEffect } from 'react';
import { getFields, addField, updateField, deleteField, fieldTypes, formatPrice } from '../../data';

export default function Fields() {
    const [fields, setFieldsList] = useState([]);
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

    useEffect(() => {
        setFieldsList(getFields());
    }, []);

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
            alert('กรุณากรอกชื่อสนามและราคา');
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
        } else {
            addField(fieldData);
        }
        setShowFieldModal(false);
        setFieldsList(getFields());
    };

    const handleDeleteField = (fieldId) => {
        if (confirm('ยืนยันการลบสนามนี้?')) {
            deleteField(fieldId);
            setFieldsList(getFields());
        }
    };

    const getTypeName = (type) => {
        const t = fieldTypes.find(ft => ft.id === type);
        return t ? t.name : type;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>จัดการสนามกีฬา ({fields.length})</h2>
                <button className="btn btn-primary btn-glow" onClick={openAddFieldModal}>➕ เพิ่มสนาม</button>
            </div>
            <div className="premium-card">
                <div className="table-container">
                    <table className="table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem' }}>รูป</th>
                                <th style={{ padding: '1rem' }}>ชื่อสนาม</th>
                                <th style={{ padding: '1rem' }}>ประเภท</th>
                                <th style={{ padding: '1rem' }}>ราคา/ชม.</th>
                                <th style={{ padding: '1rem' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(field => (
                                <tr key={field.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}><img src={field.image} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{field.name}</td>
                                    <td style={{ padding: '1rem' }}><span className="badge badge-primary">{getTypeName(field.type)}</span></td>
                                    <td style={{ padding: '1rem' }}>฿{formatPrice(field.price)}</td>
                                    <td style={{ padding: '1rem' }}>
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

            {/* Field Edit Modal */}
            {showFieldModal && (
                <div className="modal-overlay active" onClick={() => setShowFieldModal(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal premium-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', padding: '1.5rem', background: 'var(--bg-card)' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 className="modal-title" style={{ margin: 0 }}>{editingField ? '✏️ แก้ไขสนาม' : '➕ เพิ่มสนามใหม่'}</h3>
                            <button className="modal-close" onClick={() => setShowFieldModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>ชื่อสนาม *</label>
                                <input type="text" name="name" className="premium-input" placeholder="เช่น สนามฟุตบอล A" value={fieldForm.name} onChange={handleFieldFormChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>ประเภท</label>
                                <select name="type" className="premium-input" value={fieldForm.type} onChange={handleFieldFormChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
                                    <option value="football">ฟุตบอล</option>
                                    <option value="badminton">แบดมินตัน</option>
                                    <option value="basketball">บาสเกตบอล</option>
                                    <option value="tennis">เทนนิส</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>รายละเอียด</label>
                                <textarea name="description" className="premium-input" rows="3" placeholder="รายละเอียดสนาม..." value={fieldForm.description} onChange={handleFieldFormChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>ราคา (บาท/ชม.) *</label>
                                <input type="number" name="price" className="premium-input" placeholder="500" value={fieldForm.price} onChange={handleFieldFormChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>URL รูปภาพ</label>
                                <input type="text" name="image" className="premium-input" placeholder="https://..." value={fieldForm.image} onChange={handleFieldFormChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                                {fieldForm.image && <img src={fieldForm.image} alt="" style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '8px' }} onError={(e) => e.target.style.display = 'none'} />}
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>สิ่งอำนวยความสะดวก (คั่นด้วย ,)</label>
                                <input type="text" name="facilities" className="premium-input" placeholder="ห้องน้ำ, ที่จอดรถ" value={fieldForm.facilities} onChange={handleFieldFormChange} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowFieldModal(false)}>ยกเลิก</button>
                            <button className="btn btn-primary btn-glow" onClick={handleSaveField}>{editingField ? 'บันทึก' : 'เพิ่มสนาม'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
