import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Grievance, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
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
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    if (!userData?.department) return;

    // Note: Removed orderBy to avoid needing a composite index for this simulation
    const q = query(
      collection(db, 'grievances'),
      where('departments', 'array-contains', userData.department)
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

      // Client-side sort
      grievanceList.sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      });

      console.log("Department Dashboard: Found grievances", grievanceList.length);
      setGrievances(grievanceList);
      setLoading(false);
    }, (error) => {
      console.error("Department Dashboard Error:", error);
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

  const filteredGrievances = grievances.filter((g) => {
    // Status Logic
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'pending_group') {
      // Pending = submitted OR assigned
      matchesStatus = ['submitted', 'assigned'].includes(g.status);
    } else if (statusFilter === 'resolved_group') {
      // Resolved = resolved OR closed
      matchesStatus = ['resolved', 'closed'].includes(g.status);
    } else {
      // Exact match
      matchesStatus = g.status === statusFilter;
    }

    // Priority Logic
    let matchesPriority = true;
    if (priorityFilter === 'all') {
      matchesPriority = true;
    } else if (priorityFilter === 'urgent_group') {
      // Urgent KPI Logic: Priority=Urgent AND Status != Resolved/Closed
      // But wait, the KPI card for Urgent says "Urgent". 
      // Usually filtering by "Urgent" means showing all urgent items. 
      // The stat logic was: g.priority === 'urgent' && !['resolved', 'closed'].includes(g.status).
      // If user selects "Urgent" from Dropdown, they probably mean ALL urgent.
      // Only the KPI Click should enforce the strict "Active Urgent" logic.
      // Let's decide: Priority Filter Dropdown handles direct string match (low/medium/high/urgent).
      // KPI Click handles special filtering logic?
      // Let's keep filter logic simple for dropdowns, and if stats are clicked, we set filters that BEST APPROXIMATE the view.
      // "Urgent" KPI click -> Priority='urgent', Status='all' (or maybe better, filter the list).
      // If I set priorityFilter='urgent', it shows ALL urgent (including resolved).
      // Let's stick to standard filtering.
      matchesPriority = g.priority === priorityFilter;
    } else {
      matchesPriority = g.priority === priorityFilter;
    }

    return matchesStatus && matchesPriority;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Department Dashboard</h1>
          <p className="text-sm text-muted-foreground">{userData?.department}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => { setStatusFilter('pending_group'); setPriorityFilter('all'); }}
          >
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
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => { setStatusFilter('in_progress'); setPriorityFilter('all'); }}
          >
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
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => { setStatusFilter('resolved_group'); setPriorityFilter('all'); }}
          >
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
          <Card
            className="cursor-pointer hover:border-priority-urgent/50 transition-colors"
            onClick={() => { setStatusFilter('all'); setPriorityFilter('urgent'); }}
          >
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_group">Pending (Merged)</SelectItem>
              <SelectItem value="resolved_group">Resolved (Merged)</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-block">
            {filteredGrievances.length} result(s)
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
