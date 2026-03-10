/**
 * Integration Tests — React Components + Data Layer
 * ทดสอบ component render, props, interaction กับ data functions
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// --- Mock data module for components that import from data.js ---
vi.mock('../firebase', () => ({ db: 'mock-db' }));
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
}));

import FieldCard from '../components/FieldCard';
import StatusBadge from '../components/StatusBadge';
import ErrorBoundary from '../components/ErrorBoundary';

// =============================================
// FieldCard Integration Tests
// =============================================

describe('FieldCard', () => {
    const mockField = {
        id: 'field-1',
        name: 'สนามฟุตบอล A',
        type: 'football',
        price: 800,
        image: 'https://example.com/field.jpg',
        description: 'สนามหญ้าจริง มาตรฐานสากล',
        facilities: ['ไฟส่องสว่าง', 'ล็อกเกอร์']
    };

    const renderFieldCard = (field = mockField) =>
        render(
            <MemoryRouter>
                <FieldCard field={field} />
            </MemoryRouter>
        );

    it('แสดงชื่อสนาม', () => {
        renderFieldCard();
        expect(screen.getByText('สนามฟุตบอล A')).toBeInTheDocument();
    });

    it('แสดงราคาที่ format แล้ว', () => {
        renderFieldCard();
        expect(screen.getByText(/800/)).toBeInTheDocument();
    });

    it('แสดงราคาพร้อม comma', () => {
        renderFieldCard({ ...mockField, price: 1500 });
        expect(screen.getByText(/1,500/)).toBeInTheDocument();
    });

    it('แสดง type label ภาษาไทย', () => {
        renderFieldCard();
        expect(screen.getByText('ฟุตบอล')).toBeInTheDocument();
    });

    it('แสดง type label สำหรับ badminton', () => {
        renderFieldCard({ ...mockField, type: 'badminton' });
        expect(screen.getByText('แบดมินตัน')).toBeInTheDocument();
    });

    it('มี link ไปยัง field detail page', () => {
        renderFieldCard();
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/field/field-1');
    });

    it('แสดงปุ่ม "จองเลย"', () => {
        renderFieldCard();
        expect(screen.getByText('จองเลย')).toBeInTheDocument();
    });

    it('แสดงรูปสนาม', () => {
        renderFieldCard();
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'https://example.com/field.jpg');
        expect(img).toHaveAttribute('alt', 'สนามฟุตบอล A');
    });

    it('แสดง description', () => {
        renderFieldCard();
        expect(screen.getByText('สนามหญ้าจริง มาตรฐานสากล')).toBeInTheDocument();
    });
});

// =============================================
// StatusBadge Integration Tests
// =============================================

describe('StatusBadge', () => {
    it('แสดง "ชำระแล้ว" สำหรับ confirmed', () => {
        render(<StatusBadge status="confirmed" />);
        expect(screen.getByText('ชำระแล้ว')).toBeInTheDocument();
    });

    it('แสดง "รอชำระ" สำหรับ pending', () => {
        render(<StatusBadge status="pending" />);
        expect(screen.getByText('รอชำระ')).toBeInTheDocument();
    });

    it('แสดง "ยกเลิก" สำหรับ cancelled', () => {
        render(<StatusBadge status="cancelled" />);
        expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
    });

    it('แสดง "หมดเวลา" สำหรับ expired', () => {
        render(<StatusBadge status="expired" />);
        expect(screen.getByText('หมดเวลา')).toBeInTheDocument();
    });

    it('แสดง raw status เมื่อ unknown', () => {
        render(<StatusBadge status="unknown_status" />);
        expect(screen.getByText('unknown_status')).toBeInTheDocument();
    });

    it('ใช้ badge-success class สำหรับ confirmed', () => {
        const { container } = render(<StatusBadge status="confirmed" />);
        expect(container.querySelector('.badge-success')).toBeInTheDocument();
    });

    it('ใช้ badge-warning class สำหรับ pending', () => {
        const { container } = render(<StatusBadge status="pending" />);
        expect(container.querySelector('.badge-warning')).toBeInTheDocument();
    });

    it('ใช้ badge-danger class สำหรับ cancelled', () => {
        const { container } = render(<StatusBadge status="cancelled" />);
        expect(container.querySelector('.badge-danger')).toBeInTheDocument();
    });
});

// =============================================
// ErrorBoundary Integration Tests
// =============================================

describe('ErrorBoundary', () => {
    // Suppress console.error during error boundary tests
    const originalError = console.error;
    beforeAll(() => { console.error = vi.fn(); });
    afterAll(() => { console.error = originalError; });

    const ThrowingComponent = () => {
        throw new Error('Test crash!');
    };

    const SafeComponent = () => <div>Content loads fine</div>;

    it('แสดง children ปกติเมื่อไม่มี error', () => {
        render(
            <ErrorBoundary>
                <SafeComponent />
            </ErrorBoundary>
        );
        expect(screen.getByText('Content loads fine')).toBeInTheDocument();
    });

    it('แสดง error UI เมื่อ child crash', () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent />
            </ErrorBoundary>
        );
        expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    });

    it('แสดงปุ่ม "ลองใหม่"', () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent />
            </ErrorBoundary>
        );
        const btn = screen.getByRole('button');
        expect(btn).toBeInTheDocument();
        expect(btn.textContent).toContain('ลองใหม่');
    });

    it('แสดง error details ใน expandable section', () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent />
            </ErrorBoundary>
        );
        expect(screen.getByText('รายละเอียด')).toBeInTheDocument();
        expect(screen.getByText(/Test crash!/)).toBeInTheDocument();
    });
});
