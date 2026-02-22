import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FieldCard from '../components/FieldCard';
import { getFields, getBookings, fieldTypes } from '../data';
import { IoFitness, IoFootball, IoSearch, IoTrophy, IoFlash, IoCalendar, IoCard, IoStar } from 'react-icons/io5';
import { MdSportsTennis, MdSportsBasketball } from 'react-icons/md';
import { GiShuttlecock } from 'react-icons/gi';
import { HiClipboardList } from 'react-icons/hi';

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const containerRef = useRef(null);

    const observerCallback = useCallback(([entry]) => {
        if (entry.isIntersecting) setStarted(true);
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(observerCallback, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [observerCallback]);

    useEffect(() => {
        if (!started) return;
        let startTime;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [started, end, duration]);

    return <span ref={containerRef}>{count}{suffix}</span>;
}

const typeIcons = {
    all: <IoFitness style={{ fontSize: '1.1em', verticalAlign: '-0.1em' }} />,
    football: <IoFootball style={{ fontSize: '1.1em', verticalAlign: '-0.1em' }} />,
    badminton: <GiShuttlecock style={{ fontSize: '1.1em', verticalAlign: '-0.1em' }} />,
    basketball: <MdSportsBasketball style={{ fontSize: '1.1em', verticalAlign: '-0.1em' }} />,
    tennis: <MdSportsTennis style={{ fontSize: '1.1em', verticalAlign: '-0.1em' }} />
};

export default function Home() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [fields, setFields] = useState([]);
    const [liveStats, setLiveStats] = useState({ fields: 0, bookings: 0, confirmed: 0 });

    useEffect(() => {
        const loadedFields = getFields();
        setFields(loadedFields);
        const bookings = getBookings();
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        setLiveStats({
            fields: loadedFields.length,
            bookings: bookings.length,
            confirmed
        });
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
                                <IoFlash style={{ verticalAlign: '-0.1em' }} /> เริ่มจองเลย
                            </a>
                            <Link to="/my-bookings" className="btn btn-lg btn-secondary" style={{
                                border: '1px solid var(--border-color-strong)'
                            }}>
                                <HiClipboardList style={{ verticalAlign: '-0.1em' }} /> เช็คการจอง
                            </Link>
                        </div>

                        {/* Live Stats Bar */}
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
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: 'var(--accent-sport)',
                                    fontFamily: 'var(--font-numbers)'
                                }}>
                                    <AnimatedCounter end={liveStats.fields} duration={1500} suffix="+" />
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>สนามกีฬา</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: 'var(--accent-gold)',
                                    fontFamily: 'var(--font-numbers)'
                                }}>
                                    <AnimatedCounter end={liveStats.bookings || 50} duration={2000} suffix="+" />
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>การจองสำเร็จ</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-numbers)'
                                }}>
                                    <IoStar style={{ verticalAlign: '-0.1em', color: 'var(--accent-gold)' }} /> 4.9
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>คะแนนรีวิว</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="container">
                    <h2 className="section-title">จองง่ายใน 3 ขั้นตอน</h2>
                    <p className="section-description">ไม่ต้องโทร ไม่ต้องรอ จองออนไลน์ได้ตลอด 24 ชั่วโมง</p>

                    <div className="how-it-works-grid">
                        <div className="how-it-works-step">
                            <div className="how-it-works-number">1</div>
                            <div className="how-it-works-icon"><IoFitness /></div>
                            <h3 className="how-it-works-title">เลือกสนาม</h3>
                            <p className="how-it-works-desc">เลือกสนามกีฬาที่ต้องการ พร้อมดูรายละเอียดและสิ่งอำนวยความสะดวก</p>
                        </div>
                        <div className="how-it-works-connector">
                            <span>→</span>
                        </div>
                        <div className="how-it-works-step">
                            <div className="how-it-works-number">2</div>
                            <div className="how-it-works-icon"><IoCalendar /></div>
                            <h3 className="how-it-works-title">เลือกวันเวลา</h3>
                            <p className="how-it-works-desc">ดูตารางเวลาว่าง เลือกวันที่และช่วงเวลาที่สะดวก</p>
                        </div>
                        <div className="how-it-works-connector">
                            <span>→</span>
                        </div>
                        <div className="how-it-works-step">
                            <div className="how-it-works-number">3</div>
                            <div className="how-it-works-icon"><IoCard /></div>
                            <h3 className="how-it-works-title">ชำระเงิน</h3>
                            <p className="how-it-works-desc">สแกน QR Code PromptPay ชำระเงินง่ายๆ รับยืนยันทันที</p>
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

                    {/* Search Bar */}
                    <div style={{
                        maxWidth: '480px',
                        margin: '0 auto 1.5rem',
                        position: 'relative'
                    }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="ค้นหาสนาม..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '1rem',
                                paddingRight: '2.5rem',
                                background: 'var(--bg-glass)',
                                textAlign: 'center',
                                fontSize: '1rem'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="filter-pills">
                        {fieldTypes.map(type => (
                            <button
                                key={type.id}
                                className={`filter-pill ${activeFilter === type.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(type.id)}
                            >
                                {typeIcons[type.id]} {type.name}
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
                            <div className="empty-state-icon"><IoSearch /></div>
                            <h3 className="empty-state-title">ไม่พบสนามที่ค้นหา</h3>
                            <p className="empty-state-description">
                                ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่
                            </p>
                            {searchTerm && (
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}
                                >
                                    ล้างการค้นหา
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <h2 className="section-title">ทำไมต้องเลือกเรา?</h2>
                    <p className="section-description">ระบบจองสนามกีฬาที่ออกแบบเพื่อความสะดวกสบายของคุณ</p>
                    <div className="grid grid-cols-1 grid-cols-3" style={{ marginTop: '2rem' }}>
                        <div className="feature-card premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div className="feature-icon-wrap" style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(255, 107, 53, 0.15)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                fontSize: '1.75rem'
                            }}>
                                <IoFlash />
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>จองง่าย รวดเร็ว</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                                เลือกวัน เวลา กรอกข้อมูล ยืนยันการจองได้ทันที ไม่ต้องรอโทรแจ้ง
                            </p>
                        </div>
                        <div className="feature-card premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div className="feature-icon-wrap" style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                fontSize: '1.75rem'
                            }}>
                                <IoCalendar />
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>เช็คตารางเวลาว่าง</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                                ดูตารางเวลาว่างได้แบบ real-time ไม่ต้องโทรถามซ้ำแล้วซ้ำอีก
                            </p>
                        </div>
                        <div className="feature-card premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div className="feature-icon-wrap" style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(212, 175, 55, 0.15)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                fontSize: '1.75rem'
                            }}>
                                <IoCard />
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem' }}>ชำระเงินออนไลน์</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                                สแกน QR Code PromptPay ชำระเงินทันที ปลอดภัย สะดวก
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="section" style={{ textAlign: 'center' }}>
                <div className="container">
                    <div className="premium-card" style={{
                        padding: '3rem 2rem',
                        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                        border: '1px solid var(--border-accent)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                            marginBottom: '1rem',
                            letterSpacing: '0.02em'
                        }}>
                            พร้อมเริ่มเล่นกีฬาแล้วหรือยัง?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                            จองสนามกีฬาตอนนี้ เลือกเวลาที่สะดวก ชำระเงินออนไลน์ เริ่มเล่นได้ทันที
                        </p>
                        <a href="#fields" className="btn btn-lg btn-primary btn-glow" style={{
                            background: 'var(--accent-sport)',
                            boxShadow: '0 0 30px var(--accent-sport-glow)'
                        }}>
                            <IoTrophy style={{ verticalAlign: '-0.1em' }} /> จองสนามเลย
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
