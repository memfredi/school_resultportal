"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Bell,
    LogOut,
    BookOpen,
    Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/specialties', label: 'Specialties', icon: BookOpen },
    { href: '/publish', label: 'Publish Workspace', icon: Users },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/audit', label: 'Audit Logs', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token || user.role !== 'ADMIN') {
            router.push('/auth/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col transition-all duration-300 hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                    <span className="text-lg font-bold text-primary tracking-tight">Results Portal</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-[var(--border)]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header would go here */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--muted)]/20">
                    {children}
                </div>
            </main>
        </div>
    );
}
