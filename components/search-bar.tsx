"use client"

import type React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchBarProps {
    onSearch: (term: string) => void;
    searchTerm: string;
    placeholder?: string;
    inverted?: boolean;
}

export function SearchBar({ onSearch, searchTerm, placeholder, inverted }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(searchTerm);

    // Update local state when prop changes
    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        // Perform search as user types (debounce could be added for performance)
        onSearch(value);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(inputValue);
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex w-full items-center" role="search">
            <div className="relative w-full">
                <Label htmlFor="search-input" className="sr-only">
                    Search users by name, email, bio, role, or education
                </Label>
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    inverted ? "!text-white" : "text-muted-foreground"
                }`} aria-hidden="true" />
                <Input
                    id="search-input"
                    className={`w-full pl-10 pr-4 py-6 text-base shadow-lg rounded-full ${
                        inverted 
                            ? "!bg-gray-800 !text-white !border-gray-600 !placeholder:text-gray-400" 
                            : "border-muted-foreground/20"
                    }`}
                    placeholder={placeholder || "Quick search by name, email, bio, role, or education..."}
                    value={inputValue}
                    onChange={handleInputChange}
                    aria-label="Search users"
                    aria-describedby="search-description"
                    autoComplete="off"
                    spellCheck="false"
                />
                <div id="search-description" className="sr-only">
                    Enter search terms to find users by name, email, bio, role, or education. Results update automatically as you type.
                </div>
            </div>
        </form>
    )
}
