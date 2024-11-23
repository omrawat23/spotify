'use client';

import {
    NavigationMenu,
    NavigationMenuList
} from "@/components/ui/navigation-menu";
import { Dialog, DialogClose } from "@radix-ui/react-dialog";
import { BookOpen } from 'lucide-react';
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Profile } from "./homepage/user-profile";
import { useEffect, useState } from 'react';

export function NavBar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/spotify/user');
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        window.location.href = '/api/spotify/auth';
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserData(null);
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex items-center min-w-full w-full fixed justify-center p-2 z-10">
            <div className="flex justify-between md:w-[620px] w-[95%] mt-[1rem] border border-gray-400 dark:border-zinc-900 dark:bg-black bg-opacity-10 relative backdrop-filter backdrop-blur-lg bg-white border-opacity-20 rounded-xl p-2 shadow-lg">
                <Dialog>
                    <SheetTrigger className="min-[825px]:hidden p-2 transition">
                        <GiHamburgerMenu />
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>tsafi</SheetTitle>
                            <SheetDescription>
                                Launch your blog in just a few clicks
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col space-y-3 mt-[1rem]">
                            <DialogClose asChild>
                                <Link href="/">
                                    <Button variant="outline" className="w-full">Home</Button>
                                </Link>
                            </DialogClose>
                            <DialogClose asChild>
                                <Link href="/cms">
                                    <Button variant="outline" className="w-full">Dashboard</Button>
                                </Link>
                            </DialogClose>
                        </div>
                    </SheetContent>
                </Dialog>
                <NavigationMenu>
                    <NavigationMenuList className="max-[825px]:hidden">
                        <Link href="/" className="pl-2">
                            <BookOpen />
                        </Link>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="flex items-center gap-2">
                {!isAuthenticated ? (
                <Button 
                    onClick={handleLogin}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path 
                            fill="currentColor" 
                            d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                        />
                    </svg>
                    Login
                </Button>
            ) : (
                userData && <Profile userData={userData} onLogout={handleLogout} />
            )}
                </div>
            </div>
        </div>
    );
}