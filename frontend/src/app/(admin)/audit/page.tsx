"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Settings } from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                const res = await api.get('/audit');
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch audit logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAuditLogs();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading audit logs...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                    <p className="text-muted-foreground">Review administrative actions and system modifications.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className=" flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        System Audit Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Specialty</TableHead>
                                <TableHead>Program</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No audit records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">
                                            {log.action}
                                        </TableCell>
                                        <TableCell>
                                            {log.specialty || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {log.program || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
