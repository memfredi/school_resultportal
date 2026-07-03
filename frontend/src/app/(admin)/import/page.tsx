"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ImportResultsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [specialty, setSpecialty] = useState('');
    const [program, setProgram] = useState('');
    const [year, setYear] = useState('2024/2025');
    const [semester, setSemester] = useState('1');
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !program) return;
        setStatus('uploading');

        // MOCKING the parsing logic. Usually we use PapaParse or XLSX in frontend before sending to `importResults` API
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Import Results</h2>
                <p className="text-muted-foreground">Upload and validate student academic results.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Result Upload</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Specialty</label>
                                        <Input required placeholder="e.g. BTECH" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Program</label>
                                        <Input required placeholder="e.g. Software Engineering" value={program} onChange={e => setProgram(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Academic Year</label>
                                        <Input required value={year} onChange={e => setYear(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Semester</label>
                                        <Input required type="number" value={semester} onChange={e => setSemester(e.target.value)} />
                                    </div>
                                </div>

                                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <input type="file" id="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileChange} />
                                    <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">Click or drag file to upload</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Supports .xlsx, .csv formats</p>
                                        <Button type="button" variant="outline" className="pointer-events-none">
                                            Select File
                                        </Button>
                                    </label>
                                    {file && <div className="mt-4 flex items-center text-sm font-medium text-primary"><FileSpreadsheet className="w-4 h-4 mr-2" /> {file.name}</div>}
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={!file || status === 'uploading'}>
                                    {status === 'uploading' ? 'Scanning formats...' : 'Start Import'}
                                </Button>

                                {status === 'success' && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-green-700 dark:text-green-400">Import Successful</h4>
                                            <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">142 records validated accurately and created. Proceed to the publish workspace to continue workflow.</p>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4 text-muted-foreground">
                            <p>Please ensure your dataset strictly follows the provided template format.</p>
                            <ul className="list-disc pl-4 space-y-2">
                                <li><span className="font-medium text-foreground">Matricule:</span> Unique identifier.</li>
                                <li><span className="font-medium text-foreground">Student Name:</span> Full legal name.</li>
                                <li><span className="font-medium text-foreground">Course Code:</span> Exactly as in curriculum.</li>
                                <li><span className="font-medium text-foreground">CA & Exam:</span> Valid 0-100 scores.</li>
                            </ul>
                            <Button variant="outline" className="w-full mt-4 bg-background">
                                Download Template
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
