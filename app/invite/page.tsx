"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function Page() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter an email address");
            return;
        }

        const subject = "Join me on our platform!";
        const body = `Hi,\n\nI'd like to invite you to join our platform. Sign up at ${window.location.origin}/signup\n\nBest regards`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        toast({
            title: "Invite Ready",
            description: "Your email client should open with a pre-filled invite. Please send it to complete the invitation.",
            variant: "default",
        });
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Send Invite</CardTitle>
                        <CardDescription>
                            Invite someone to join the platform
                        </CardDescription>
                        {error && (
                            <div className="mt-2 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full"
                                >
                                    Open Email Draft
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
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}