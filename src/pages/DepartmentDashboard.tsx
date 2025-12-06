import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Grievance, STATUS_CONFIG } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { GrievanceCard } from '@/components/grievance/GrievanceCard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function DepartmentDashboard() {
  const { userData } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!userData?.department) return;

    const q = query(
      collection(db, 'grievances'),
      where('departments', 'array-contains', userData.department),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grievanceList: Grievance[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        grievanceList.push({
          ...data,
          grievanceId: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
        } as Grievance);
      });
      setGrievances(grievanceList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const stats = {
    pending: grievances.filter((g) => ['submitted', 'assigned'].includes(g.status)).length,
    inProgress: grievances.filter((g) => g.status === 'in_progress').length,
    resolved: grievances.filter((g) => ['resolved', 'closed'].includes(g.status)).length,
    urgent: grievances.filter((g) => g.priority === 'urgent' && !['resolved', 'closed'].includes(g.status)).length,
  };

  const filteredGrievances = grievances.filter((g) => 
    statusFilter === 'all' || g.status === statusFilter
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Dashboard</h1>
          <p className="text-sm text-muted-foreground">{userData?.department}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-submitted/15">
                  <Clock className="w-5 h-5 text-status-submitted" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-in-progress/15">
                  <ArrowUpRight className="w-5 h-5 text-status-in-progress" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-resolved/15">
                  <CheckCircle2 className="w-5 h-5 text-status-resolved" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-priority-urgent/15">
                  <AlertCircle className="w-5 h-5 text-priority-urgent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.urgent}</p>
                  <p className="text-xs text-muted-foreground">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredGrievances.length} grievance(s)
          </span>
        </div>

        {/* Grievances */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No grievances found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGrievances.map((grievance) => (
              <GrievanceCard key={grievance.grievanceId} grievance={grievance} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
