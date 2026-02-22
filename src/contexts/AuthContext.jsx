import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext(null);

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

                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        userData = { ...userData, ...data };
                    }
                } catch (err) {
                    console.warn('Could not fetch user data from Firestore:', err);
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
                await setDoc(userRef, {
                    email: result.user.email,
                    name: result.user.displayName,
                    photoURL: result.user.photoURL,
                    role: 'user',
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

    // Admin login with email
    const login = async (userData) => {
        const { identifier, password } = userData;
        try {
            await signInWithEmailAndPassword(auth, identifier, password);
            return true;
        } catch (err) {
            return false;
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

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            register,
            loginWithPhone,
            loginWithGoogle,
            login,
            logout,
            updateUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
