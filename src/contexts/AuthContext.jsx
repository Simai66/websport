import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext(null);

// Owner email — hardcoded as the top-level owner
const OWNER_EMAIL = 'armxbox27@gmail.com';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get extra user data from Firestore
                let userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || 'User',
                    photoURL: firebaseUser.photoURL,
                    role: 'user'
                };

                // Auto-assign owner role for the owner email
                const isOwnerEmail = firebaseUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        userData = { ...userData, ...data };

                        // If this is the owner email but role is not 'owner', fix it
                        if (isOwnerEmail && data.role !== 'owner') {
                            await updateDoc(userRef, { role: 'owner' });
                            userData.role = 'owner';
                        }
                    } else if (isOwnerEmail) {
                        // Owner doc doesn't exist yet — create it
                        const ownerData = {
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'Owner',
                            photoURL: firebaseUser.photoURL,
                            role: 'owner',
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userRef, ownerData);
                        userData = { ...userData, ...ownerData };
                    }
                } catch (err) {
                    console.warn('Could not fetch user data from Firestore:', err);
                    // Fallback: still mark as owner if email matches
                    if (isOwnerEmail) {
                        userData.role = 'owner';
                    }
                }

                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Role helpers
    const isOwner = user?.role === 'owner';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner';

    // Register with phone number (converted to email)
    const register = async (phone, password) => {
        const email = `${phone}@sportbooking.app`;

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name
            await updateProfile(cred.user, {
                displayName: `User-${phone.slice(-4)}`
            });

            // Save user data to Firestore (non-blocking — don't let it fail the registration)
            try {
                await setDoc(doc(db, 'users', cred.user.uid), {
                    phone,
                    email,
                    name: `User-${phone.slice(-4)}`,
                    role: 'user',
                    createdAt: new Date().toISOString()
                });
            } catch (firestoreErr) {
                console.warn('Firestore save failed (auth still succeeded):', firestoreErr);
            }

            return { success: true };
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                return { success: false, message: 'เบอร์โทรนี้ถูกใช้สมัครแล้ว' };
            }
            return { success: false, message: err.message };
        }
    };

    // Login with phone number (converted to email)
    const loginWithPhone = async (phone, password) => {
        const email = `${phone}@sportbooking.app`;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (err) {
            return { success: false, message: 'เบอร์โทร หรือ รหัสผ่านไม่ถูกต้อง' };
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Save/update user in Firestore
            const userRef = doc(db, 'users', result.user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                const isOwnerEmail = result.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
                await setDoc(userRef, {
                    email: result.user.email,
                    name: result.user.displayName,
                    photoURL: result.user.photoURL,
                    role: isOwnerEmail ? 'owner' : 'user',
                    createdAt: new Date().toISOString()
                });
            }

            return { success: true };
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                return { success: false, message: 'ยกเลิกการล็อกอิน' };
            }
            return { success: false, message: err.message };
        }
    };

    // Admin login with email — checks role after auth
    const login = async (userData) => {
        const { identifier, password } = userData;
        try {
            const cred = await signInWithEmailAndPassword(auth, identifier, password);

            // Check role in Firestore
            try {
                const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const isOwnerEmail = cred.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
                    if (data.role === 'admin' || data.role === 'owner' || isOwnerEmail) {
                        return { success: true };
                    }
                } else {
                    // If Firestore doc doesn't exist but email is owner
                    const isOwnerEmail = cred.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
                    if (isOwnerEmail) return { success: true };
                }
            } catch (fsErr) {
                console.warn('Could not verify admin role:', fsErr);
                // Allow owner email even if Firestore fails
                const isOwnerEmail = cred.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
                if (isOwnerEmail) return { success: true };
            }

            // Not an admin — sign out
            await signOut(auth);
            return { success: false, message: 'คุณไม่มีสิทธิ์เข้าระบบแอดมิน' };
        } catch (err) {
            return { success: false, message: 'Email หรือ Password ไม่ถูกต้อง' };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    // Update user profile (name, phone)
    const updateUserProfile = async (data) => {
        if (!auth.currentUser) return { success: false, message: 'ไม่ได้เข้าสู่ระบบ' };

        try {
            // Update Firebase Auth display name
            if (data.name) {
                await updateProfile(auth.currentUser, { displayName: data.name });
            }

            // Update Firestore
            try {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    await updateDoc(userRef, data);
                } else {
                    await setDoc(userRef, { ...data, email: auth.currentUser.email, role: 'user', createdAt: new Date().toISOString() });
                }
            } catch (fsErr) {
                console.warn('Firestore update failed:', fsErr);
            }

            // Update local state
            setUser(prev => ({ ...prev, ...data }));

            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Get all users from Firestore (Owner/Admin only)
    const getAllUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
        } catch (err) {
            console.error('Failed to get users:', err);
            return [];
        }
    };

    // Update user role (Owner only)
    const updateUserRole = async (uid, newRole) => {
        if (!isOwner) return { success: false, message: 'เฉพาะเจ้าของเท่านั้นที่เปลี่ยน role ได้' };
        if (newRole === 'owner') return { success: false, message: 'ไม่สามารถตั้งคนอื่นเป็นเจ้าของได้' };

        try {
            const userRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists() && userDoc.data().role === 'owner') {
                return { success: false, message: 'ไม่สามารถเปลี่ยน role ของเจ้าของได้' };
            }

            await updateDoc(userRef, { role: newRole });
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            isOwner,
            isAdmin,
            register,
            loginWithPhone,
            loginWithGoogle,
            login,
            logout,
            updateUserProfile,
            getAllUsers,
            updateUserRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
