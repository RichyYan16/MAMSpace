"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Education } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export default function Page() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthday, setBirthday] = useState("");
    const [summary, setSummary] = useState("");
    const [education, setEducation] = useState<Education[]>([]);
    const [newEducation, setNewEducation] = useState<Partial<Education>>({
        degree: "",
        institution: "",
        year: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const router = useRouter();
    const { user, updateUserPassword } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!firstName || !lastName || !birthday || !summary) {
            setError("Please fill out all required fields.");
            return;
        }

        if (!user?.uid) {
            setError("User not authenticated.");
            return;
        }

        try {
            setIsLoading(true);
            
            // Save user info to Firestore
            await setDoc(
                doc(db, "users", user.uid),
                {
                    name,
                    birthday,
                    summary,
                    education,
                    email: user.email,
                    uid: user.uid,
                    createdAt: new Date(),
                },
                { merge: true }
            );

            // Redirect to home page
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to save user info. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const addEducation = () => {
        if (newEducation.degree && newEducation.institution && newEducation.year) {
            setEducation([...education, newEducation as Education]);
            setNewEducation({ degree: "", institution: "", year: "" });
        }
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEducation((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");
        setPasswordLoading(true);

        if (!currentPassword.trim()) {
            setPasswordError("Current password is required.");
            setPasswordLoading(false);
            return;
        }

        if (!newPassword.trim()) {
            setPasswordError("New password is required.");
            setPasswordLoading(false);
            return;
        }

        if (newPassword.trim() !== confirmPassword.trim()) {
            setPasswordError("New passwords do not match.");
            setPasswordLoading(false);
            return;
        }

        if (newPassword.trim().length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            setPasswordLoading(false);
            return;
        }

        if (newPassword.trim() === currentPassword.trim()) {
            setPasswordError("New password must be different from current password.");
            setPasswordLoading(false);
            return;
        }

        try {
            await updateUserPassword!(currentPassword, newPassword);
            setPasswordSuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } catch (err: any) {
            setPasswordError(err.message || "Failed to update password.");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                            <CardDescription>Tell us a bit about yourself</CardDescription>
                            {error && <CardDescription className="text-red-500 mt-2">{error}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            onChange={e => setFirstName(e.target.value)}
                                            id="firstName"
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            onChange={e => setLastName(e.target.value)}
                                            id="lastName"
                                            placeholder="Enter your last name"
                                            type="text"
                                            required
                                            value={lastName}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="birthday">Birthday</Label>
                                        <Input
                                            onChange={e => setBirthday(e.target.value)}
                                            id="birthday"
                                            type="date"
                                            required
                                            value={birthday}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="summary">What do you do?</Label>
                                        <Textarea
                                            onChange={e => setSummary(e.target.value)}
                                            id="summary"
                                            placeholder="Tell us about your profession, skills, or interests..."
                                            required
                                            value={summary}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Education (Optional)</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input 
                                                name="degree" 
                                                value={newEducation.degree} 
                                                onChange={handleEducationChange} 
                                                placeholder="Degree" 
                                            />
                                            <Input
                                                name="institution"
                                                value={newEducation.institution}
                                                onChange={handleEducationChange}
                                                placeholder="Institution"
                                            />
                                            <div className="flex gap-2">
                                                <Input 
                                                    name="year" 
                                                    value={newEducation.year} 
                                                    onChange={handleEducationChange} 
                                                    placeholder="Year" 
                                                />
                                                <Button 
                                                    type="button" 
                                                    onClick={addEducation} 
                                                    size="sm"
                                                    disabled={!newEducation.degree || !newEducation.institution || !newEducation.year}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {education.length > 0 && (
                                            <div className="space-y-2">
                                                {education.map((edu, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                                                    >
                                                        <div>
                                                            <span className="font-medium">{edu.degree}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {" "}
                                                                • {edu.institution}, {edu.year}
                                                            </span>
                                                        </div>
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => removeEducation(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Change Section */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-lg font-medium">Security</h3>
                                        {!showPasswordForm ? (
                                            <Button 
                                                onClick={() => setShowPasswordForm(true)}
                                                variant="outline"
                                                className="w-full"
                                                type="button"
                                            >
                                                Change Password
                                            </Button>
                                        ) : (
                                            <div className="space-y-4">
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
                                                {passwordError && (
                                                    <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                                                        {passwordError}
                                                    </div>
                                                )}
                                                {passwordSuccess && (
                                                    <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">
                                                        {passwordSuccess}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button 
                                                        onClick={handlePasswordChange}
                                                        disabled={passwordLoading}
                                                        className="flex-1"
                                                        type="button"
                                                    >
                                                        {passwordLoading ? "Updating..." : "Update Password"}
                                                    </Button>
                                                    <Button 
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowPasswordForm(false);
                                                            setCurrentPassword("");
                                                            setNewPassword("");
                                                            setConfirmPassword("");
                                                            setPasswordError("");
                                                            setPasswordSuccess("");
                                                        }}
                                                        className="flex-1"
                                                        type="button"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Complete Profile"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => router.push("/")}
                                        type="button"
                                    >
                                        Skip for Now
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
