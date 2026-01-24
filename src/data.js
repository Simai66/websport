// Default sports fields data
const defaultFields = [
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

// LocalStorage keys
const FIELDS_KEY = 'sports_fields';

// Initialize fields in localStorage if not exists
const initializeFields = () => {
    if (!localStorage.getItem(FIELDS_KEY)) {
        localStorage.setItem(FIELDS_KEY, JSON.stringify(defaultFields));
    }
};

// Get all fields
export const getFields = () => {
    initializeFields();
    const data = localStorage.getItem(FIELDS_KEY);
    return data ? JSON.parse(data) : defaultFields;
};

// Save fields
export const saveFields = (fields) => {
    localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
};

// Add new field
export const addField = (field) => {
    const fields = getFields();
    const newField = {
        ...field,
        id: `field-${Date.now()}`
    };
    fields.push(newField);
    saveFields(fields);
    return newField;
};

// Update field
export const updateField = (fieldId, updatedData) => {
    const fields = getFields();
    const index = fields.findIndex(f => f.id === fieldId);
    if (index !== -1) {
        fields[index] = { ...fields[index], ...updatedData };
        saveFields(fields);
        return fields[index];
    }
    return null;
};

// Delete field
export const deleteField = (fieldId) => {
    const fields = getFields();
    const filtered = fields.filter(f => f.id !== fieldId);
    saveFields(filtered);
};

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

// Time slots
export const timeSlots = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
    '20:00-21:00',
    '21:00-22:00'
];

// LocalStorage keys
const BOOKINGS_KEY = 'sports_bookings';
const SETTINGS_KEY = 'sports_settings';

// Default settings
const defaultSettings = {
    promptPayNumber: '0812345678', // เบอร์ PromptPay
    promptPayName: 'SportBooking',
    customQRImage: '', // URL รูป QR ของตัวเอง (ถ้าว่างจะ generate)
    bookingTimeoutMinutes: 10,
    maxHoursPerBooking: 4
};

// Get settings
export const getSettings = () => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};

// Save settings
export const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Get all bookings
export const getBookings = () => {
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
};

// Save bookings
export const saveBookings = (bookings) => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

// Add new booking (supports multiple slots)
export const addBooking = (booking) => {
    const bookings = getBookings();
    const settings = getSettings();
    const now = new Date();
    const deadline = new Date(now.getTime() + settings.bookingTimeoutMinutes * 60000);

    const newBooking = {
        ...booking,
        id: `booking-${Date.now()}`,
        status: 'pending', // pending -> confirmed/expired/cancelled
        slots: booking.slots || [booking.timeSlot], // Support array of slots
        totalPrice: booking.totalPrice || booking.price,
        createdAt: now.toISOString(),
        paymentDeadline: deadline.toISOString()
    };
    bookings.push(newBooking);
    saveBookings(bookings);
    return newBooking;
};

// Confirm payment (admin)
export const confirmBookingPayment = (bookingId) => {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1 && bookings[index].status === 'pending') {
        bookings[index].status = 'confirmed';
        bookings[index].confirmedAt = new Date().toISOString();
        saveBookings(bookings);
        return true;
    }
    return false;
};

// Upload payment slip
export const uploadPaymentSlip = (bookingId, slipData) => {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
        bookings[index].paymentSlip = slipData;
        bookings[index].slipUploadedAt = new Date().toISOString();
        saveBookings(bookings);
        return true;
    }
    return false;
};

// Check and expire overdue bookings
export const expireOverdueBookings = () => {
    const bookings = getBookings();
    const now = new Date();
    let changed = false;

    bookings.forEach(b => {
        if (b.status === 'pending' && new Date(b.paymentDeadline) < now) {
            b.status = 'expired';
            changed = true;
        }
    });

    if (changed) saveBookings(bookings);
    return changed;
};

// Cancel booking
export const cancelBooking = (bookingId) => {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
        bookings[index].status = 'cancelled';
        saveBookings(bookings);
        return true;
    }
    return false;
};

// Delete booking (admin)
export const deleteBooking = (bookingId) => {
    const bookings = getBookings();
    const filtered = bookings.filter(b => b.id !== bookingId);
    saveBookings(filtered);
};

// Check if time slot is booked
export const isSlotBooked = (fieldId, date, timeSlot) => {
    const bookings = getBookings();
    return bookings.some(b => {
        if (b.fieldId !== fieldId || b.date !== date) return false;
        if (b.status === 'cancelled' || b.status === 'expired') return false;
        // Check both single slot and multi-slot bookings
        const slots = b.slots || [b.timeSlot];
        return slots.includes(timeSlot);
    });
};

// Get bookings by phone
export const getBookingsByPhone = (phone) => {
    const bookings = getBookings();
    return bookings.filter(b => b.customerPhone === phone);
};

// Get field by id
export const getFieldById = (id) => {
    const fields = getFields();
    return fields.find(f => f.id === id);
};

// Format date to Thai
export const formatDateThai = (dateStr) => {
    const date = new Date(dateStr);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('th-TH', options);
};

// Format price
export const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price);
};
