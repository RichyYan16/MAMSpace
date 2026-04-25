"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { User } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useDebounce } from "@/hooks/useDebounce";
import { useUniversities } from "@/hooks/useUniversities";

export default function TagPage() {
    const router = useRouter();
    const params = useParams();
    const encodedTag = params.tag as string;
    const tag = decodeURIComponent(encodedTag);
    
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { universities } = useUniversities();

    useEffect(() => {
        const fetchUsers = async () => {
            try { 
                const usersCollection = collection(db, "users");
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data() 
                })) as User[];
                
                // Filter users who have the specific tag 
                const usersWithTag = usersList.filter(user => 
                    user.roles?.includes(tag) || user.expertises?.includes(tag)
                );
                
                setUsers(usersWithTag);
                setFilteredUsers(usersWithTag);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [tag]);

    // Filter users based on search term
    useEffect(() => {
        if (!debouncedSearchTerm.trim()) {
            setFilteredUsers(users);
            return;
        }

        const normalizedTerm = debouncedSearchTerm.toLowerCase().trim();
        const filtered = users.filter(user => {
            const nameMatch = user.name?.toLowerCase().includes(normalizedTerm) ?? false;
            const emailMatch = user.email?.toLowerCase().includes(normalizedTerm) ?? false;
            const bioMatch = user.bio?.toLowerCase().includes(normalizedTerm) ?? false;

            const educationMatch = user.education?.some(
                (edu) => {
                    const degreeMatch = edu.degree?.toLowerCase().includes(normalizedTerm) ?? false;
                    const institutionMatch = edu.institution?.toLowerCase().includes(normalizedTerm) ?? false;
                    
                    const universityMatch = universities.some(university => 
                        university.toLowerCase().includes(normalizedTerm) &&
                        edu.institution?.toLowerCase().includes(university.toLowerCase().split(' ')[0])
                    ) ?? false;
                    
                    return degreeMatch || institutionMatch || universityMatch;
                }
            ) ?? false;

            const rolesMatch = user.roles?.some((role) => role.toLowerCase().includes(normalizedTerm)) ?? false;
            const expertisesMatch = user.expertises?.some((expertise) => expertise.toLowerCase().includes(normalizedTerm)) ?? false;

            return (
                nameMatch ||
                emailMatch ||
                bioMatch ||
                educationMatch ||
                rolesMatch ||
                expertisesMatch
            );
        });

        setFilteredUsers(filtered);
    }, [users, debouncedSearchTerm, universities]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="pl-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                    Users with tag: <span className="text-primary">#{tag}</span>
                </h1>
                <p className="text-muted-foreground">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                </p>
            </div>

            <div className="mb-6">
                <SearchBar
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    placeholder={`Search users with #${tag}...`}
                />
            </div>

            {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No users found</h3>
                    <p className="text-muted-foreground">
                        {searchTerm ? `No users match "${searchTerm}"` : `No users have the tag "${tag}"`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <UserCard key={user.uid ?? user.id ?? user.email} user={user} searchTerm={searchTerm} />
                    ))}
                </div>
            )}
        </div>
    );
}
