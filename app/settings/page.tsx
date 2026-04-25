"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const { user, updateUserEmail, updateUserPassword } = useAuth();
    const router = useRouter();

    if (!user?.uid) {
        router.push("/login");
        return null;
    }

    const handleEmailChange = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!currentPassword.trim()) {
            setError("Current password is required to change email.");
            setLoading(false);
            return;
        }

        if (!newEmail.trim()) {
            setError("New email address is required.");
            setLoading(false);
            return;
        }

        if (newEmail.trim() === user.email) {
            setError("New email must be different from current email.");
            setLoading(false);
            return;
        }

        try {
            await updateUserEmail!(newEmail.trim(), currentPassword);
            setSuccess("Email updated successfully!");
            setCurrentPassword("");
            setNewEmail("");
            setShowEmailForm(false);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to update email.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!currentPassword.trim()) {
            setError("Current password is required.");
            setLoading(false);
            return;
        }
        
        if (!newPassword.trim()) {
            setError("New password is required.");
            setLoading(false);
            return;
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

        if (newPassword.trim().length < 6) {
            setError("New password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        if (newPassword.trim() === currentPassword.trim()) {
            setError("New password must be different from current password.");
            setLoading(false);
            return;
        }

        try {
            await updateUserPassword!(currentPassword, newPassword);
            setSuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Account Settings</CardTitle>
                            <CardDescription>
                                Manage your account credentials and security settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">
                                    {success}
                                </div>
                            )}

                            {/* Email Change Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Change Email</h3>
                                {!showEmailForm ? (
                                    <Button 
                                        onClick={() => setShowEmailForm(true)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Change Email
                                    </Button>
                                ) : (
                                    <form onSubmit={handleEmailChange} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="newEmail">New Email</Label>
                                            <Input
                                                id="newEmail"
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Enter new email address"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="flex-1"
                                            >
                                                {loading ? "Updating..." : "Update Email"}
                                            </Button>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowEmailForm(false);
                                                    setCurrentPassword("");
                                                    setNewEmail("");
                                                    setError("");
                                                    setSuccess("");
                                                }}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Password Change Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Change Password</h3>
                                {!showPasswordForm ? (
                                    <Button 
                                        onClick={() => setShowPasswordForm(true)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Change Password
                                    </Button>
                                ) : (
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="currentPassword2">Current Password</Label>
                                            <Input
                                                id="currentPassword2"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="flex-1"
                                            >
                                                {loading ? "Updating..." : "Update Password"}
                                            </Button>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setCurrentPassword("");
                                                    setNewPassword("");
                                                    setConfirmPassword("");
                                                    setError("");
                                                }}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    onClick={() => router.push("/")}
                                    className="w-full"
                                >
                                    Return to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
