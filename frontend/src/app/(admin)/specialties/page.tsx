"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';

export default function SpecialtiesPage() {
    const [specialties, setSpecialties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const res = await api.get('/specialties');
                setSpecialties(res.data);
            } catch (err) {
                console.error("Failed to fetch specialties", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSpecialties();
    }, []);

    const handleViewDetails = (spec: any) => {
        setSelectedSpecialty(spec);
        setIsDialogOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading specialties...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Specialties</h2>
                    <p className="text-muted-foreground">Manage and track performance across all university specialties.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Specialty Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Specialty</TableHead>
                                <TableHead>Number of Students</TableHead>
                                <TableHead>Passed</TableHead>
                                <TableHead>Failed</TableHead>
                                <TableHead>Pass Percentage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {specialties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        No specialties found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                specialties.map((spec) => (
                                    <TableRow key={spec.id}>
                                        <TableCell className="font-medium text-primary">{spec.name}</TableCell>
                                        <TableCell>{spec.stats?.totalStudents || 0}</TableCell>
                                        <TableCell className="text-green-600">{spec.stats?.totalPassed || 0}</TableCell>
                                        <TableCell className="text-red-500">{spec.stats?.totalFailed || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-secondary rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${Math.max(0, Math.min(100, spec.stats?.passRate || 0))}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold">{Number(spec.stats?.passRate || 0).toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={spec.stats?.passRate >= 50 ? 'success' : 'default'}>
                                                {spec.stats?.passRate >= 50 ? 'Good Standing' : 'Review Needed'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(spec)}>View Details</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedSpecialty?.name} - Program Breakdown</DialogTitle>
                        <DialogDescription>
                            Detailed performance statistics for all programs under this specialty.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                        {selectedSpecialty?.programs?.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">No programs found.</div>
                        ) : (
                            <div className="space-y-6">
                                {selectedSpecialty?.programs?.map((prog: any) => (
                                    <div key={prog.id} className="border rounded-md overflow-hidden">
                                        <div className="bg-muted p-4 flex justify-between items-center border-b">
                                            <div>
                                                <h3 className="font-semibold">{prog.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Pass Rate: {prog.stats?.passRate?.toFixed(1) || 0}% ({prog.stats?.totalPassed || 0}/{prog.stats?.totalStudents || 0} passed)
                                                </p>
                                            </div>
                                        </div>
                                        {prog.students && prog.students.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Student Name</TableHead>
                                                        <TableHead>Matricule</TableHead>
                                                        <TableHead>Average Score</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {prog.students.map((student: any) => (
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
                                        ) : (
                                            <div className="p-4 text-sm text-muted-foreground text-center">No mapped student results yet.</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
