import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential
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
                let userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || 'User',
                    photoURL: firebaseUser.photoURL,
                    role: 'user'
                };

                const isOwnerEmail = firebaseUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

                try {
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        userData = { ...userData, ...data };

                        // Auto-fix owner role if needed
                        if (isOwnerEmail && data.role !== 'owner') {
                            await updateDoc(userRef, { role: 'owner' });
                            userData.role = 'owner';
                        }
                    } else {
                        // Create user document on first login
                        const newUserData = {
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'User',
                            photoURL: firebaseUser.photoURL,
                            role: isOwnerEmail ? 'owner' : 'user',
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userRef, newUserData);
                        userData = { ...userData, ...newUserData };
                    }
                } catch (err) {
                    console.warn('Could not fetch user data from Firestore:', err);
                    if (isOwnerEmail) userData.role = 'owner';
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

    // Register with email + password
    const register = async ({ email, password, name, phone }) => {
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(cred.user, { displayName: name || email.split('@')[0] });

            try {
                await setDoc(doc(db, 'users', cred.user.uid), {
                    email,
                    name: name || email.split('@')[0],
                    phone: phone || '',
                    role: email.toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'owner' : 'user',
                    createdAt: new Date().toISOString()
                });
            } catch (fsErr) {
                console.warn('Firestore save failed:', fsErr);
            }

            return { success: true };
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                return { success: false, message: 'อีเมลนี้ถูกใช้สมัครแล้ว' };
            }
            if (err.code === 'auth/weak-password') {
                return { success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
            }
            return { success: false, message: err.message };
        }
    };

    // Login with email + password
    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            return { success: false, message: 'อีเมล หรือ รหัสผ่านไม่ถูกต้อง' };
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

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

    const logout = async () => {
        await signOut(auth);
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        if (!auth.currentUser || !auth.currentUser.email) {
            return { success: false, message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ (ล็อกอินผ่าน Google)' };
        }

        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Update password
            await updatePassword(auth.currentUser, newPassword);
            return { success: true };
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                return { success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' };
            }
            if (err.code === 'auth/weak-password') {
                return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
            }
            return { success: false, message: err.message };
        }
    };

    // Update user profile (name, phone)
    const updateUserProfile = async (data) => {
        if (!auth.currentUser) return { success: false, message: 'ไม่ได้เข้าสู่ระบบ' };

        try {
            if (data.name) {
                await updateProfile(auth.currentUser, { displayName: data.name });
            }

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

            setUser(prev => ({ ...prev, ...data }));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Get all users (Owner/Admin)
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

    // Reset password (forgot password)
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                return { success: false, message: 'ไม่พบอีเมลนี้ในระบบ' };
            }
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
            login,
            loginWithGoogle,
            logout,
            changePassword,
            resetPassword,
            updateUserProfile,
            getAllUsers,
            updateUserRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
