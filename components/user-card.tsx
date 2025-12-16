import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { User } from "@/lib/types";

interface UserCardProps {
    user: User;
}

export function UserCard({ user }: UserCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const displayName = user.name || user.email || "User";
    const userId = user.uid ?? (typeof user.id === "number" ? user.id.toString() : "");
    const href = userId ? `/users/${userId}` : "#";

    return (
        <Link href={href}>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={displayName} />
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium">{displayName}</h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>{user.bio}</p>
                </CardContent>
                <CardFooter>
                    <div className="flex flex-wrap gap-2">
                        {user.roles?.map((role, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                                {role}
                            </Badge>
                        ))}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
