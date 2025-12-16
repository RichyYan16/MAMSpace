"use client"

import { useEffect, useState, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, GraduationCap, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth";
import type { User } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type UserPageProps = {
    params: Promise<{ id: string }>;
}

export default function UserPage({ params }: UserPageProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { user: authUser, deleteAccount } = useAuth();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    
    const canEdit =
        authUser?.role === "admin" ||
        (!!authUser?.uid && (authUser.uid === id || (user?.uid && user.uid === authUser.uid))) ||
        (!!authUser?.email && user?.email === authUser.email);
    
    const canDeleteAccount = 
        (!!authUser?.uid && (authUser.uid === id || (user?.uid && user.uid === authUser.uid))) ||
        (!!authUser?.email && user?.email === authUser.email);

    const handleDeleteAccount = async () => {
        if (!deletePassword.trim()) {
            setDeleteError("Password is required to delete your account.");
            return;
        }

        setDeleting(true);
        setDeleteError("");
        
        try {
            if (deleteAccount) {
                await deleteAccount(deletePassword);
            }
        } catch (error: any) {
            console.error("Error deleting account:", error);
            setDeleteError(error.message || "Failed to delete account. Please try again.");
        } finally {
            setDeleting(false);
            if (!deleteError) {
                setShowDeleteDialog(false);
                setDeletePassword("");
            }
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", id));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                    console.log("Loaded user data:", userData);
                    console.log("Education data:", userData.education);
                    setUser(userData);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        
        
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchUser();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">User not found.</p>
            </div>
        );
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const displayName = user.name || user.email || "User";

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to User Database
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user.avatar} alt={displayName} />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle>{displayName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                        Contact Information
                                    </h3>
                                    <div className="grid gap-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Roles</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles?.map((role, index) => (
                                            <Badge key={index} variant="secondary" className="font-normal">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>About</CardTitle>
                            <div className="flex gap-2">
                                {canEdit && (
                                    <Link href={`/edit?id=${id}`}>
                                        <Button variant="outline" size="sm">
                                            Edit Profile
                                        </Button>
                                    </Link>
                                )}
                                {canDeleteAccount && (
                                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Account
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <Trash2 className="h-5 w-5 text-destructive" />
                                                    Delete Account
                                                </DialogTitle>
                                                <DialogDescription>
                                                    This will permanently delete your account and all associated data. This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="delete-password">Confirm your password</Label>
                                                    <Input
                                                        id="delete-password"
                                                        type="password"
                                                        value={deletePassword}
                                                        onChange={(e) => setDeletePassword(e.target.value)}
                                                        placeholder="Enter your password"
                                                        disabled={deleting}
                                                    />
                                                    {deleteError && (
                                                        <p className="text-sm text-destructive">{deleteError}</p>
                                                    )}
                                                </div>
                                                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                                    <p className="text-sm text-destructive font-medium">Warning:</p>
                                                    <ul className="text-sm text-destructive mt-1 list-disc list-inside">
                                                        <li>Your account will be permanently deleted</li>
                                                        <li>All your profile data will be removed</li>
                                                        <li>You will need to create a new account to access the platform again</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowDeleteDialog(false);
                                                        setDeletePassword("");
                                                        setDeleteError("");
                                                    }}
                                                    disabled={deleting}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleting || !deletePassword.trim()}
                                                >
                                                    {deleting ? "Deleting..." : "Delete Account"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Bio</h3>
                                <p className="text-muted-foreground">
                                    {user.bio || "No bio provided."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Education</h3>
                                <div className="space-y-4">
                                    {user.education?.map((edu, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">{edu.degree}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {edu.institution} • {edu.year}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!user.education || user.education.length === 0) && (
                                        <p className="text-muted-foreground">No education information provided.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}