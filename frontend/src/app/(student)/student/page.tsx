"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DownloadCloud, Printer, Award, BookOpen } from 'lucide-react';

function getStanding(avg: number) {
    if (avg >= 80) return { label: 'First Class Honors', color: 'bg-green-100 text-green-800 border-green-200' };
    if (avg >= 70) return { label: 'Second Class Upper', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (avg >= 60) return { label: 'Second Class Lower', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (avg >= 50) return { label: 'Third Class', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Fail', color: 'bg-red-100 text-red-800 border-red-200' };
}

function calcGPA(avg: number) {
    if (avg >= 80) return '4.0';
    if (avg >= 75) return '3.7';
    if (avg >= 70) return '3.3';
    if (avg >= 65) return '3.0';
    if (avg >= 60) return '2.7';
    if (avg >= 55) return '2.3';
    if (avg >= 50) return '2.0';
    return '0.0';
}

export default function StudentDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (!token) {
            router.push('/auth/login');
            return;
        }
        setUser(u);

        const fetchResults = async () => {
            try {
                // The username (for students) IS the matricule
                const matricule = u.username;
                const res = await api.get(`/students/${matricule}`);
                const { results, gpa, cgpa } = res.data;

                let avg: any = 'N/A';
                let computedGPA = 'N/A';
                let standing = { label: 'Pending', color: 'bg-gray-100 text-gray-800 border-gray-200' };

                if (results.length > 0) {
                    let totalScore = 0;
                    results.forEach((r: any) => (totalScore += r.totalScore));
                    avg = (totalScore / results.length).toFixed(1);
                    standing = getStanding(Number(avg));
                    computedGPA = calcGPA(Number(avg));
                }

                setData({
                    results,
                    gpa: results.length > 0 ? computedGPA : 'N/A',
                    cgpa: results.length > 0 ? computedGPA : 'N/A',
                    standing,
                    avg,
                });
            } catch (err: any) {
                // Fallback: if backend returned empty results (not published yet), show friendly message
                setData({ results: [], gpa: 'N/A', cgpa: 'N/A', standing: { label: 'Pending', color: 'bg-gray-100 text-gray-800 border-gray-200' }, avg: 'N/A' });
                if (err.response?.status !== 200) {
                    setError('Results not yet published. Please check back later.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [router]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading academic records...</p>
            </div>
        </div>
    );

    const program = data?.results?.[0]?.program;

    const downloadTranscript = () => {
        if (!data?.results || data.results.length === 0) return;

        // Define CSV headers
        const headers = ['Course Code', 'Course Name', 'CA Score', 'Exam Score', 'Total Score', 'Grade', 'Status'];

        // Map results to CSV rows
        const rows = data.results.map((res: any) => [
            res.courseCode,
            `"${res.courseName}"`, // Escape spaces in names
            res.caScore,
            res.examScore,
            res.totalScore,
            res.grade,
            res.totalScore >= 50 ? 'Pass' : 'Fail'
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map((row: any) => row.join(','))
        ].join('\n');

        // Create an invisible anchor to trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${user?.username || 'Student'}_Transcript.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Print-specific header (hidden on screen, visible on print) */}
            <div className="hidden print:block mb-8 text-center border-b pb-4">
                <h1 className="text-2xl font-bold">OFFICIAL RESULT SLIP</h1>
                <p className="mt-2 text-sm text-gray-600">University Results Portal</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Academic Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        {program ? `${program.specialty?.name} - ${program.name}` : `ID: ${user?.username || '—'}`}
                    </p>
                </div>
                <div className="flex gap-2 print:hidden">
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print Slip
                    </Button>
                    <Button className="gap-2" onClick={downloadTranscript}>
                        <DownloadCloud className="w-4 h-4" /> Download Transcript
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex gap-2">
                    <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Semester GPA</p>
                            <h2 className="text-4xl font-bold mt-2 text-primary">{data.gpa}</h2>
                        </div>
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                            <Award className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                            <h2 className="text-4xl font-bold mt-2">{data.avg}%</h2>
                        </div>
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                            <Award className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 lg:col-span-1">
                    <CardContent className="p-6 flex flex-col justify-center h-full">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Academic Standing</p>
                        <span className={`text-sm font-semibold w-fit py-1 px-3 rounded-full border ${data.standing.color}`}>
                            {data.standing.label}
                        </span>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Course Results — Semester 1 (2024/2025)</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.results.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No published results yet</p>
                            <p className="text-sm mt-1">Results will appear here once published by the administration.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead className="text-right">CA (30)</TableHead>
                                    <TableHead className="text-right">Exam (70)</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Grade</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.results.map((res: any) => (
                                    <TableRow key={res.id}>
                                        <TableCell className="font-medium font-mono">{res.courseCode}</TableCell>
                                        <TableCell>{res.courseName}</TableCell>
                                        <TableCell className="text-right">{res.caScore}</TableCell>
                                        <TableCell className="text-right">{res.examScore}</TableCell>
                                        <TableCell className="text-right font-bold">{res.totalScore}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-semibold ${res.totalScore >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                {res.grade}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={res.totalScore >= 50 ? 'success' : 'destructive'}>
                                                {res.totalScore >= 50 ? 'Pass' : 'Fail'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
