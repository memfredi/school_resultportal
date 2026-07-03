"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading notifications...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                    <p className="text-muted-foreground">Stay updated on system activities and result publishing workflows.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className=" flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        System Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No notifications available.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${notif.read ? 'bg-muted/30 border-transparent' : 'bg-card border-primary/20 shadow-sm'}`}
                            >
                                <div className="space-y-1">
                                    <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {!notif.read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:bg-primary/10"
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
