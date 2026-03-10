/**
 * Unit Tests for src/data.js
 * ทดสอบทั้ง 21 functions — sync helpers + async Firestore CRUD
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----- Mock firebase/firestore -----
const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();

vi.mock('firebase/firestore', () => ({
    collection: (...args) => mockCollection(...args),
    doc: (...args) => mockDoc(...args),
    getDocs: (...args) => mockGetDocs(...args),
    getDoc: (...args) => mockGetDoc(...args),
    setDoc: (...args) => mockSetDoc(...args),
    updateDoc: (...args) => mockUpdateDoc(...args),
    deleteDoc: (...args) => mockDeleteDoc(...args),
    query: (...args) => mockQuery(...args),
    where: (...args) => mockWhere(...args),
}));

vi.mock('../firebase', () => ({ db: 'mock-db' }));

// ----- Import after mocks -----
import {
    defaultFields, sportsFields, fieldTypes, typeLabels, timeSlots,
    formatDateThai, formatPrice,
    getFields, getFieldById, addField, updateField, deleteField,
    getSettings, saveSettings,
    getBookings, addBooking, confirmBookingPayment, uploadPaymentSlip,
    expireOverdueBookings, cancelBooking, deleteBooking,
    isSlotBooked, getBookingsByPhone, seedDefaultData
} from '../data';

// =============================================
// PART 1: Sync Constants & Helpers
// =============================================

describe('Constants', () => {
    it('defaultFields มี 6 สนาม', () => {
        expect(defaultFields).toHaveLength(6);
    });

    it('sportsFields เป็น alias ของ defaultFields', () => {
        expect(sportsFields).toBe(defaultFields);
    });

    it('fieldTypes มี 5 ประเภท (all + 4 sports)', () => {
        expect(fieldTypes).toHaveLength(5);
        expect(fieldTypes[0].id).toBe('all');
    });

    it('typeLabels มี 4 ประเภทกีฬา', () => {
        expect(Object.keys(typeLabels)).toHaveLength(4);
        expect(typeLabels.football).toBe('ฟุตบอล');
        expect(typeLabels.badminton).toBe('แบดมินตัน');
        expect(typeLabels.basketball).toBe('บาสเกตบอล');
        expect(typeLabels.tennis).toBe('เทนนิส');
    });

    it('timeSlots มี 14 ช่วงเวลา (08:00-22:00)', () => {
        expect(timeSlots).toHaveLength(14);
        expect(timeSlots[0]).toBe('08:00-09:00');
        expect(timeSlots[13]).toBe('21:00-22:00');
    });

    it('defaultFields ทุกตัวมี id, name, type, price, image, facilities', () => {
        defaultFields.forEach(f => {
            expect(f).toHaveProperty('id');
            expect(f).toHaveProperty('name');
            expect(f).toHaveProperty('type');
            expect(f).toHaveProperty('price');
            expect(f).toHaveProperty('image');
            expect(f).toHaveProperty('facilities');
            expect(Array.isArray(f.facilities)).toBe(true);
        });
    });
});

describe('formatDateThai()', () => {
    it('แปลงวันที่เป็นภาษาไทย', () => {
        const result = formatDateThai('2025-01-15');
        expect(result).toContain('2568'); // พ.ศ.
    });

    it('รองรับ ISO date string', () => {
        const result = formatDateThai('2025-06-20T10:00:00.000Z');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('formatPrice()', () => {
    it('จัดรูปแบบตัวเลข', () => {
        expect(formatPrice(800)).toBe('800');
    });

    it('ใส่ comma สำหรับตัวเลขใหญ่', () => {
        expect(formatPrice(1500)).toBe('1,500');
        expect(formatPrice(100000)).toBe('100,000');
    });

    it('ค่า 0', () => {
        expect(formatPrice(0)).toBe('0');
    });
});

// =============================================
// PART 2: Firestore CRUD (Async with mocks)
// =============================================

beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query-ref');
    mockWhere.mockReturnValue('mock-where-ref');
});

// --- Fields ---

describe('getFields()', () => {
    it('คืน array ของ fields เมื่อมีข้อมูล', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'f1', data: () => ({ name: 'สนาม A', type: 'football' }) },
                { id: 'f2', data: () => ({ name: 'สนาม B', type: 'badminton' }) },
            ]
        });

        const result = await getFields();
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: 'f1', name: 'สนาม A', type: 'football' });
    });

    it('คืน [] เมื่อ collection ว่าง', async () => {
        mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
        const result = await getFields();
        expect(result).toEqual([]);
    });

    it('คืน [] เมื่อเกิด error', async () => {
        mockGetDocs.mockRejectedValue(new Error('network error'));
        const result = await getFields();
        expect(result).toEqual([]);
    });
});

describe('getFieldById()', () => {
    it('คืน field object เมื่อพบ', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            id: 'field-1',
            data: () => ({ name: 'สนาม A', price: 800 })
        });

        const result = await getFieldById('field-1');
        expect(result).toEqual({ id: 'field-1', name: 'สนาม A', price: 800 });
    });

    it('คืน null เมื่อไม่พบ', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false });
        const result = await getFieldById('nonexistent');
        expect(result).toBeNull();
    });

    it('คืน null เมื่อ error', async () => {
        mockGetDoc.mockRejectedValue(new Error('fail'));
        const result = await getFieldById('field-1');
        expect(result).toBeNull();
    });
});

describe('addField()', () => {
    it('สร้าง field ใหม่ด้วย auto-generated ID', async () => {
        mockSetDoc.mockResolvedValue(undefined);

        const result = await addField({ name: 'สนามใหม่', type: 'tennis', price: 300 });
        expect(result).not.toBeNull();
        expect(result.id).toMatch(/^field-\d+$/);
        expect(result.name).toBe('สนามใหม่');
        expect(mockSetDoc).toHaveBeenCalledOnce();
    });

    it('คืน null เมื่อ error', async () => {
        mockSetDoc.mockRejectedValue(new Error('write fail'));
        const result = await addField({ name: 'test' });
        expect(result).toBeNull();
    });
});

describe('updateField()', () => {
    it('อัปเดต field สำเร็จ', async () => {
        mockUpdateDoc.mockResolvedValue(undefined);
        const result = await updateField('field-1', { price: 900 });
        expect(result).toEqual({ id: 'field-1', price: 900 });
        expect(mockUpdateDoc).toHaveBeenCalledOnce();
    });

    it('คืน null เมื่อ error', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('fail'));
        const result = await updateField('field-1', { price: 900 });
        expect(result).toBeNull();
    });
});

describe('deleteField()', () => {
    it('ลบ field สำเร็จ', async () => {
        mockDeleteDoc.mockResolvedValue(undefined);
        await deleteField('field-1');
        expect(mockDeleteDoc).toHaveBeenCalledOnce();
    });

    it('ไม่ throw เมื่อ error', async () => {
        mockDeleteDoc.mockRejectedValue(new Error('fail'));
        await expect(deleteField('field-1')).resolves.toBeUndefined();
    });
});

// --- Settings ---

describe('getSettings()', () => {
    it('คืน settings จาก Firestore + merge กับ default', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ promptPayNumber: '099' })
        });

        const result = await getSettings();
        expect(result.promptPayNumber).toBe('099');
        // ค่าอื่นจาก default
        expect(result.bookingTimeoutMinutes).toBe(10);
    });

    it('คืน defaultSettings เมื่อไม่มีข้อมูลใน Firestore', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false });
        const result = await getSettings();
        expect(result.bookingTimeoutMinutes).toBe(10);
        expect(result.maxHoursPerBooking).toBe(4);
    });

    it('คืน defaultSettings เมื่อ error', async () => {
        mockGetDoc.mockRejectedValue(new Error('fail'));
        const result = await getSettings();
        expect(result.bookingTimeoutMinutes).toBe(10);
    });
});

describe('saveSettings()', () => {
    it('บันทึก settings ด้วย merge: true', async () => {
        mockSetDoc.mockResolvedValue(undefined);
        await saveSettings({ promptPayNumber: '099' });
        expect(mockSetDoc).toHaveBeenCalledOnce();
        // ตรวจสอบ merge option
        const call = mockSetDoc.mock.calls[0];
        expect(call[2]).toEqual({ merge: true });
    });
});

// --- Bookings ---

describe('getBookings()', () => {
    it('คืน array ของ bookings', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ fieldId: 'f1', status: 'pending' }) },
            ]
        });
        const result = await getBookings();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('b1');
    });

    it('คืน [] เมื่อว่าง', async () => {
        mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
        const result = await getBookings();
        expect(result).toEqual([]);
    });
});

describe('addBooking()', () => {
    it('สร้าง booking พร้อม status=pending, deadline, และ createdAt', async () => {
        // Mock getSettings (getDoc จะถูกเรียกใน addBooking → getSettings)
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ bookingTimeoutMinutes: 10 })
        });
        mockSetDoc.mockResolvedValue(undefined);

        const result = await addBooking({
            fieldId: 'field-1',
            date: '2025-06-20',
            timeSlot: '10:00-11:00',
            customerName: 'ทดสอบ',
            customerPhone: '0999999999',
            price: 800
        });

        expect(result).not.toBeNull();
        expect(result.status).toBe('pending');
        expect(result.id).toMatch(/^booking-\d+$/);
        expect(result.createdAt).toBeDefined();
        expect(result.paymentDeadline).toBeDefined();
        expect(result.slots).toEqual(['10:00-11:00']);
    });

    it('คืน null เมื่อ setDoc error', async () => {
        // getSettings catches its own error, so setDoc must fail
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ bookingTimeoutMinutes: 10 })
        });
        mockSetDoc.mockRejectedValue(new Error('write fail'));
        const result = await addBooking({ fieldId: 'f1' });
        expect(result).toBeNull();
    });
});

describe('confirmBookingPayment()', () => {
    it('เปลี่ยน status เป็น confirmed เมื่อ pending', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ status: 'pending' })
        });
        mockUpdateDoc.mockResolvedValue(undefined);

        const result = await confirmBookingPayment('b1');
        expect(result).toBe(true);
        expect(mockUpdateDoc).toHaveBeenCalledOnce();
    });

    it('คืน false เมื่อ status ไม่ใช่ pending', async () => {
        mockGetDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ status: 'confirmed' })
        });
        const result = await confirmBookingPayment('b1');
        expect(result).toBe(false);
    });

    it('คืน false เมื่อ booking ไม่มี', async () => {
        mockGetDoc.mockResolvedValue({ exists: () => false });
        const result = await confirmBookingPayment('nonexistent');
        expect(result).toBe(false);
    });
});

describe('uploadPaymentSlip()', () => {
    it('อัปเดต paymentSlip + timestamp', async () => {
        mockUpdateDoc.mockResolvedValue(undefined);

        const result = await uploadPaymentSlip('b1', 'data:image/png;base64,...');
        expect(result).toBe(true);
        expect(mockUpdateDoc).toHaveBeenCalledOnce();
    });

    it('คืน false เมื่อ error', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('fail'));
        const result = await uploadPaymentSlip('b1', 'data');
        expect(result).toBe(false);
    });
});

describe('expireOverdueBookings()', () => {
    it('เปลี่ยน status เป็น expired สำหรับ overdue pending bookings', async () => {
        const pastDeadline = new Date(Date.now() - 60000).toISOString();
        // Optimized: query returns only pending bookings (pre-filtered by where)
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ status: 'pending', paymentDeadline: pastDeadline }) },
            ]
        });
        mockUpdateDoc.mockResolvedValue(undefined);

        const result = await expireOverdueBookings();
        expect(result).toBe(true);
        expect(mockUpdateDoc).toHaveBeenCalledOnce();
    });

    it('คืน false เมื่อไม่มี overdue', async () => {
        const futureDeadline = new Date(Date.now() + 600000).toISOString();
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ status: 'pending', paymentDeadline: futureDeadline }) },
            ]
        });

        const result = await expireOverdueBookings();
        expect(result).toBe(false);
    });

    it('ข้าม bookings ที่มี paymentSlip แล้ว', async () => {
        const pastDeadline = new Date(Date.now() - 60000).toISOString();
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ status: 'pending', paymentDeadline: pastDeadline, paymentSlip: 'data:...' }) },
            ]
        });

        const result = await expireOverdueBookings();
        expect(result).toBe(false);
        expect(mockUpdateDoc).not.toHaveBeenCalled();
    });
});

describe('cancelBooking()', () => {
    it('เปลี่ยน status เป็น cancelled', async () => {
        mockUpdateDoc.mockResolvedValue(undefined);
        const result = await cancelBooking('b1');
        expect(result).toBe(true);
    });

    it('คืน false เมื่อ error', async () => {
        mockUpdateDoc.mockRejectedValue(new Error('fail'));
        const result = await cancelBooking('b1');
        expect(result).toBe(false);
    });
});

describe('deleteBooking()', () => {
    it('ลบ booking สำเร็จ', async () => {
        mockDeleteDoc.mockResolvedValue(undefined);
        await deleteBooking('b1');
        expect(mockDeleteDoc).toHaveBeenCalledOnce();
    });
});

describe('isSlotBooked()', () => {
    it('คืน true เมื่อ slot ถูกจองแล้ว (pending)', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ fieldId: 'f1', date: '2025-06-20', slots: ['10:00-11:00'], status: 'pending' }) },
            ]
        });

        const result = await isSlotBooked('f1', '2025-06-20', '10:00-11:00');
        expect(result).toBe(true);
    });

    it('คืน false เมื่อ slot ว่าง', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ fieldId: 'f1', date: '2025-06-20', slots: ['09:00-10:00'], status: 'pending' }) },
            ]
        });

        const result = await isSlotBooked('f1', '2025-06-20', '10:00-11:00');
        expect(result).toBe(false);
    });

    it('ข้าม bookings ที่ cancelled/expired', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ fieldId: 'f1', date: '2025-06-20', slots: ['10:00-11:00'], status: 'cancelled' }) },
            ]
        });

        const result = await isSlotBooked('f1', '2025-06-20', '10:00-11:00');
        expect(result).toBe(false);
    });

    it('รองรับ legacy timeSlot field', async () => {
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ fieldId: 'f1', date: '2025-06-20', timeSlot: '10:00-11:00', status: 'pending' }) },
            ]
        });

        const result = await isSlotBooked('f1', '2025-06-20', '10:00-11:00');
        expect(result).toBe(true);
    });

    it('คืน false เมื่อ error', async () => {
        mockGetDocs.mockRejectedValue(new Error('fail'));
        const result = await isSlotBooked('f1', '2025-06-20', '10:00-11:00');
        expect(result).toBe(false);
    });
});

describe('getBookingsByPhone()', () => {
    it('คืน bookings ที่ตรงกับเบอร์โทร (filtered by Firestore where)', async () => {
        // Optimized: where('customerPhone', '==', phone) returns only matching docs
        mockGetDocs.mockResolvedValue({
            empty: false,
            docs: [
                { id: 'b1', data: () => ({ customerPhone: '0999', status: 'pending' }) },
                { id: 'b3', data: () => ({ customerPhone: '0999', status: 'confirmed' }) },
            ]
        });

        const result = await getBookingsByPhone('0999');
        expect(result).toHaveLength(2);
        expect(result.every(b => b.customerPhone === '0999')).toBe(true);
    });

    it('คืน [] เมื่อไม่พบ', async () => {
        mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

        const result = await getBookingsByPhone('0999');
        expect(result).toEqual([]);
    });
});

// --- Seeding ---

describe('seedDefaultData()', () => {
    it('seed fields + settings เมื่อ collections ว่าง', async () => {
        mockGetDocs.mockResolvedValue({ empty: true, docs: [] }); // fields empty
        mockGetDoc.mockResolvedValue({ exists: () => false }); // settings not exists
        mockSetDoc.mockResolvedValue(undefined);

        const result = await seedDefaultData();
        expect(result).toBe(true);
        // 6 fields + 1 settings = 7 setDoc calls
        expect(mockSetDoc).toHaveBeenCalledTimes(7);
    });

    it('ข้ามถ้ามีข้อมูลแล้ว', async () => {
        mockGetDocs.mockResolvedValue({ empty: false, docs: [{ id: 'f1' }] }); // fields exist
        mockGetDoc.mockResolvedValue({ exists: () => true }); // settings exists

        const result = await seedDefaultData();
        expect(result).toBe(true);
        expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('คืน false เมื่อ error', async () => {
        mockGetDocs.mockRejectedValue(new Error('fail'));
        const result = await seedDefaultData();
        expect(result).toBe(false);
    });
});
