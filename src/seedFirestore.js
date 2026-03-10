/**
 * Seed script — run once to populate Firestore with default fields & settings.
 * Usage: import this file and call seedAll() from browser console,
 *        or temporarily call it in App.jsx on first load.
 */
import { db } from './firebase';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { defaultFields } from './data';

const defaultSettings = {
    promptPayNumber: '0972917189',
    promptPayName: 'ภาณุวัฒน์ เวยรัมย์',
    customQRImage: '',
    bookingTimeoutMinutes: 10,
    maxHoursPerBooking: 4
};

export async function seedFields() {
    const snapshot = await getDocs(collection(db, 'fields'));
    if (!snapshot.empty) {
        console.log(`⏭️  fields collection already has ${snapshot.size} docs — skipping seed.`);
        return;
    }
    for (const field of defaultFields) {
        const { id, ...data } = field;
        await setDoc(doc(db, 'fields', id), data);
        console.log(`✅ Seeded field: ${field.name}`);
    }
    console.log('🎉 All default fields seeded!');
}

export async function seedSettings() {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (snap.exists()) {
        console.log('⏭️  settings/global already exists — skipping seed.');
        return;
    }
    await setDoc(doc(db, 'settings', 'global'), defaultSettings);
    console.log('✅ Default settings seeded!');
}

export async function seedAll() {
    console.log('🌱 Starting Firestore seed...');
    await seedFields();
    await seedSettings();
    console.log('🌱 Seed complete!');
}
