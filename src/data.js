import { db } from './firebase';
import {
    collection, doc, getDocs, getDoc, updateDoc, deleteDoc, setDoc,
    query, where
} from 'firebase/firestore';

// ========== Constants (synchronous — no change needed) ==========

// Default sports fields data (used for seeding only)
export const defaultFields = [
    {
        id: 'field-1',
        name: 'สนามฟุตบอล A',
        type: 'football',
        description: 'สนามหญ้าเทียมมาตรฐาน FIFA ขนาด 7 คน พร้อมระบบไฟส่องสว่างคุณภาพสูง',
        price: 800,
        image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format',
        facilities: ['ห้องน้ำ', 'ที่จอดรถ', 'ไฟส่องสว่าง', 'ห้องแต่งตัว']
    },
    {
        id: 'field-2',
        name: 'สนามฟุตบอล B',
        type: 'football',
        description: 'สนามหญ้าเทียมขนาด 5 คน เหมาะสำหรับเกมสั้นๆ',
        price: 600,
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format',
        facilities: ['ห้องน้ำ', 'ที่จอดรถ', 'ไฟส่องสว่าง']
    },
    {
        id: 'field-3',
        name: 'สนามแบดมินตัน 1',
        type: 'badminton',
        description: 'สนามแบดมินตันมาตรฐานพร้อมพื้นยางคุณภาพสูง',
        price: 150,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format',
        facilities: ['ห้องน้ำ', 'ที่จอดรถ', 'แอร์']
    },
    {
        id: 'field-4',
        name: 'สนามแบดมินตัน 2',
        type: 'badminton',
        description: 'สนามแบดมินตันพร้อมอุปกรณ์ให้เช่า',
        price: 150,
        image: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be5?w=800&auto=format',
        facilities: ['ห้องน้ำ', 'ที่จอดรถ', 'แอร์', 'อุปกรณ์ให้เช่า']
    },
    {
        id: 'field-5',
        name: 'สนามบาสเกตบอล',
        type: 'basketball',
        description: 'สนามบาสเกตบอลกลางแจ้งมาตรฐาน พร้อมไฟส่องสว่างในตอนกลางคืน',
        price: 500,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format',
        facilities: ['ห้องน้ำ', 'ที่จอดรถ', 'ไฟส่องสว่าง']
    },
    {
        id: 'field-6',
        name: 'สนามเทนนิส',
        type: 'tennis',
        description: 'สนามเทนนิสพื้นฮาร์ดคอร์ทมาตรฐาน ITF',
        price: 300,
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format',
        facilities: ['ห้องน้ำ', 'ที่จอดรถ', 'ไฟส่องสว่าง', 'ลูกเทนนิสให้เช่า']
    }
];

// For backward compatibility
export const sportsFields = defaultFields;

// Field types for filtering
export const fieldTypes = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'football', name: 'ฟุตบอล' },
    { id: 'badminton', name: 'แบดมินตัน' },
    { id: 'basketball', name: 'บาสเกตบอล' },
    { id: 'tennis', name: 'เทนนิส' }
];

// Type label lookup
export const typeLabels = {
    football: 'ฟุตบอล',
    badminton: 'แบดมินตัน',
    basketball: 'บาสเกตบอล',
    tennis: 'เทนนิส'
};

// Time slots
export const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
    '20:00-21:00', '21:00-22:00'
];

// Default settings
const defaultSettings = {
    promptPayNumber: '0972917189',
    promptPayName: 'ภาณุวัฒน์ เวยรัมย์',
    customQRImage: '',
    bookingTimeoutMinutes: 10,
    maxHoursPerBooking: 4
};

// Format date to Thai
export const formatDateThai = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
};

// Format price
export const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price);
};

// ========== Firestore CRUD (async) ==========

// --- Fields ---

export const getFields = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'fields'));
        if (snapshot.empty) return [];
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('getFields error:', err);
        return [];
    }
};

export const getFieldById = async (id) => {
    try {
        const docRef = doc(db, 'fields', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) return { id: snap.id, ...snap.data() };
        return null;
    } catch (err) {
        console.error('getFieldById error:', err);
        return null;
    }
};

export const addField = async (field) => {
    try {
        const newId = `field-${Date.now()}`;
        const newField = { ...field, id: newId };
        await setDoc(doc(db, 'fields', newId), newField);
        return newField;
    } catch (err) {
        console.error('addField error:', err);
        return null;
    }
};

export const updateField = async (fieldId, updatedData) => {
    try {
        const docRef = doc(db, 'fields', fieldId);
        await updateDoc(docRef, updatedData);
        return { id: fieldId, ...updatedData };
    } catch (err) {
        console.error('updateField error:', err);
        return null;
    }
};

