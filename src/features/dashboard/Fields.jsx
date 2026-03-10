import { useState, useEffect } from 'react';
import { getFields, addField, updateField, deleteField, fieldTypes, formatPrice } from '../../data';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Fields() {
    const [fields, setFieldsList] = useState([]);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, fieldId: null });
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [fieldForm, setFieldForm] = useState({
        name: '',
        type: 'football',
        description: '',
        price: '',
        image: '',
        facilities: ''
    });

    useEffect(() => {
        const loadFields = async () => {
            setFieldsList(await getFields());
        };
        loadFields();
    }, []);

    const openAddFieldModal = () => {
        setEditingField(null);
        setErrors({});
        setFieldForm({ name: '', type: 'football', description: '', price: '', image: '', facilities: '' });
        setShowFieldModal(true);
    };

    const openEditFieldModal = (field) => {
        setEditingField(field);
        setErrors({});
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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!fieldForm.name.trim()) newErrors.name = 'กรุณากรอกชื่อสนาม';
        if (!fieldForm.price || parseInt(fieldForm.price) <= 0) newErrors.price = 'กรุณากรอกราคาที่ถูกต้อง';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveField = async () => {
        if (!validateForm()) return;

        const fieldData = {
            name: fieldForm.name.trim(),
            type: fieldForm.type,
            description: fieldForm.description.trim(),
            price: parseInt(fieldForm.price) || 0,
            image: fieldForm.image || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format',
            facilities: fieldForm.facilities.split(',').map(f => f.trim()).filter(f => f)
        };
        if (editingField) {
            await updateField(editingField.id, fieldData);
        } else {
            await addField(fieldData);
        }
        setShowFieldModal(false);
        setFieldsList(await getFields());
    };

    const handleDeleteField = (fieldId) => {
        setConfirmState({ isOpen: true, fieldId });
    };

    const confirmDelete = async () => {
        await deleteField(confirmState.fieldId);
        setConfirmState({ isOpen: false, fieldId: null });
        setFieldsList(await getFields());
    };

    const getTypeName = (type) => {
        const t = fieldTypes.find(ft => ft.id === type);
        return t ? t.name : type;
    };

    const inputStyle = (fieldName) => ({
        width: '100%',
        padding: '0.75rem',
        background: 'var(--bg-secondary)',
        border: `1px solid ${errors[fieldName] ? 'var(--danger-400)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        transition: 'border-color 0.2s'
    });

    // Filtered fields
    const filteredFields = fields.filter(f => {
        if (filterType !== 'all' && f.type !== filterType) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="admin-page-title" style={{ marginBottom: 0 }}>
                    <h2>Manage Fields</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>จัดการสนาม</span>
                </div>
                <button className="btn btn-primary btn-glow" onClick={openAddFieldModal}>
                    ➕ Add New Field
                </button>
            </div>

            {/* Search & Filter */}
            <div className="admin-filter-bar">
                <div className="admin-search" style={{ minWidth: '280px', flex: 1, maxWidth: '400px' }}>
                    <span className="admin-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                        }}
                    >
                        {fieldTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Field Cards Grid */}
            <div className="admin-fields-grid">
                {filteredFields.map(field => (
                    <div key={field.id} className="admin-field-card">
                        <div className="admin-field-card-image">
                            <img src={field.image} alt={field.name} />
                            <span className="admin-field-card-badge active">Active</span>
                        </div>
                        <div className="admin-field-card-body">
                            <div className="admin-field-card-type">{getTypeName(field.type)}</div>
                            <div className="admin-field-card-name">{field.name}</div>
                            <div className="admin-field-card-desc">{field.description}</div>
                            <div className="admin-field-card-meta">
                                <div className="admin-field-card-capacity">
                                    👥 {field.facilities ? field.facilities.length : 0} facilities
                                </div>
                                <div className="admin-field-card-price">
                                    ฿{formatPrice(field.price)} <span>/ hr</span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-field-card-actions">
                            <button className="btn btn-sm btn-secondary" onClick={() => openEditFieldModal(field)}>✏️ แก้ไข</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteField(field.id)}>🗑️ ลบ</button>
                        </div>
                    </div>
                ))}

                {/* Add New Field Card */}
                <div className="admin-field-card-add" onClick={openAddFieldModal}>
                    <div className="admin-field-card-add-icon">+</div>
                    <div className="admin-field-card-add-title">Create Another Field</div>
                    <div className="admin-field-card-add-desc">Add a new sports facility, set pricing and upload images.</div>
                </div>
            </div>

            {/* Field Edit Modal */}
            {showFieldModal && (
                <div className="modal-overlay active" onClick={() => setShowFieldModal(false)} role="dialog" aria-modal="true" aria-label={editingField ? 'แก้ไขสนาม' : 'เพิ่มสนามใหม่'} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal premium-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', padding: '1.5rem', background: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 className="modal-title" style={{ margin: 0 }}>{editingField ? '✏️ แก้ไขสนาม' : '➕ เพิ่มสนามใหม่'}</h3>
                            <button className="modal-close" onClick={() => setShowFieldModal(false)} aria-label="ปิด" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>ชื่อสนาม *</label>
                                <input type="text" name="name" placeholder="เช่น สนามฟุตบอล A" value={fieldForm.name} onChange={handleFieldFormChange} style={inputStyle('name')} />
                                {errors.name && <div style={{ color: 'var(--danger-400)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>ประเภท</label>
                                <select name="type" value={fieldForm.type} onChange={handleFieldFormChange} style={inputStyle('type')}>
                                    <option value="football">ฟุตบอล</option>
                                    <option value="badminton">แบดมินตัน</option>
                                    <option value="basketball">บาสเกตบอล</option>
                                    <option value="tennis">เทนนิส</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>รายละเอียด</label>
                                <textarea name="description" rows="3" placeholder="รายละเอียดสนาม..." value={fieldForm.description} onChange={handleFieldFormChange} style={{ ...inputStyle('description'), resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>ราคา (บาท/ชม.) *</label>
                                <input type="number" name="price" placeholder="500" value={fieldForm.price} onChange={handleFieldFormChange} style={inputStyle('price')} />
                                {errors.price && <div style={{ color: 'var(--danger-400)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.price}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>URL รูปภาพ</label>
                                <input type="text" name="image" placeholder="https://..." value={fieldForm.image} onChange={handleFieldFormChange} style={inputStyle('image')} />
                                {fieldForm.image && <img src={fieldForm.image} alt="" style={{ marginTop: '0.5rem', maxHeight: '100px', borderRadius: '8px' }} onError={(e) => e.target.style.display = 'none'} />}
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>สิ่งอำนวยความสะดวก (คั่นด้วย ,)</label>
                                <input type="text" name="facilities" placeholder="ห้องน้ำ, ที่จอดรถ" value={fieldForm.facilities} onChange={handleFieldFormChange} style={inputStyle('facilities')} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setShowFieldModal(false)}>ยกเลิก</button>
                            <button className="btn btn-primary btn-glow" onClick={handleSaveField}>{editingField ? 'บันทึก' : 'เพิ่มสนาม'}</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="ลบสนาม"
                message="ยืนยันการลบสนามนี้? การจองที่เกี่ยวข้องจะไม่ถูกลบ"
                confirmLabel="ลบสนาม"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmState({ isOpen: false, fieldId: null })}
            />
        </div>
    );
}
