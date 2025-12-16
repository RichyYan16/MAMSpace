"use client"

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { UserCard } from "@/components/user-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/user-management";
import { AdvancedSearch } from "@/components/advanced-search";
import type { User } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth";

export default function Page() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [searchResults, setSearchResults] = useState(users);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [isAdvancedSearchActive, setIsAdvancedSearchActive] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const { user: authUser, logOut } = useAuth();
    const isAdmin = authUser?.role === "admin";

    useEffect(() => {
        if (authUser?.uid && users.length > 0) {
            console.log('Looking for user in users array:', authUser.email);
            
            const foundUser = users.find(user => user.email === authUser.email);
            
            if (foundUser) {
                console.log('Found user in users array:', foundUser);
                setCurrentUser(foundUser);
            } else {
                console.log('User not found in users array');
            }
        }
    }, [authUser?.uid, authUser?.email, users]);

    console.log('Auth user data:', JSON.stringify(authUser));
    console.log('Current user data:', currentUser);
    console.log('User name:', authUser?.name || currentUser?.name);

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
        });

        return () => unsubscribe();
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setSearchResults(users);
            return;
        }

        const normalizedTerm = term.toLowerCase().trim();
        const tags = Array.from(
            term.trim().matchAll(/(\s|^)@\w+(?=\s|$)/g),
            (match) => match[0].trim(),
        );

        const filteredUsers = users.filter((user) => {
            const nameMatch = user.name?.toLowerCase().includes(normalizedTerm) ?? false;
            const emailMatch = user.email?.toLowerCase().includes(normalizedTerm) ?? false;
            const bioMatch = user.bio?.toLowerCase().includes(normalizedTerm) ?? false;

            const educationMatch = user.education?.some(
                (edu) =>
                    edu.degree?.toLowerCase().includes(normalizedTerm) ||
                    edu.institution?.toLowerCase().includes(normalizedTerm),
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
        })

        setSearchResults(filteredUsers);
    }

    const handleAdvancedSearch = (results: User[]) => {
        setSearchResults(results);
        setSearchTerm("");
        setIsAdvancedSearchActive(true);
        setShowAdvancedSearch(false);
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
                    <h1 className="text-3xl font-bold">Welcome, {(currentUser?.name || authUser?.name || authUser?.email?.split('@')[0] || 'Guest').split(' ')[0]}</h1>
                    <p className="text-muted-foreground">Find the people you need in our community.</p>
                </div>
                <div>
                    {authUser?.uid && (
                        <Link href="/invite" className="mr-4">
                            <Button>Send Invite</Button>
                        </Link>
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
                    {(searchTerm || isAdvancedSearchActive) ? (searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8" style={{ alignItems: 'start', gridAutoRows: 'minmax(0, 1fr)' }}>
                            {(() => {
                                if (authUser?.uid) {
                                    console.log('Current auth UID:', authUser.uid);
                                    console.log('Search results UIDs:', searchResults.map(u => ({ uid: u.uid, email: u.email, name: u.name })));
                                    
                                    const currentUserInResults = searchResults.find(user => 
                                        user.uid === authUser.uid || user.email === authUser.email
                                    );
                                    console.log('Current user in results:', currentUserInResults);
                                    
                                    const orderedResults = [
                                        ...searchResults.filter(user => 
                                            user.uid === authUser.uid || user.email === authUser.email
                                        ),
                                        ...searchResults.filter(user => 
                                            user.uid !== authUser.uid && user.email !== authUser.email
                                        )
                                    ];
                                    
                                    console.log('Ordered results first user:', orderedResults[0]);
                                    
                                    return orderedResults.map((user, index) => (
                                        <UserCard 
                                            key={user.uid ?? user.id ?? user.email ?? index}
                                            user={{
                                                ...user,
                                                name: user.name || (user.uid === authUser.uid ? authUser.name : '') || user.name || 'User'
                                            }}
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
                                        />
                                    ));
                                }
                            })()}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h2 className="text-xl font-medium mb-2">No users found</h2>
                            <p className="text-muted-foreground">No users match your search criteria. Try a different search term.</p>
                        </div>
                    )) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-8" style={{ alignItems: 'start' }}>
                        {(() => {
                            if (authUser?.uid) {
                                console.log('Current auth UID (default view):', authUser.uid);
                                console.log('All users UIDs:', users.map(u => ({ uid: u.uid, email: u.email, name: u.name })));
                                
                                const currentUserInUsers = users.find(user => 
                                    user.uid === authUser.uid || user.email === authUser.email
                                );
                                console.log('Current user in users:', currentUserInUsers);
                                
                                const orderedUsers = [
                                    ...users.filter(user => 
                                        user.uid === authUser.uid || user.email === authUser.email
                                    ),
                                    ...users.filter(user => 
                                        user.uid !== authUser.uid && user.email !== authUser.email
                                    )
                                ];
                                
                                console.log('Ordered users first user:', orderedUsers[0]);
                                
                                return orderedUsers.map((user, index) => (
                                    <UserCard 
                                        key={user.uid ?? user.id ?? user.email ?? index}
                                        user={{
                                            ...user,
                                            name: user.name || (user.uid === authUser.uid ? authUser.name : '') || user.name || 'User'
                                        }}
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
    )
}
