"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    UserCredential,
    updateEmail,
    updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

interface User {
    email: string | null;
    uid: string | null;
    name?: string | null;
    role?: "admin" | "user";
};

const AuthContext = createContext({});

export const useAuth = () => useContext<{
    logIn?: (email: string, password: string) => Promise<UserCredential>;
    user?: User;
    logOut?: () => Promise<void>;
    deleteAccount?: (password: string) => Promise<void>;
    updateUserEmail?: (newEmail: string, password: string) => Promise<void>;
    updateUserPassword?: (currentPassword: string, newPassword: string) => Promise<void>;
    resetInactivityTimer?: () => void;
}>(AuthContext);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthContextProvider({
    children
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User>({ email: null, uid: null });
    const [loading, setLoading] = useState<boolean>(true);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const logOut = async () => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        setUser({ email: null, uid: null });
        await signOut(auth);
        window.location.href = '/';
    };

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        inactivityTimerRef.current = setTimeout(() => {
            logOut();
        }, SESSION_TIMEOUT);
    }, [logOut]);

    useEffect(() => {
        if (!user?.uid) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            window.addEventListener(event, resetInactivityTimer);
        });

        resetInactivityTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetInactivityTimer);
            });
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [user?.uid, resetInactivityTimer]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                const role = userDoc.data()?.role || "user";
                
                const userData = userDoc.data();
                setUser({
                    email: firebaseUser.email,
                    uid: firebaseUser.uid,
                    name: userData?.name || null,
                    role: role,
                });
                resetInactivityTimer();
            } else {
                setUser({ email: null, uid: null });
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                }
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, []);

    const logIn = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        resetInactivityTimer();
        return result;
    };


    const deleteAccount = async (password: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            throw new Error('No authenticated user found');
        }

        try {
            // Reauthenticate user first (required for security)
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                password
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Delete user document from Firestore
            await deleteDoc(doc(db, "users", currentUser.uid));

            // Delete user from Firebase Authentication
            await deleteUser(currentUser);

            // Log out user (clears state and inactivity timer)
            await logOut();
        } catch (error: any) {
            console.error('Error deleting account:', error);
            
            // Handle specific error cases
            if (error.code === 'auth/wrong-password') {
                throw new Error('Incorrect password. Please try again.');
            } else if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many failed attempts. Please try again later.');
            } else if (error.code === 'auth/requires-recent-login') {
                throw new Error('For security, please log in again before deleting your account.');
            } else {
                throw new Error('Failed to delete account. Please try again.');
            }
        }
    };

    const updateUserEmail = async (newEmail: string, password: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            throw new Error('No authenticated user found');
        }

        try {
            // Reauthenticate user first (required for security)
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                password
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Update email
            await updateEmail(currentUser, newEmail);

            // Update local state
            setUser(prev => ({ ...prev, email: newEmail }));
        } catch (error: any) {
            console.error('Error updating email:', error);
            
            // Handle specific error cases
            if (error.code === 'auth/wrong-password') {
                throw new Error('Incorrect password. Please try again.');
            } else if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many failed attempts. Please try again later.');
            } else if (error.code === 'auth/requires-recent-login') {
                throw new Error('For security, please log in again before changing your email.');
            } else if (error.code === 'auth/email-already-in-use') {
                throw new Error('This email is already in use by another account.');
            } else if (error.code === 'auth/invalid-email') {
                throw new Error('Please enter a valid email address.');
            } else {
                throw new Error('Failed to update email. Please try again.');
            }
        }
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            throw new Error('No authenticated user found');
        }

        try {
            // Reauthenticate user first (required for security)
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);
        } catch (error: any) {
            console.error('Error updating password:', error);
            
            // Handle specific error cases
            if (error.code === 'auth/wrong-password') {
                throw new Error('Incorrect current password. Please try again.');
            } else if (error.code === 'auth/too-many-requests') {
                throw new Error('Too many failed attempts. Please try again later.');
            } else if (error.code === 'auth/requires-recent-login') {
                throw new Error('For security, please log in again before changing your password.');
            } else if (error.code === 'auth/weak-password') {
                throw new Error('Password is too weak. Please choose a stronger password.');
            } else {
                throw new Error('Failed to update password. Please try again.');
            }
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            logIn, 
            logOut, 
            deleteAccount,
            updateUserEmail,
            updateUserPassword,
            resetInactivityTimer
        }}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
