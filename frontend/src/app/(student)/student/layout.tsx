"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    GraduationCap,
    FileText,
    LogOut,
    UserCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || u.role !== 'STUDENT') {
            // In this demo, allow passing through for checking UI
            // router.push('/auth/login');
        }
        setUser(u);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] dark:bg-slate-950">
            <header className="h-16 border-b bg-card flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                <div className="flex items-center gap-2 text-primary">
                    <GraduationCap className="w-8 h-8" />
                    <span className="text-xl font-bold tracking-tight hidden sm:block">University Student Portal</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="hidden sm:inline">{user?.username || 'John Doe'}</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
