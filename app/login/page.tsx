"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { logIn } = useAuth();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        logIn!(email, password).then(() => {
            router.push("/");
        }).catch(err => {
            setError(err.message);
        });
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Log In</CardTitle>
                            {error && <CardDescription className="text-red-500">{error}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            onChange={e => setEmail(e.target.value)}
                                            id="email"
                                            type="email"
                                            placeholder="user@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            onChange={e => setPassword(e.target.value)}
                                            id="password"
                                            type="password"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Log In
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        router.push("/");
                                    }}>
                                        Return to Home
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}