import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        background: 'var(--card-bg, #1a1a2e)',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '480px',
                        width: '100%',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>
                            เกิดข้อผิดพลาด
                        </h2>
                        <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
                        </p>
                        {this.state.error && (
                            <details style={{ marginBottom: '1rem', textAlign: 'left' }}>
                                <summary style={{ color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    รายละเอียด
                                </summary>
                                <pre style={{
                                    color: '#ff6b6b',
                                    fontSize: '0.75rem',
                                    padding: '0.5rem',
                                    background: '#111',
                                    borderRadius: '8px',
                                    marginTop: '0.5rem',
                                    overflowX: 'auto'
                                }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleRetry}
                            style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: '#fff',
                                border: 'none',
                                padding: '0.75rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            🔄 ลองใหม่
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
