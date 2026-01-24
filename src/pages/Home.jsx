import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FieldCard from '../components/FieldCard';
import { getFields, fieldTypes } from '../data';

export default function Home() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [fields, setFields] = useState([]);

    useEffect(() => {
        setFields(getFields());
    }, []);

    const filteredFields = fields.filter(field => {
        const matchesType = activeFilter === 'all' || field.type === activeFilter;
        const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            field.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div>
            {/* Hero Section - Sport Modern Luxury */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        {/* Badge */}
                        <div className="hero-badge animate-slide-up" style={{
                            background: 'rgba(255, 107, 53, 0.1)',
                            border: '1px solid rgba(255, 107, 53, 0.3)'
                        }}>
                            <span style={{ color: 'var(--accent-sport)' }}>▌</span> SPORT BOOKING
                        </div>

                        {/* Main Title - Bebas Neue Style */}
                        <h1 className="hero-title animate-slide-up animate-delay-1" style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                            letterSpacing: '0.02em',
                            lineHeight: 1.1
                        }}>
                            จองสนามกีฬา<br />
                            <span className="gradient-text" style={{
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>ระดับพรีเมียม</span>
                        </h1>

                        {/* Tagline */}
                        <p className="hero-description animate-slide-up animate-delay-2" style={{
                            fontSize: '1.25rem',
                            fontWeight: 300,
                            letterSpacing: '0.1em',
                            marginBottom: '2rem'
                        }}>
                            เลือก • จอง • เล่น<br />
                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>ง่าย รวดเร็ว ไม่ต้องรอ</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="hero-actions animate-slide-up animate-delay-3">
                            <a href="#fields" className="btn btn-lg btn-primary btn-glow" style={{
                                background: 'var(--accent-sport)',
                                boxShadow: '0 0 30px var(--accent-sport-glow)'
                            }}>
                                เริ่มจองเลย
                            </a>
                            <Link to="/my-bookings" className="btn btn-lg btn-secondary" style={{
                                border: '1px solid var(--border-color-strong)'
                            }}>
                                ดูสนามทั้งหมด →
                            </Link>
                        </div>

                        {/* Stats Bar */}
                        <div className="animate-slide-up animate-delay-4" style={{
                            marginTop: '3rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '3rem',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-sport)' }}>50+</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>สนามกีฬา</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-gold)' }}>10K+</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ผู้ใช้งาน</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>⭐ 4.9</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>คะแนนรีวิว</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fields Section */}
            <section id="fields" className="section">
                <div className="container">
                    <h2 className="section-title">สนามกีฬาของเรา</h2>
                    <p className="section-description">
                        เลือกสนามที่เหมาะกับคุณ พร้อมสิ่งอำนวยความสะดวกครบครัน
                    </p>

                    {/* Filter Pills */}
                    <div className="filter-pills">
                        {fieldTypes.map(type => (
                            <button
                                key={type.id}
                                className={`filter-pill ${activeFilter === type.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(type.id)}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>

                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 grid-cols-2 grid-cols-3" style={{ marginTop: '2rem' }}>
                        {filteredFields.map(field => (
                            <FieldCard key={field.id} field={field} />
                        ))}
                    </div>

                    {filteredFields.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3 className="empty-state-title">ไม่พบสนามที่ค้นหา</h3>
                            <p className="empty-state-description">
                                ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <h2 className="section-title">ทำไมต้องเลือกเรา?</h2>
                    <div className="grid grid-cols-1 grid-cols-3" style={{ marginTop: '2rem' }}>
                        <div className="stat-card" style={{ textAlign: 'center' }}>
                            <div className="stat-icon primary" style={{ margin: '0 auto 1rem' }}>⚡</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>จองง่าย รวดเร็ว</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                เลือกวัน เวลา กรอกข้อมูล ยืนยันการจองได้ทันที
                            </p>
                        </div>
                        <div className="stat-card" style={{ textAlign: 'center' }}>
                            <div className="stat-icon success" style={{ margin: '0 auto 1rem' }}>📅</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>เช็คตารางเวลาว่าง</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                ดูตารางเวลาว่างได้แบบ real-time ไม่ต้องโทรถาม
                            </p>
                        </div>
                        <div className="stat-card" style={{ textAlign: 'center' }}>
                            <div className="stat-icon warning" style={{ margin: '0 auto 1rem' }}>🏟️</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>สนามมาตรฐาน</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                สนามคุณภาพสูง พร้อมสิ่งอำนวยความสะดวกครบ
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
