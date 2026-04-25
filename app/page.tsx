"use client"

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { UserCard } from "@/components/user-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/user-management";
import { AdvancedSearch } from "@/components/advanced-search";
import type { User } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Filter, X, Tag, Search, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Page() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [searchResults, setSearchResults] = useState(users);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [isAdvancedSearchActive, setIsAdvancedSearchActive] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const { user: authUser, logOut } = useAuth();
    const isAdmin = authUser?.role === "admin";
    const router = useRouter();
    const searchParams = useSearchParams();
    
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const tagParam = searchParams.get('tag');
        if (tagParam) {
            setActiveTag(decodeURIComponent(tagParam));
        }
    }, [searchParams]);


    useEffect(() => {
        if (authUser?.uid && users.length > 0) {
            const foundUser = users.find(user => user.email === authUser.email);
            
            if (foundUser) {
                setCurrentUser(foundUser);
            }
        }
    }, [authUser?.uid, authUser?.email, users]);

    useEffect(() => {
        const q = query(
            collection(db, "users"),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map((doc) => {
                const data = doc.data() as User;
                return {
                    ...data,
                    uid: data.uid || doc.id,
                };
            });

            setUsers(users);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    
    const filteredUsers = useMemo(() => {
        let usersToFilter = users;
        
        
        if (activeTag) {
            usersToFilter = users.filter(user => 
                user.roles?.includes(activeTag) || user.expertises?.includes(activeTag)
            );
        }

        if (!debouncedSearchTerm.trim()) {
            return usersToFilter;
        }

        const normalizedTerm = debouncedSearchTerm.toLowerCase().trim();
        const tags = Array.from(
            debouncedSearchTerm.trim().matchAll(/(\s|^)@\w+(?=\s|$)/g),
            (match) => match[0].trim(),
        );

        return usersToFilter.filter((user) => {
            const nameMatch = user.name?.toLowerCase().includes(normalizedTerm) ?? false;
            const emailMatch = user.email?.toLowerCase().includes(normalizedTerm) ?? false;
            const bioMatch = user.bio?.toLowerCase().includes(normalizedTerm) ?? false;

            const educationMatch = user.education?.some(
                (edu) => {
                    const degreeMatch = edu.degree?.toLowerCase().includes(normalizedTerm) ?? false;
                    const institutionMatch = edu.institution?.toLowerCase().includes(normalizedTerm) ?? false;
                    return degreeMatch || institutionMatch;
                }
            ) ?? false;

            const rolesMatch = user.roles?.some((role) => role.toLowerCase().includes(normalizedTerm)) ?? false;
            const tagsMatch = user.roles?.some((role) => tags.includes("@" + role)) ?? false;

            return (
                nameMatch ||
                emailMatch ||
                bioMatch ||
                educationMatch ||
                rolesMatch ||
                tagsMatch
            );
        });
    }, [users, debouncedSearchTerm, activeTag]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        setSearching(true);
        
        setTimeout(() => setSearching(false), 300);
        
        if (!term.trim()) {
            setSearchResults(filteredUsers);
        } else {
            setSearchResults(filteredUsers);
        }
    }, [filteredUsers]);

    const handleAdvancedSearch = useCallback((results: User[]) => {
        setSearchResults(results);
        setIsAdvancedSearchActive(true);
        setSearching(false);
    }, []);

    const exitAdvancedSearch = useCallback(() => {
        setIsAdvancedSearchActive(false);
        setSearchResults(users);
    }, [users]);

    const handleTagClick = (tag: string) => {
        const url = new URL('/', window.location.origin);
        url.searchParams.set('tag', encodeURIComponent(tag));
        window.history.replaceState({}, '', url.toString());
    }

    const addUser = (newUser: User) => {
        if (!isAdmin) {
            return;
        }

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setSearchResults(updatedUsers);

        const docId = newUser.uid ?? (newUser.id?.toString() ?? undefined);
        if (docId) {
            setDoc(doc(db, "users", docId), newUser);
        }
    }

    const updateUser = (updatedUser: User) => {
        const isSelf =
            (!!authUser?.uid && updatedUser.uid === authUser.uid) ||
            (!!authUser?.email && updatedUser.email === authUser.email);
        if (!isAdmin && !isSelf) {
            return;
        }

        const updatedUsers = users.map((userItem) => {
            if (updatedUser.uid && userItem.uid === updatedUser.uid) {
                return updatedUser;
            }
            if (typeof updatedUser.id === "number" && userItem.id === updatedUser.id) {
                return updatedUser;
            }
            return userItem;
        });
        setUsers(updatedUsers);
        setSearchResults(updatedUsers);

        const docId =
            updatedUser.uid ??
            (typeof updatedUser.id === "number" ? updatedUser.id.toString() : undefined);
        if (!docId) {
            return;
        }

        setDoc(doc(db, "users", docId), updatedUser);
    }

    const deleteUser = (userId: number | string) => {
        if (!isAdmin) {
            return;
        }

        const updatedUsers = users.filter((user) => {
            if (typeof userId === "number") {
                return user.id !== userId;
            } else {
                return user.uid !== userId;
            }
        });
        setUsers(updatedUsers);
        setSearchResults(updatedUsers);

        deleteDoc(doc(db, "users", userId.toString()));
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="flex flex-row mb-8 justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Welcome {(currentUser?.name || authUser?.name || authUser?.email?.split('@')[0] || 'Guest').split(' ')[0]}</h1>
                    <p className="text-muted-foreground">Find the people you need in our community.</p>
                </div>
                <div className="flex gap-2">
                    <ThemeToggle />
                    {authUser?.uid && (
                        <>
                            <Link href="/settings">
                                <Button variant="outline">Settings</Button>
                            </Link>
                        </>
                    )}
                    {!authUser?.uid && (
                        <Link href="/signup" className="mr-4">
                            <Button>Sign Up</Button>
                        </Link>
                    )}
                    {authUser?.uid ? (
                        <Button onClick={() => logOut!()}>Log Out</Button>
                    ) : (
                        <Link href="/login" className="mr-4">
                            <Button>Login</Button>
                        </Link>
                    )}
                </div>
            </header>

            <Tabs defaultValue="view" className="w-full">
                {isAdmin && (
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                        <TabsTrigger value="view">View Users</TabsTrigger>
                        <TabsTrigger value="manage">Manage Users</TabsTrigger>
                    </TabsList>
                )}

                <TabsContent value="view" className="mt-0">
                    {(searchTerm || isAdvancedSearchActive) ? (
                        <div className="mb-4">
                            {isAdvancedSearchActive && (
                                <div className="flex items-center justify-between bg-muted p-3 rounded-lg mb-4">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <span className="text-sm font-medium">Advanced Search Results</span>
                                        <span className="text-xs text-muted-foreground">
                                            {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={exitAdvancedSearch}
                                        className="h-8"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Exit Search
                                    </Button>
                                </div>
                            )}
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8" style={{ alignItems: 'start' }}>
                                    {(() => {
                                        if (authUser?.uid) {
                                            const currentUserInResults = searchResults.find(user => 
                                                user.uid === authUser.uid || user.email === authUser.email
                                            );
                                            
                                            const orderedResults = [
                                                ...searchResults.filter(user => 
                                                    user.uid === authUser.uid || user.email === authUser.email
                                                ),
                                                ...searchResults.filter(user => 
                                                    user.uid !== authUser.uid && user.email !== authUser.email
                                                )
                                            ];
                                            
                                            return orderedResults.map((user, index) => (
                                                <UserCard 
                                                    key={user.uid ?? user.id ?? user.email ?? index}
                                                    user={{
                                                        ...user,
                                                        name: user.name || (user.uid === authUser.uid ? authUser.name : '') || user.name || 'User'
                                                    }}
                                                    searchTerm={searchTerm}
                                                />
                                            ));
                                        } else {
                                            return searchResults.map((user, index) => (
                                                <UserCard 
                                                    key={user.uid ?? user.id ?? user.email ?? index}
                                                    user={{
                                                        ...user,
                                                        name: user.name || 'User'
                                                    }}
                                                    searchTerm={searchTerm}
                                                />
                                            ));
                                        }
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2">No users found</h2>
                                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                        No users match your search criteria. Try adjusting your filters or search terms.
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setActiveTag(null);
                                                setIsAdvancedSearchActive(false);
                                                setSearchResults(users);
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                        {isAdvancedSearchActive && (
                                            <Button
                                                variant="outline"
                                                onClick={exitAdvancedSearch}
                                            >
                                                Exit Advanced Search
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="space-y-3">
                                    <Skeleton className="h-48 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No users in database</h2>
                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                The user database is currently empty. Be the first to join the community!
                            </p>
                            {!authUser?.uid && (
                                <Link href="/signup">
                                    <Button>Sign Up to Join</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8" style={{ alignItems: 'start' }}>
                            {(() => {
                                if (authUser?.uid) {
                                    const currentUserInUsers = users.find(user => 
                                        user.uid === authUser.uid || user.email === authUser.email
                                    );
                                    
                                    const orderedUsers = [
                                        ...users.filter(user => 
                                            user.uid === authUser.uid || user.email === authUser.email
                                        ),
                                        ...users.filter(user => 
                                            user.uid !== authUser.uid && user.email !== authUser.email
                                        )
                                    ];
                                    
                                    return orderedUsers.map((user, index) => (
                                        <UserCard 
                                            key={user.uid ?? user.id ?? user.email ?? index}
                                            user={{
                                                ...user,
                                                name: user.name || (user.uid === authUser.uid ? authUser.name : '') || user.name || 'User'
                                            }}
                                            searchTerm={searchTerm}
                                        />
                                    ));
                                } else {
                                    return users.map((user, index) => (
                                        <UserCard 
                                            key={user.uid ?? user.id ?? user.email ?? index}
                                            user={{
                                                ...user,
                                                name: user.name || 'User'
                                            }}
                                            searchTerm={searchTerm}
                                        />
                                    ));
                                }
                            })()}
                        </div>
                    )}
                    <div className="sticky bottom-14">
                        {showAdvancedSearch && (
                            <div className="mb-2">
                                <AdvancedSearch
                                    onSearch={handleAdvancedSearch}
                                    users={users}
                                    onClose={() => setShowAdvancedSearch(false)}
                                />
                            </div>
                        )}
                        <div className="flex gap-2 mb-2">
                            <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
                            <Button
                                variant="default"
                                size="icon"
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                className={showAdvancedSearch ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="manage" className="mt-0">
                    {isAdmin && (
                        <>
                            {showAdvancedSearch && (
                                <div className="mb-6">
                                    <AdvancedSearch
                                        onSearch={handleAdvancedSearch}
                                        users={users}
                                        onClose={() => setShowAdvancedSearch(false)}
                                    />
                                </div>
                            )}
                            
                            <UserManagement
                                users={searchTerm? searchResults : users}
                                onAddUser={addUser}
                                onUpdateUser={updateUser}
                                onDeleteUser={deleteUser}
                                isAdmin={isAdmin}
                                currentUserUid={authUser.uid}
                                currentUserEmail={authUser.email}
                            />
                            <div className="sticky mt-10 bottom-14">
                                <div className="flex gap-2 mb-2">
                                    <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                        className={showAdvancedSearch ? "bg-primary text-primary-foreground" : ""}
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    );
}
