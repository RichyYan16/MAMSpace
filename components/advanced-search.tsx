"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Filter } from "lucide-react";
import type { User } from "@/lib/types";

interface SearchFilter {
    attribute: string;
    value: string;
    selectedRoles?: string[];
    roleSearchTerm?: string;
    expertiseSearchTerm?: string;
}

interface AdvancedSearchProps {
    onSearch: (results: User[]) => void;
    users: User[];
    onClose: () => void;
    inverted?: boolean;
}

export function AdvancedSearch({ onSearch, users, onClose, inverted = false }: AdvancedSearchProps) {
    const [filters, setFilters] = useState<SearchFilter[]>([{ attribute: "name", value: "" }]);

    // Predefined expertise options
    const expertiseOptions = [
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

    // Predefined roles
    const predefinedRoles = [
        "Judge",
        "Advisor",
        "Alumni",
        "Student",
        "Community Service",
        "Guest Speaker",
        "Internship",
        "Physical Education",
    ];

    const attributeOptions = [
        { value: "name", label: "Name" },
        { value: "email", label: "Email" },
        { value: "bio", label: "Bio" },
        { value: "role", label: "Role" },
        { value: "education", label: "Education" },
        { value: "expertise", label: "Expertise" }
    ];

    const addFilter = () => {
        setFilters([...filters, { attribute: "name", value: "" }]);
    };

    const removeFilter = (index: number) => {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters.length > 0 ? newFilters : [{ attribute: "name", value: "" }]);
    };

    const updateFilter = (index: number, field: "attribute" | "value", value: string) => {
        const newFilters = [...filters];
        newFilters[index][field] = value;
        setFilters(newFilters);
    };

    const updateSelectedRoles = (index: number, roles: string[]) => {
        const newFilters = [...filters];
        newFilters[index].selectedRoles = roles;
        setFilters(newFilters);
    };

    const updateRoleSearchTerm = (index: number, term: string) => {
        const newFilters = [...filters];
        newFilters[index].roleSearchTerm = term;
        setFilters(newFilters);
    };

    const updateExpertiseSearchTerm = (index: number, term: string) => {
        const newFilters = [...filters];
        newFilters[index].expertiseSearchTerm = term;
        setFilters(newFilters);
    };

    const performSearch = () => {
        if (!filters.some(f => f.value.trim() || (f.selectedRoles && f.selectedRoles.length > 0))) {
            onSearch(users);
            return;
        }

        const filteredUsers = users.filter(user => {
            return filters.every(filter => {
                // Handle role with checklist
                if (filter.attribute === "role") {
                    console.log('Role filter - selectedRoles:', filter.selectedRoles);
                    console.log('Role filter - user.roles:', user.roles);
                    if (!filter.selectedRoles || filter.selectedRoles.length === 0) {
                        console.log('Role filter - no roles selected, returning true');
                        return true;
                    }
                    const hasRole = filter.selectedRoles.some(selectedRole => 
                        user.roles?.includes(selectedRole)
                    );
                    console.log('Role filter - user has role:', hasRole);
                    return hasRole;
                }

                // Handle expertise with checklist
                if (filter.attribute === "expertise") {
                    if (!filter.selectedRoles || filter.selectedRoles.length === 0) return true;
                    return filter.selectedRoles.some(selectedRole => 
                        user.roles?.includes(selectedRole)
                    );
                }

                // Handle regular text search for other fields
                if (!filter.value.trim()) return true;

                const searchValue = filter.value.toLowerCase().trim();

                switch (filter.attribute) {
                    case "name":
                        return user.name?.toLowerCase().includes(searchValue) ?? false;
                    case "email":
                        return user.email?.toLowerCase().includes(searchValue) ?? false;
                    case "bio":
                        return user.bio?.toLowerCase().includes(searchValue) ?? false;
                    case "education":
                        return user.education?.some(
                            edu => edu.degree?.toLowerCase().includes(searchValue) ||
                                   edu.institution?.toLowerCase().includes(searchValue) ||
                                   edu.year?.toLowerCase().includes(searchValue)
                        ) ?? false;
                    default:
                        return false;
                }
            });
        });

        onSearch(filteredUsers);
    };

    const clearSearch = () => {
        setFilters([{ attribute: "name", value: "", selectedRoles: [] }]);
        onSearch(users);
    };

    return (
        <Card className={`w-full max-w-2xl mx-auto ${
            inverted ? "!bg-gray-800 !border-gray-600" : ""
        }`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Advanced Search
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {filters.map((filter, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-center">
                            <Select
                                value={filter.attribute}
                                onValueChange={(value) => updateFilter(index, "attribute", value)}
                            >
                                <SelectTrigger className={`w-[180px] ${
                                    inverted ? "!bg-gray-700 !text-white !border-gray-600" : ""
                                }`}>
                                    <SelectValue placeholder="Select attribute" className={
                                        inverted ? "!text-white" : ""
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {attributeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {filter.attribute === "role" ? (
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground mb-2">Select role:</div>
                                    <Input
                                        placeholder="Search roles..."
                                        value={filter.roleSearchTerm || ""}
                                        onChange={(e) => updateRoleSearchTerm(index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {predefinedRoles
                                            .filter(role => 
                                                !filter.roleSearchTerm || 
                                                role.toLowerCase().includes(filter.roleSearchTerm.toLowerCase())
                                            )
                                            .map(role => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${index}-${role}`}
                                                    checked={filter.selectedRoles?.includes(role) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentRoles = filter.selectedRoles || [];
                                                        const newRoles = checked 
                                                            ? [...currentRoles, role]
                                                            : currentRoles.filter(r => r !== role);
                                                        updateSelectedRoles(index, newRoles);
                                                    }}
                                                />
                                                <label 
                                                    htmlFor={`role-${index}-${role}`}
                                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                                                        inverted ? "!text-gray-300" : ""
                                                    }`}
                                                >
                                                    {role}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : filter.attribute === "expertise" ? (
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground mb-2">Select expertise:</div>
                                    <Input
                                        placeholder="Search expertise..."
                                        value={filter.expertiseSearchTerm || ""}
                                        onChange={(e) => updateExpertiseSearchTerm(index, e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {expertiseOptions
                                            .filter(skill => 
                                                !filter.expertiseSearchTerm || 
                                                skill.toLowerCase().includes(filter.expertiseSearchTerm.toLowerCase())
                                            )
                                            .map(skill => (
                                            <div key={skill} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`skill-${index}-${skill}`}
                                                    checked={filter.selectedRoles?.includes(skill) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentRoles = filter.selectedRoles || [];
                                                        const newRoles = checked 
                                                            ? [...currentRoles, skill]
                                                            : currentRoles.filter(r => r !== skill);
                                                        updateSelectedRoles(index, newRoles);
                                                    }}
                                                />
                                                <label 
                                                    htmlFor={`skill-${index}-${skill}`}
                                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                                                        inverted ? "!text-gray-300" : ""
                                                    }`}
                                                >
                                                    {skill}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : filter.attribute === "roles" ? (
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground mb-2">Select roles:</div>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {predefinedRoles.map(role => (
                                            <div key={role} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${index}-${role}`}
                                                    checked={filter.selectedRoles?.includes(role) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentRoles = filter.selectedRoles || [];
                                                        const newRoles = checked 
                                                            ? [...currentRoles, role]
                                                            : currentRoles.filter(r => r !== role);
                                                        updateSelectedRoles(index, newRoles);
                                                    }}
                                                />
                                                <label 
                                                    htmlFor={`role-${index}-${role}`}
                                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                                                        inverted ? "!text-gray-300" : ""
                                                    }`}
                                                >
                                                    {role}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Input
                                    placeholder={`Search by ${filter.attribute}...`}
                                    value={filter.value}
                                    onChange={(e) => updateFilter(index, "value", e.target.value)}
                                    className={`flex-1 ${
                                        inverted ? "!bg-gray-700 !text-white !border-gray-600 !placeholder:text-gray-400" : ""
                                    }`}
                                />
                            )}

                            {filters.length > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFilter(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex gap-2 pt-4">
                    <Button onClick={addFilter} variant="outline" className="flex-1">
                        Add Filter
                    </Button>
                    <Button onClick={performSearch} className="flex-1">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                    <Button onClick={clearSearch} variant="outline">
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
