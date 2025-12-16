"use client"

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User, Education } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus } from "lucide-react";

type UserFormProps = {
    user?: User;
    onSubmit: (user: User) => void;
}

export function UserForm({ user, onSubmit }: UserFormProps) {
    const predefinedRoles = [
        "Judge",
        "Advisor",
        "Alumni",
        "Student",
    ];

    const [formData, setFormData] = useState<Partial<User>>(
        user || {
            name: "",
            email: "",
            avatar: "",
            bio: "",
            education: [],
            roles: [],
        },
    );
    const [newRole, setNewRole] = useState("");
    const [newEducation, setNewEducation] = useState<Partial<Education>>({
        degree: "",
        institution: "",
        year: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            });
        }
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            });
        }
    }

    const toggleRole = (role: string) => {
        setFormData((prev) => {
            const current = prev.roles || [];
            if (current.includes(role)) {
                return { ...prev, roles: current.filter((r) => r !== role) };
            } else {
                return { ...prev, roles: [...current, role] };
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

    const removeRole = (roleToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles?.filter((role) => role !== roleToRemove),
        }));
    }

    const addEducation = () => {
        if (newEducation.degree && newEducation.institution && newEducation.year) {
            setFormData((prev) => ({
                ...prev,
                education: [...(prev.education || []), newEducation as Education],
            }));
            setNewEducation({ degree: "", institution: "", year: "" });
        }
    }

    const removeEducation = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            education: prev.education?.filter((_, i) => i !== index),
        }));
    }

    const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEducation((prev) => ({ ...prev, [name]: value }));
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) newErrors.name = "Name is required";
        if (!formData.email?.trim()) newErrors.email = "Email is required";

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData as User);
        }
    }

    return (
        <ScrollArea className="max-h-[80vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleChange} rows={3} />
                </div>

                <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {predefinedRoles.map((role) => (
                            <div key={role} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`role-${role}`}
                                    checked={formData.roles?.includes(role) ?? false}
                                    onCheckedChange={() => toggleRole(role)}
                                />
                                <Label htmlFor={`role-${role}`} className="text-sm font-normal">
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
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomRole();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addCustomRole} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {(formData.roles && formData.roles.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.roles.map((role, index) => (
                                <Badge key={index} variant="secondary" className="gap-1">
                                    {role}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeRole(role)} />
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Education</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Input name="degree" value={newEducation.degree} onChange={handleEducationChange} placeholder="Degree" />
                        <Input
                            name="institution"
                            value={newEducation.institution}
                            onChange={handleEducationChange}
                            placeholder="Institution"
                        />
                        <div className="flex gap-2">
                            <Input name="year" value={newEducation.year} onChange={handleEducationChange} placeholder="Year" />
                            <Button type="button" onClick={addEducation} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
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
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit">Save User</Button>
                </DialogFooter>
            </form>
        </ScrollArea>
    )
;
}
