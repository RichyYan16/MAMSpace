"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/types";
import { UserForm } from "@/components/user-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "./ui/badge";

interface UserManagementProps {
    users: User[];
    onAddUser: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: number | string) => void;
    isAdmin?: boolean;
    currentUserUid?: string | null;
    currentUserEmail?: string | null;
}

export function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser, isAdmin, currentUserUid, currentUserEmail }: UserManagementProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleAddUser = (newUser: User) => {
        const numericIds = users
            .map((u) => u.id)
            .filter((id): id is number => typeof id === "number" && !Number.isNaN(id));
        const nextId = (numericIds.length ? Math.max(...numericIds) : 0) + 1;

        onAddUser({
            ...newUser,
            id: nextId, // Generate a new ID
        });
        setIsAddDialogOpen(false);
    }

    const handleUpdateUser = (updatedUser: User) => {
        onUpdateUser(updatedUser);
        setIsEditDialogOpen(false);
    }

    const handleDeleteUser = () => {
        if (selectedUser) {
            if (typeof selectedUser.id === "number") {
                onDeleteUser(selectedUser.id);
            } else if (selectedUser.uid) {
                onDeleteUser(selectedUser.uid);
            }
            setIsDeleteDialogOpen(false);
        }
    }

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    }

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Users</h2>
                {isAdmin && (
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add New User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>Fill in the details to create a new user.</DialogDescription>
                            </DialogHeader>
                            <UserForm onSubmit={handleAddUser} />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>View, edit, or delete users here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user, index) => (
                                    <TableRow key={user.uid ?? user.id ?? user.email ?? index}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles?.map((role, index) => (
                                                    <Badge key={index} variant="secondary" className="font-normal">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {(isAdmin ||
                                                    (currentUserUid && user.uid === currentUserUid) ||
                                                    (currentUserEmail && user.email === currentUserEmail)) && (
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                )}
                                                {isAdmin && (
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update the user's information.</DialogDescription>
                    </DialogHeader>
                    {selectedUser && <UserForm user={selectedUser} onSubmit={handleUpdateUser} />}
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
