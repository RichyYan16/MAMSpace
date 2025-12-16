"use client"

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    UserCredential,
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
    logOut?: () => Promise<void>,
    deleteAccount?: (password: string) => Promise<void>,
}>(AuthContext);

export function AuthContextProvider({
    children
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User>({ email: null, uid: null });
    const [loading, setLoading] = useState<Boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user role from Firestore
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
            } else {
                setUser({ email: null, uid: null });
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logIn = (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password);

    const logOut = async () => {
        setUser({ email: null, uid: null });
        await signOut(auth);
        // Redirect to home page after successful logout
        window.location.href = '/';
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

            // Clear local state
            setUser({ email: null, uid: null });
            
            // Redirect to home page
            window.location.href = '/';
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

    return (
        <AuthContext.Provider value={{ user, logIn, logOut, deleteAccount }}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
