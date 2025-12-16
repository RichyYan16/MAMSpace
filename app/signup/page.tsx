"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import type { Education } from "@/lib/types";
import { X, Plus } from "lucide-react";

export default function Page() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [education, setEducation] = useState<Education[]>([]);
    const [newEducation, setNewEducation] = useState<Partial<Education>>({
        degree: "",
        institution: "",
        year: "",
    });
    const [error, setError] = useState("");
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const predefinedExpertise = [
        "Biology",
        "Chemistry",
        "Computer Science",
        "Engineering",
        "Foreign Language",
        "Government Relations",
        "Humanities",
        "Mathematics",
        "Physics"
    ];

    const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);

    const toggleExpertise = (expertise: string) => {
        if (selectedExpertise.includes(expertise)) {
            setSelectedExpertise(selectedExpertise.filter((e) => e !== expertise));
        } else {
            setSelectedExpertise([...selectedExpertise, expertise]);
        }
    };

    useEffect(() => {
        if (user?.uid) {
            router.push("/");
        }
    }, [user?.uid, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !confirmPassword || !firstName.trim() || !lastName.trim()) {
            setError("Please fill out all required fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setIsLoading(true);

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            const userData = {
                uid: userId,
                email: email,
                name: `${firstName.trim()} ${lastName.trim()}`,
                bio: bio.trim(),
                education,
                roles: selectedExpertise,
                role: "user",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                emailVerified: false,
                photoURL: ""
            };

            console.log("Signup - Saving user data:", userData);
            console.log("Signup - Education being saved:", userData.education);

            await setDoc(doc(db, "users", userId), userData, { merge: true });

            await updateProfile(userCredential.user, {
                displayName: `${firstName.trim()} ${lastName.trim()}`
            });

            try {
                const functions = getFunctions(getApp());
                const sendWelcomeEmail = httpsCallable(functions, "sendWelcomeEmail");
                await sendWelcomeEmail({
                    email: email,
                    name: name.trim(),
                    appUrl: window.location.origin
                });
            } catch (err) {
                console.error("Error sending welcome email:", err);
            }

            toast({
                title: "Account Created",
                description: "Your account has been created successfully!",
                variant: "default",
            });

            router.push("/");
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Failed to sign up. Please try again.");
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

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Your Account</CardTitle>
                        <CardDescription>
                            Join our community by filling out the form below
                        </CardDescription>
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Enter your first name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Enter your last name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">About You</Label>
                                    <Textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us a bit about yourself..."
                                        rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This will be visible on your public profile
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <Label>Education (Optional)</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            name="degree"
                                            value={newEducation.degree}
                                            onChange={handleEducationChange}
                                            placeholder="Degree"
                                            disabled={isLoading}
                                        />
                                        <Input
                                            name="institution"
                                            value={newEducation.institution}
                                            onChange={handleEducationChange}
                                            placeholder="Institution"
                                            disabled={isLoading}
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                name="year"
                                                value={newEducation.year}
                                                onChange={handleEducationChange}
                                                placeholder="Year"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                onClick={addEducation}
                                                size="sm"
                                                disabled={isLoading || !newEducation.degree || !newEducation.institution || !newEducation.year}
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
                                                        disabled={isLoading}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <Separator className="my-6" />
                                <div className="space-y-2">
                                    <Label>Roles</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {["STEM Fair Judge", "Project Advisor", "Alumni", "Student", "Community Service", "Guest Speaker", "Internship", "Physical Education"].map((role) => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role}`}
                                                    checked={selectedExpertise.includes(role)}
                                                    onCheckedChange={() => toggleExpertise(role)}
                                                    disabled={isLoading}
                                                />
                                                <Label htmlFor={`role-${role}`} className="text-sm font-normal cursor-pointer">
                                                    {role}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold">Areas of Expertise</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Select your areas of expertise (optional)
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {predefinedExpertise.map((expertise) => (
                                            <div key={expertise} className="flex items-center space-x-2 p-2 rounded-lg border border-muted hover:bg-muted/50 transition-colors">
                                                <Checkbox
                                                    id={`expertise-${expertise}`}
                                                    checked={selectedExpertise.includes(expertise)}
                                                    onCheckedChange={() => toggleExpertise(expertise)}
                                                    disabled={isLoading}
                                                />
                                                <Label 
                                                    htmlFor={`expertise-${expertise}`} 
                                                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                                                >
                                                    <Badge variant="outline">{expertise}</Badge>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 mt-6">
                                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                        type="button"
                                        onClick={() => router.push("/")}
                                    >
                                        Back to Home
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{' '}
                    <button 
                        onClick={() => router.push('/login')} 
                        className="text-primary hover:underline"
                    >
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}