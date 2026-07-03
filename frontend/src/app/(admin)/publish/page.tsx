"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileArchive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export default function PublishWorkspace() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    const fetchWorkspaceData = async () => {
        try {
            const res = await api.get('/specialties');
            const specialties = res.data;

            const batches: any[] = [];
            specialties.forEach((spec: any) => {
                spec.programs.forEach((prog: any) => {
                    if (prog.results && prog.results.length > 0) {
                        const status = prog.results[0].status || 'NOT_READY';
                        const uniqueStudents = new Set(prog.results.map((r: any) => r.matricule)).size;

                        batches.push({
                            id: prog.id,
                            specialty: spec.name,
                            program: prog.name,
                            year: prog.results[0].academicYear || 'Current',
                            semester: prog.results[0].semester || 1,
                            studentCount: uniqueStudents,
                            status: status,
                            students: prog.students
                        });
                    }
                });
            });
            setResults(batches);
        } catch (error) {
            console.error("Failed to load workspace data", error);
        } finally {
            setLoading(false);
        }
    };

    const moveCard = async (programId: string, newStatus: string) => {
        try {
            await api.post('/students/bulk-status', { programId, status: newStatus });
            setResults(prev => prev.map(r => r.id === programId ? { ...r, status: newStatus } : r));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleViewBatch = (batch: any) => {
        setSelectedBatch(batch);
        setIsDialogOpen(true);
    };

    const columns = [
        { title: 'Not Ready', status: 'NOT_READY' },
        { title: 'Ready For Publishing', status: 'READY_FOR_PUBLISHING' },
        { title: 'Published', status: 'PUBLISHED' },
    ];

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspace...</div>;

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Publication Workspace</h2>
                <p className="text-muted-foreground">Manage the workflow of academic results publication.</p>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => (
                    <div key={col.status} className="flex flex-col bg-muted/40 rounded-xl border border-border p-4 w-80 min-w-[320px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-foreground">{col.title}</h3>
                            <Badge variant="secondary">{results.filter(r => r.status === col.status).length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {results.filter(r => r.status === col.status).length === 0 ? (
                                <div className="text-sm text-center text-muted-foreground py-4 border-2 border-dashed rounded-lg">
                                    No batches
                                </div>
                            ) : results.filter(r => r.status === col.status).map(item => (
                                <Card key={item.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card">
                                    <CardContent className="p-4 flex flex-col gap-2 relative group">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="font-mono text-xs">{item.specialty}</Badge>
                                            <span className="text-xs text-muted-foreground">{item.studentCount} Students</span>
                                        </div>
                                        <h4 className="font-semibold text-lg leading-tight">{item.program}</h4>
                                        <p className="text-sm text-muted-foreground">Year: {item.year} | Sem: {item.semester}</p>

                                        <div className="mt-2 pt-2 border-t flex flex-wrap justify-end gap-2 text-xs">
                                            {col.status === 'NOT_READY' && (
                                                <Button size="sm" variant="outline" onClick={() => moveCard(item.id, 'READY_FOR_PUBLISHING')}>Validate</Button>
                                            )}
                                            {col.status === 'READY_FOR_PUBLISHING' && (
                                                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => moveCard(item.id, 'PUBLISHED')}>Publish</Button>
                                            )}
                                            {col.status === 'PUBLISHED' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => moveCard(item.id, 'READY_FOR_PUBLISHING')}>Unpublish</Button>
                                                    <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => handleViewBatch(item)}>
                                                        <FileArchive className="h-4 w-4 mr-1" /> View
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedBatch?.program} - Students</DialogTitle>
                        <DialogDescription>
                            Review the individual student standing for this batch before explicitly sharing.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                        {!selectedBatch?.students || selectedBatch.students.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No specific students found for this batch.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Average</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedBatch.students.map((student: any) => (
                                        <TableRow key={student.matricule}>
                                            <TableCell className="font-medium">{student.studentName}</TableCell>
                                            <TableCell>{student.matricule}</TableCell>
                                            <TableCell>{student.average}%</TableCell>
                                            <TableCell>
                                                <span className={student.passed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                    {student.passed ? "Pass" : "Fail"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
