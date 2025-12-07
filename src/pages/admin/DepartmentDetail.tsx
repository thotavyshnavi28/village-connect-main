import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grievance, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function DepartmentDetail() {
    const { name } = useParams(); // Department name from URL
    const navigate = useNavigate();
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!name) return;

        const fetchGrievances = async () => {
            try {
                setLoading(true);
                // Note: 'departments' is an array, so we use 'array-contains'
                const q = query(
                    collection(db, 'grievances'),
                    where('departments', 'array-contains', name),
                    orderBy('createdAt', 'desc')
                );

                const snapshot = await getDocs(q);
                const list: Grievance[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    list.push({
                        ...data,
                        grievanceId: doc.id,
                        createdAt: data.createdAt?.toDate(),
                    } as Grievance);
                });

                setGrievances(list);
            } catch (error) {
                console.error("Error fetching department grievances:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrievances();
    }, [name]);

    // Decode the URL encoded department name for display
    const decodedName = decodeURIComponent(name || '');

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{decodedName}</h1>
                        <p className="text-sm text-muted-foreground">Department Overview & Issues</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : grievances.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <p>No grievances found for this department.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {grievances.map((grievance) => (
                            <Card
                                key={grievance.grievanceId}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(`/grievance/${grievance.grievanceId}`)}
                            >
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-lg line-clamp-1">{grievance.title}</h3>
                                                <Badge variant={grievance.status.replace('_', '-') as any} className="sm:hidden">
                                                    {STATUS_CONFIG[grievance.status].label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{grievance.description}</p>

                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>Registered: {grievance.createdAt ? format(grievance.createdAt, 'PPP') : 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>By: {grievance.submittedByName || 'Anonymous'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex flex-col items-end gap-2">
                                            <Badge variant={grievance.status.replace('_', '-') as any}>
                                                {STATUS_CONFIG[grievance.status].label}
                                            </Badge>
                                            <Badge variant={grievance.priority as any}>
                                                {PRIORITY_CONFIG[grievance.priority].label}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
