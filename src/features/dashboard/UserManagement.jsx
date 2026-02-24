import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { IoSearch, IoPeople, IoShield, IoPersonCircle, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { MdAdminPanelSettings } from 'react-icons/md';

export default function UserManagement() {
    const { user, isOwner, getAllUsers, updateUserRole } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [toast, setToast] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        setLoading(false);
    }, [getAllUsers]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadUsers();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [loadUsers]);

    const handleRoleChange = async (uid, newRole) => {
        setConfirmAction(null);
        const result = await updateUserRole(uid, newRole);
        if (result.success) {
            setToast({ type: 'success', message: `เปลี่ยน role เป็น "${newRole}" เรียบร้อยแล้ว` });
            loadUsers();
        } else {
            setToast({ type: 'error', message: result.message });
        }
        setTimeout(() => setToast(null), 3000);
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = !search ||
            (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.phone || '').toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const roleStyles = {
        owner: { bg: 'rgba(212, 175, 55, 0.15)', border: 'rgba(212, 175, 55, 0.3)', color: '#D4AF37', label: 'เจ้าของ' },
        admin: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', color: '#818CF8', label: 'แอดมิน' },
        user: { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', color: '#9CA3AF', label: 'ผู้ใช้' }
    };

    if (!isOwner) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <IoShield style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>ไม่มีสิทธิ์เข้าถึง</h2>
                <p style={{ color: 'var(--text-muted)' }}>เฉพาะเจ้าของกิจการเท่านั้นที่จัดการผู้ใช้ได้</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '42px', height: '42px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#D4AF37', fontSize: '1.25rem'
                    }}>
                        <IoPeople />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>จัดการผู้ใช้</h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            จัดการ role ผู้ใช้ในระบบ — มีผู้ใช้ทั้งหมด {users.length} คน
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{
                    flex: 1, minWidth: '200px',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.5rem 1rem'
                }}>
                    <IoSearch style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, email, เบอร์โทร..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'owner', 'admin', 'user'].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid',
                                borderColor: filterRole === role ? 'var(--accent-sport)' : 'var(--border-color)',
                                background: filterRole === role ? 'rgba(255, 107, 53, 0.15)' : 'var(--bg-card)',
                                color: filterRole === role ? 'var(--accent-sport)' : 'var(--text-secondary)',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            {role === 'all' ? 'ทั้งหมด' : roleStyles[role]?.label || role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    กำลังโหลดข้อมูลผู้ใช้...
                </div>
            ) : filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <IoPeople style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                    <p>ไม่พบผู้ใช้</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredUsers.map(u => {
                        const rs = roleStyles[u.role] || roleStyles.user;
                        const isSelf = u.uid === user?.uid;
                        const isTargetOwner = u.role === 'owner';

                        return (
                            <div key={u.uid} style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-xl)',
                                padding: '1.25rem',
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                transition: 'var(--transition-fast)',
                                flexWrap: 'wrap'
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '44px', height: '44px',
                                    borderRadius: '50%', overflow: 'hidden',
                                    background: 'var(--bg-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {u.photoURL ? (
                                        <>
                                            <img 
                                                src={u.photoURL} 
                                                alt="" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div style={{ 
                                                display: 'none', 
                                                width: '100%', 
                                                height: '100%', 
                                                background: 'var(--accent-sport)', 
                                                color: '#fff', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '18px', 
                                                fontWeight: 'bold' 
                                            }}>
                                                {u.name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            background: 'var(--accent-sport)', 
                                            color: '#fff', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '18px', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {u.name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{u.name || 'ไม่ระบุชื่อ'}</span>
                                        {isSelf && (
                                            <span style={{
                                                fontSize: '0.65rem', padding: '0.1rem 0.5rem',
                                                background: 'rgba(255, 107, 53, 0.15)',
                                                borderRadius: 'var(--radius-full)',
                                                color: 'var(--accent-sport)', fontWeight: 600
                                            }}>คุณ</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {u.email || '—'}
                                        {u.phone && <span> · {u.phone}</span>}
                                    </div>
                                </div>

                                {/* Role Badge */}
                                <div style={{
                                    padding: '0.3rem 0.8rem',
                                    background: rs.bg, border: `1px solid ${rs.border}`,
                                    borderRadius: 'var(--radius-full)',
                                    color: rs.color, fontSize: '0.75rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '0.35rem'
                                }}>
                                    {u.role === 'owner' ? <MdAdminPanelSettings /> : u.role === 'admin' ? <IoShield /> : <IoPersonCircle />}
                                    {rs.label}
                                </div>

                                {/* Actions */}
                                {!isSelf && !isTargetOwner && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {u.role !== 'admin' ? (
                                            <button
                                                onClick={() => setConfirmAction({ uid: u.uid, name: u.name, newRole: 'admin' })}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: '#818CF8', fontSize: '0.75rem',
                                                    fontWeight: 600, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                    transition: 'var(--transition-fast)'
                                                }}
                                            >
                                                <IoCheckmarkCircle /> เลื่อนเป็นแอดมิน
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmAction({ uid: u.uid, name: u.name, newRole: 'user' })}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: '#EF4444', fontSize: '0.75rem',
                                                    fontWeight: 600, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                    transition: 'var(--transition-fast)'
                                                }}
                                            >
                                                <IoCloseCircle /> ลดเป็นผู้ใช้
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmAction && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2rem', maxWidth: '400px', width: '90%',
                        textAlign: 'center'
                    }}>
                        <MdAdminPanelSettings style={{ fontSize: '2.5rem', color: 'var(--accent-sport)', marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>ยืนยันการเปลี่ยน Role</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            ต้องการเปลี่ยน <strong>{confirmAction.name || 'ผู้ใช้'}</strong> เป็น{' '}
                            <strong style={{ color: confirmAction.newRole === 'admin' ? '#818CF8' : '#EF4444' }}>
                                {confirmAction.newRole === 'admin' ? 'แอดมิน' : 'ผู้ใช้ทั่วไป'}
                            </strong> หรือไม่?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmAction(null)}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600, cursor: 'pointer'
                                }}
                            >ยกเลิก</button>
                            <button
                                onClick={() => handleRoleChange(confirmAction.uid, confirmAction.newRole)}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    background: 'var(--accent-sport)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'white',
                                    fontWeight: 700, cursor: 'pointer',
                                    boxShadow: '0 2px 12px rgba(255, 107, 53, 0.3)'
                                }}
                            >ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: toast.type === 'success' ? 'var(--success-500)' : 'var(--danger-500)',
                    color: 'white', borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem', fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: 1001, animation: 'fadeIn 0.3s ease'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
