"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";

interface UserWithRole extends User {
    uid?: string;
    role?: "admin" | "user";
}

interface AdminPanelProps {
    readOnly?: boolean;
}

export function AdminPanel({ readOnly = false }: AdminPanelProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user: currentUser } = useAuth();

    useEffect(() => {
        setLoading(true);

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("createdAt", "desc"));

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const usersData = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            uid: doc.id,
                            ...data,
                            id: data.id || 0,
                            name: data.name || '',
                            email: data.email || '',
                            avatar: data.avatar || '',
                            role: data.role || 'user',
                        } as User;
                    });
                    setUsers(usersData);
                    setLoading(false);
                },
                (err) => {
                    console.error("Error in users snapshot:", err);
                    setError("Failed to load users. Please refresh the page.");
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users. Please try again later.");
            setLoading(false);
        }
    }, []);

    const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
        try {
            setError("");
            await updateDoc(doc(db, "users", userId), { role: newRole });
        } catch (err: any) {
            setError(err.message || "Failed to update user role");
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading users...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    {!readOnly && <TableHead>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const userKey = user.uid || `user-${Math.random().toString(36).substr(2, 9)}`;
                                    return (
                                        <TableRow key={userKey}>
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>{user.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                                    {user.role || "user"}
                                                </Badge>
                                            </TableCell>
                                            {!readOnly && (
                                                <TableCell className="space-x-2">
                                                    {user.role === "admin" ? (
                                                        <Button
                                                            key={`demote-${userKey}`}
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateUserRole(userKey, "user")}
                                                        >
                                                            Demote to User
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            key={`promote-${userKey}`}
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => updateUserRole(userKey, "admin")}
                                                        >
                                                            Promote to Admin
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
