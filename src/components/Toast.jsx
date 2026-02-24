import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icon = type === 'success' ? '✓' : '✕';

    return (
        <div className={`toast toast-${type}`}>
            <span style={{ fontSize: '1.25rem' }}>{icon}</span>
            <span>{message}</span>
            <button className="btn-ghost" onClick={onClose} style={{ padding: '0.25rem' }}>✕</button>
        </div>
    );
}
