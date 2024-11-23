'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    LogOut,
    Settings,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export function Profile({ userData, onLogout }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Call the logout API endpoint to clear cookies
            const response = await fetch('/api/spotify/logout', {
                method: 'POST',
            });

            if (response.ok) {
                // Call the onLogout callback to update parent component state
                onLogout();
                router.push('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-[2.25rem] h-[2.25rem]">
                <Avatar>
                    <AvatarImage 
                        src={userData?.images?.[0]?.url} 
                        alt="User Profile" 
                    />
                    <AvatarFallback>
                        {userData?.display_name?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border border-zinc-100">
                <DropdownMenuLabel>{userData?.display_name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                <Link href="/dashboard/ai-playlist">
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Playlists</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/analytics">
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Analytics</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="border dark:border-zinc-800 border-slate-100 mt-[0.15rem]"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}