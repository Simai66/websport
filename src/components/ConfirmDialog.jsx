export default function ConfirmDialog({ isOpen, title, message, confirmLabel = 'ยืนยัน', cancelLabel = 'ยกเลิก', onConfirm, onCancel, variant = 'danger' }) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: { background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-400)', btnClass: 'btn-danger' },
        warning: { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-400)', btnClass: 'btn-primary' }
    };

    const style = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="modal-overlay active" onClick={onCancel} role="alertdialog" aria-modal="true" aria-label={title}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                <div className="modal-body" style={{ padding: '2rem' }}>
                    <div style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '50%',
                        background: style.background,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '1.5rem'
                    }}>
                        {variant === 'danger' ? '⚠️' : '❓'}
                    </div>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{message}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
                        <button className={`btn ${style.btnClass}`} onClick={onConfirm}>{confirmLabel}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
