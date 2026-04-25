import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@/lib/types";
import { getRoleBadgeVariant, getExpertiseBadgeVariant } from "@/lib/badge-styles";

interface UserCardProps {
    user: User;
    searchTerm?: string;
}

export function UserCard({ user, searchTerm }: UserCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const displayName = user.name || user.email || "User";
    const userId = user.uid ?? (typeof user.id === "number" ? user.id.toString() : "");
    
    // Build href with search parameters
    const href = userId ? (() => {
        const url = new URL(`/users/${userId}`, window.location.origin);
        const currentSearch = searchParams.get('search') || searchTerm;
        const currentTag = searchParams.get('tag');
        
        if (currentSearch) {
            url.searchParams.set('search', currentSearch);
        }
        if (currentTag) {
            url.searchParams.set('tag', currentTag);
        }
        return url.pathname + url.search;
    })() : "#";

    const handleTagClick = (tag: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/tags/${encodeURIComponent(tag)}`);
    };

    return (
        <Link href={href}>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
                    <div className="space-y-2">
                        {user.roles && user.roles.length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">Tags</h4>
                                <div className="flex flex-wrap gap-1" role="list" aria-label="User roles and expertise">
                                    {user.roles.map((tag, index) => {
                                        console.log('Processing tag:', tag, 'index:', index);
                                        const tagLower = tag.toLowerCase().trim();
                                        
                                        // Check if it's a predefined role
                                        const isPredefinedRole = ['alumni', 'project advisor', 'stem fair judge', 'student', 'community service', 'guest speaker', 'internship', 'physical education'].includes(tagLower);
                                        const badgeStyle = isPredefinedRole ? getRoleBadgeVariant(tag) : null;
                                        console.log('Is predefined role:', isPredefinedRole, 'badgeStyle:', badgeStyle);
                                        
                                        // Get expertise color for non-predefined roles
                                        const getExpertiseColor = (exp: string, index: number) => {
                                            // Use index to ensure unique colors even for similar expertise types
                                            const uniqueColors = [
                                                'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)', // dark purple
                                                'linear-gradient(135deg, #881337 0%, #be123c 100%)', // dark pink
                                                'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', // dark blue
                                                'linear-gradient(135deg, #14532d 0%, #166534 100%)', // dark green
                                                'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)', // dark coral
                                                'linear-gradient(135deg, #164e63 0%, #134e4a 100%)', // dark cyan
                                                'linear-gradient(135deg, #134e4a 0%, #92400e 100%)', // dark mint to brown
                                                'linear-gradient(135deg, #831843 0%, #9f1239 100%)', // dark rose
                                                'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)', // dark peach
                                                'linear-gradient(135deg, #991b1b 0%, #1e3a8a 100%)', // dark red to blue
                                                'linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)', // dark lavender to blue
                                                'linear-gradient(135deg, #92400e 0%, #a16207 100%)', // dark gold
                                                'linear-gradient(135deg, #831843 0%, #854d0e 100%)', // dark pink to yellow
                                                'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', // dark sky blue
                                                'linear-gradient(135deg, #92400e 0%, #0369a1 100%)', // dark warm to blue
                                                'linear-gradient(135deg, #4c1d95 0%, #14532d 100%)', // dark purple to green
                                                'linear-gradient(135deg, #581c87 0%, #374151 100%)', // dark lavender to gray
                                                'linear-gradient(135deg, #166534 0%, #ca8a04 100%)', // dark green to yellow
                                                'linear-gradient(135deg, #ca8a04 0%, #166534 100%)', // dark yellow to green
                                                'linear-gradient(135deg, #1e3a8a 0%, #64748b 100%)', // dark blue to gray
                                                'linear-gradient(135deg, #475569 0%, #94a3b8 100%)', // dark gray
                                                'linear-gradient(135deg, #334155 0%, #475569 100%)', // darker gray
                                                'linear-gradient(135deg, #1e293b 0%, #334155 100%)', // dark slate
                                                'linear-gradient(135deg, #475569 0%, #f8fafc 100%)', // dark gray to white
                                                'linear-gradient(135deg, #4c1d95 0%, #1e293b 100%)', // dark purple to slate
                                                'linear-gradient(135deg, #581c87 0%, #312e81 100%)', // deep purple
                                                'linear-gradient(135deg, #831843 0%, #f9a8d4 100%)', // dark pink to light pink
                                                'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)', // ocean blue
                                                'linear-gradient(135deg, #831843 0%, #6b21a8 100%)', // magenta to purple
                                                'linear-gradient(135deg, #312e81 0%, #581c87 100%)', // deep purple
                                                'linear-gradient(135deg, #991b1b 0%, #ea580c 100%)', // dark coral to peach
                                                'linear-gradient(135deg, #14532d 0%, #047857 100%)', // green shades
                                                'linear-gradient(135deg, #0c4a6e 0%, #10b981 100%)', // dark cyan to green
                                                'linear-gradient(135deg, #991b1b 0%, #1e3a8a 100%)', // dark red to blue
                                                'linear-gradient(135deg, #92400e 0%, #0891b2 100%)', // dark yellow to cyan
                                                'linear-gradient(135deg, #1e293b 0%, #0284c7 100%)', // dark blue to cyan
                                                'linear-gradient(135deg, #7c3aed 0%, #be185d 100%)', // purple to pink
                                                'linear-gradient(135deg, #0369a1 0%, #4f46e5 100%)', // blue to indigo
                                                'linear-gradient(135deg, #881337 0%, #991b1b 100%)', // pink to red
                                                'linear-gradient(135deg, #0284c7 0%, #14b8a6 100%)', // light blue
                                                'linear-gradient(135deg, #166534 0%, #14b8a6 100%)', // green to mint
                                                'linear-gradient(135deg, #831843 0%, #eab308 100%)', // pink to yellow
                                                'linear-gradient(135deg, #164e63 0%, #312e81 100%)', // cyan to dark purple
                                                'linear-gradient(135deg, #134e4a 0%, #831843 100%)', // mint to pink
                                                'linear-gradient(135deg, #831843 0%, #f9a8d4 100%)', // rose
                                                'linear-gradient(135deg, #9a3412 0%, #fb923c 100%)', // peach
                                                'linear-gradient(135deg, #991b1b 0%, #7dd3fc 100%)', // red to light blue
                                                'linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)', // lavender to blue
                                                'linear-gradient(135deg, #92400e 0%, #fbbf24 100%)', // gold
                                                'linear-gradient(135deg, #831843 0%, #fef3c7 100%)', // pink to light yellow
                                                'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)', // sky blue
                                                'linear-gradient(135deg, #92400e 0%, #7dd3fc 100%)', // warm to light blue
                                            ];
                                            
                                            // Use hash of string for consistent but unique colors
                                            const hash = exp.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                            const finalIndex = (hash + index) % uniqueColors.length;
                                            return uniqueColors[finalIndex];
                                        };
                                        
                                        // Determine background color
                                        const getBackgroundColor = () => {
                                            if (badgeStyle) {
                                                const roleGradients: Record<string, string> = {
                                                    'alumni': 'linear-gradient(135deg, #92400e 0%, #a16207 100%)',
                                                    'project advisor': 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                                                    'stem fair judge': 'linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%)',
                                                    'student': 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
                                                    'community service': 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)',
                                                    'guest speaker': 'linear-gradient(135deg, #831843 0%, #be185d 100%)',
                                                    'internship': 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
                                                    'physical education': 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)'
                                                };
                                                return roleGradients[tagLower] || 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
                                            }
                                            return getExpertiseColor(tagLower, index);
                                        };
                                        
                                        const bgColor = getBackgroundColor();
                                        console.log('Final background color for', tag, ':', bgColor);
                                        
                                        return (
                                            <Badge 
                                                key={`tag-${index}`} 
                                                variant="outline"
                                                className="font-normal text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{
                                                    background: bgColor,
                                                    color: 'white',
                                                    borderColor: 'transparent'
                                                }}
                                                onClick={(e) => handleTagClick(tag, e)}
                                                role="listitem"
                                                aria-label={`Filter by ${badgeStyle ? 'role' : 'expertise'}: ${tag}`}
                                            >
                                                {tag}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