export const deleteField = async (fieldId) => {
    try {
        await deleteDoc(doc(db, 'fields', fieldId));
    } catch (err) {
        console.error('deleteField error:', err);
    }
};

// --- Settings ---

export const getSettings = async () => {
    try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) return { ...defaultSettings, ...snap.data() };
        return defaultSettings;
    } catch (err) {
        console.error('getSettings error:', err);
        return defaultSettings;
    }
};

export const saveSettings = async (settings) => {
    try {
        await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
    } catch (err) {
        console.error('saveSettings error:', err);
    }
};

// --- Bookings ---

export const getBookings = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'bookings'));
        if (snapshot.empty) return [];
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('getBookings error:', err);
        return [];
    }
};

export const addBooking = async (booking) => {
    try {
        const settings = await getSettings();
        const now = new Date();
        const deadline = new Date(now.getTime() + settings.bookingTimeoutMinutes * 60000);
        const newId = `booking-${Date.now()}`;

        const newBooking = {
            ...booking,
            id: newId,
            status: 'pending',
            slots: booking.slots || [booking.timeSlot],
            totalPrice: booking.totalPrice || booking.price,
            createdAt: now.toISOString(),
            paymentDeadline: deadline.toISOString()
        };

        await setDoc(doc(db, 'bookings', newId), newBooking);
        return newBooking;
    } catch (err) {
        console.error('addBooking error:', err);
        return null;
    }
};

export const confirmBookingPayment = async (bookingId) => {
    try {
        const docRef = doc(db, 'bookings', bookingId);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().status === 'pending') {
            await updateDoc(docRef, {
                status: 'confirmed',
                confirmedAt: new Date().toISOString()
            });
            return true;
        }
        return false;
    } catch (err) {
        console.error('confirmBookingPayment error:', err);
        return false;
    }
};

export const uploadPaymentSlip = async (bookingId, slipData) => {
    try {
        const docRef = doc(db, 'bookings', bookingId);
        await updateDoc(docRef, {
            paymentSlip: slipData,
            slipUploadedAt: new Date().toISOString()
        });
        return true;
    } catch (err) {
        console.error('uploadPaymentSlip error:', err);
        return false;
    }
};

export const expireOverdueBookings = async () => {
    try {
        // Query only pending bookings (optimized — no need to fetch all)
        const q = query(collection(db, 'bookings'), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return false;

        const now = new Date();
        let changed = false;

        for (const d of snapshot.docs) {
            const b = { id: d.id, ...d.data() };
            if (!b.paymentSlip && new Date(b.paymentDeadline) < now) {
                await updateDoc(doc(db, 'bookings', b.id), { status: 'expired' });
                changed = true;
            }
        }
        return changed;
    } catch (err) {
        console.error('expireOverdueBookings error:', err);
        return false;
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
        return true;
    } catch (err) {
        console.error('cancelBooking error:', err);
        return false;
    }
};

export const deleteBooking = async (bookingId) => {
    try {
        await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (err) {
        console.error('deleteBooking error:', err);
    }
};

export const isSlotBooked = async (fieldId, date, timeSlot) => {
    try {
        // Query only bookings matching fieldId + date (optimized)
        const q = query(
            collection(db, 'bookings'),
            where('fieldId', '==', fieldId),
            where('date', '==', date)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return false;

        return snapshot.docs.some(d => {
            const b = d.data();
            if (b.status === 'cancelled' || b.status === 'expired') return false;
            const slots = b.slots || [b.timeSlot];
            return slots.includes(timeSlot);
        });
    } catch (err) {
        console.error('isSlotBooked error:', err);
        return false;
    }
};

export const getBookingsByPhone = async (phone) => {
    try {
        // Query only bookings matching phone (optimized)
        const q = query(collection(db, 'bookings'), where('customerPhone', '==', phone));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return [];
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('getBookingsByPhone error:', err);
        return [];
    }
};

// ========== Seeding ==========

export const seedDefaultData = async () => {
    try {
        // Seed fields if empty
        const fieldsSnap = await getDocs(collection(db, 'fields'));
        if (fieldsSnap.empty) {
            for (const field of defaultFields) {
                await setDoc(doc(db, 'fields', field.id), field);
            }
            console.log('✅ Seeded default fields');
        }

        // Seed settings if not exists
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        if (!settingsSnap.exists()) {
            await setDoc(doc(db, 'settings', 'global'), defaultSettings);
            console.log('✅ Seeded default settings');
        }

        return true;
    } catch (err) {
        console.error('seedDefaultData error:', err);
        return false;
    }
};
