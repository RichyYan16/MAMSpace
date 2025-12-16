"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { AdminPanel } from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (user && user.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
                    <Link href="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="container mx-auto px-4 py-6">
                <Link href="/">
                    <Button variant="outline" className="mb-6">← Back to Home</Button>
                </Link>
            </div>
            <AdminPanel />
        </div>
    );
}
