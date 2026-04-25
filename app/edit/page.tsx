"use client"

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, X, Trash2, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth";
import type { User, Education } from "@/lib/types";
import { db } from "@/lib/firebase";

export default function EditProfilePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const router = useRouter();
    const { user: authUser, deleteAccount } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const resolvedSearchParams = use(searchParams);
    
    const targetUserId = resolvedSearchParams?.id || authUser?.uid;
    
    const predefinedRoles = [
        "STEM Fair Judge",
        "Project Advisor",
        "Alumni",
        "Student",
        "Community Service",
        "Guest Speaker",
        "Internship",
        "Physical Education",
    ];

    const expertiseList = [
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

    const [formData, setFormData] = useState<Partial<User>>({
        avatar: "",
        bio: "",
        education: [],
        roles: [],
    });
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    
    const [newRole, setNewRole] = useState("");
    const [newExpertise, setNewExpertise] = useState("");
    const [universities, setUniversities] = useState<string[]>([]);
    const [newEducation, setNewEducation] = useState<Partial<Education>>({
        degree: "",
        institution: "",
        year: "",
    });

    useEffect(() => {
        if (!authUser?.uid) {
            router.push("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                if (!targetUserId) return;
                
                const userDoc = await getDoc(doc(db, "users", targetUserId));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                    setUser(userData);
                    const nameParts = (userData.name || "").split(" ");
                    const first = nameParts[0] || "";
                    const last = nameParts.slice(1).join(" ") || "";
                    
                    setFirstName(first);
                    setLastName(last);
                    
                    setFormData({
                        email: userData.email || "",
                        avatar: userData.avatar || "",
                        bio: userData.bio || "",
                        education: userData.education || [],
                        roles: userData.roles || [],
                    });
                } else {
                    setFormData(prev => ({ ...prev, email: authUser.email || "" }));
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [authUser?.uid, targetUserId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const toggleRole = (role: string) => {
        setFormData((prev) => {
            const currentRoles = prev.roles || [];
            
            if (currentRoles.includes(role)) {
                return { 
                    ...prev, 
                    roles: currentRoles.filter((r) => r !== role)
                };
            } else {
                return { 
                    ...prev, 
                    roles: [...currentRoles, role]
                };
            }
        });
    };

    const toggleExpertise = (expertise: string) => {
        setFormData((prev) => {
            const currentRoles = prev.roles || [];
            
            if (currentRoles.includes(expertise)) {
                return { 
                    ...prev, 
                    roles: currentRoles.filter((r) => r !== expertise)
                };
            } else {
                return { 
                    ...prev, 
                    roles: [...currentRoles, expertise]
                };
            }
        });
    };

    const addCustomRole = () => {
        if (newRole.trim() && !formData.roles?.includes(newRole.trim())) {
            setFormData((prev) => ({
                ...prev,
                roles: [...(prev.roles || []), newRole.trim()],
            }));
            setNewRole("");
        }
    };

    const addCustomExpertise = () => {
        if (newExpertise.trim() && !formData.roles?.includes(newExpertise.trim())) {
            setFormData((prev) => ({
                ...prev,
                roles: [...(prev.roles || []), newExpertise.trim()],
            }));
            setNewExpertise("");
        }
    };

    const addEducation = () => {
        if (newEducation.degree && newEducation.institution && newEducation.year) {
            setFormData((prev) => ({
                ...prev,
                education: [...(prev.education || []), newEducation as Education],
            }));
            setNewEducation({ degree: "", institution: "", year: "" });
        }
    };

    const removeEducation = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            education: prev.education?.filter((_, i) => i !== index),
        }));
    };

    const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEducation((prev) => ({ ...prev, [name]: value }));
    };


    useEffect(() => {
        const loadUniversities = async () => {
            try {
                // This would typically fetch from a universities collection
                // For now, we'll use some default universities
                const defaultUniversities = [
                    "Harvard University",
                    "Stanford University", 
                    "MIT",
                    "University of California Berkeley",
                    "Yale University",
                    "Princeton University",
                    "Columbia University",
                    "University of Oxford",
                    "Cambridge University"
                ];
                setUniversities(defaultUniversities);
            } catch (error) {
                console.error("Error loading universities:", error);
            }
        };
        
        loadUniversities();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!firstName?.trim() || !lastName?.trim()) newErrors.name = "First and last name are required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !authUser?.uid || !targetUserId) {
            return;
        }

        setSaving(true);
        
        try {
            const userData: Partial<User> = {
                ...formData,
                name: `${firstName.trim()} ${lastName.trim()}`,
                updatedAt: new Date().toISOString(),
            };

            if (!user?.createdAt) {
                userData.createdAt = new Date().toISOString();
            }

            await setDoc(doc(db, "users", targetUserId), userData, { merge: true });
            setUser({ ...(user || {}), ...userData } as User);
            
            router.push(`/users/${targetUserId}`);
        } catch (error) {
            console.error("Error saving profile:", error);
            setErrors({ submit: "Failed to save profile. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!authUser?.uid || !targetUserId) {
            return;
        }
        
        if (authUser.uid !== targetUserId) {
            setErrors({ submit: "You can only delete your own account." });
            return;
        }

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

    const canDeleteProfile = authUser?.uid === targetUserId;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!authUser) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-muted-foreground">Please log in to edit your profile.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="pl-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.submit && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md">
                                {errors.submit}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={errors.name ? "border-red-500" : ""}
                                    disabled={saving}
                                    placeholder="Enter your first name"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={errors.name ? "border-red-500" : ""}
                                    disabled={saving}
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input
                                id="avatar"
                                name="avatar"
                                type="url"
                                value={formData.avatar || ""}
                                onChange={handleChange}
                                placeholder="https://example.com/avatar.jpg"
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio || ""}
                                onChange={handleChange}
                                rows={4}
                                disabled={saving}
                            />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {predefinedRoles.map((role) => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={formData.roles?.includes(role) ?? false}
                                            onCheckedChange={() => toggleRole(role)}
                                            disabled={saving}
                                        />
                                        <Label htmlFor={`role-${role}`} className="text-sm font-normal cursor-pointer">
                                            {role}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label className="text-sm font-normal">Add custom role</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        placeholder="Enter custom role"
                                        disabled={saving}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCustomRole();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addCustomRole} size="sm" disabled={saving}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Areas of Expertise</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {expertiseList.map((expertise) => (
                                    <div key={expertise} className="flex items-center space-x-2 p-2 rounded-lg border border-muted hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id={`expertise-${expertise}`}
                                            checked={formData.roles?.includes(expertise) ?? false}
                                            onCheckedChange={() => toggleExpertise(expertise)}
                                            disabled={saving}
                                        />
                                        <Label htmlFor={`expertise-${expertise}`} className="text-sm font-medium cursor-pointer">
                                            {expertise}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label className="text-sm font-normal">Add custom expertise</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newExpertise}
                                        onChange={(e) => setNewExpertise(e.target.value)}
                                        placeholder="Enter custom expertise"
                                        disabled={saving}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCustomExpertise();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addCustomExpertise} size="sm" disabled={saving}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Education</Label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <Input
                                    name="degree"
                                    value={newEducation.degree}
                                    onChange={handleEducationChange}
                                    placeholder="Degree"
                                    disabled={saving}
                                />
                                <Select 
                                    value={newEducation.institution} 
                                    onValueChange={(value) => setNewEducation(prev => ({ ...prev, institution: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select university" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {universities.map((university, index) => (
                                            <SelectItem key={index} value={university}>
                                                {university}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="year"
                                    value={newEducation.year}
                                    onChange={handleEducationChange}
                                    placeholder="Year"
                                    disabled={saving}
                                />
                                <Button type="button" onClick={addEducation} size="sm" disabled={saving}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2 mt-2">
                                {formData.education?.map((edu, index) => (
                                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
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
                                            disabled={saving}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <div className="flex gap-4">
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Profile"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                            </div>

                            {canDeleteProfile && (
                                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                    <DialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={saving}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-destructive" />
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
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}