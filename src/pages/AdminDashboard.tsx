import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grievance, STATUS_CONFIG, DEPARTMENTS, User } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { GrievanceCard } from '@/components/grievance/GrievanceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, FileText, Building2, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  useEffect(() => {
    // Fetch grievances
    const grievancesQuery = query(
      collection(db, 'grievances'),
      orderBy('createdAt', 'desc')
    );

    const unsubGrievances = onSnapshot(grievancesQuery, (snapshot) => {
      const list: Grievance[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          ...data,
          grievanceId: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Grievance);
      });
      setGrievances(list);
      setLoading(false);
    });

    // Fetch users
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const userList: User[] = [];
      usersSnap.forEach((doc) => {
        userList.push(doc.data() as User);
      });
      setUsers(userList);
    };
    fetchUsers();

    return () => unsubGrievances();
  }, []);

  const stats = {
    totalGrievances: grievances.length,
    pending: grievances.filter((g) => ['submitted', 'assigned'].includes(g.status)).length,
    inProgress: grievances.filter((g) => g.status === 'in_progress').length,
    resolved: grievances.filter((g) => ['resolved', 'closed'].includes(g.status)).length,
    totalUsers: users.length,
    citizens: users.filter((u) => u.role === 'citizen').length,
    officials: users.filter((u) => u.role === 'department').length,
  };

  const deptStats = DEPARTMENTS.map((dept) => ({
    name: dept,
    count: grievances.filter((g) => g.departments.includes(dept)).length,
    pending: grievances.filter((g) => g.departments.includes(dept) && !['resolved', 'closed'].includes(g.status)).length,
  }));

  const filteredGrievances = grievances.filter((g) => {
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesDept = deptFilter === 'all' || g.departments.includes(deptFilter as any);
    return matchesStatus && matchesDept;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System overview and management</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalGrievances}</p>
                  <p className="text-xs text-muted-foreground">Total Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-status-in-progress/15">
                  <Clock className="w-5 h-5 text-status-in-progress" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending + stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
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
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grievances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grievances">Grievances</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="grievances" className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGrievances.map((grievance) => (
                  <GrievanceCard key={grievance.grievanceId} grievance={grievance} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deptStats.map((dept) => (
                <Card
                  key={dept.name}
                  className="cursor-pointer hover:border-primary/50 transition-colors"

                  onClick={() => navigate(`/admin/department/${encodeURIComponent(dept.name)}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {dept.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-2xl font-bold">{dept.count}</p>
                        <p className="text-xs text-muted-foreground">Total Issues</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-status-in-progress">{dept.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold">{stats.citizens}</p>
                  <p className="text-sm text-muted-foreground">Citizens</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold">{stats.officials}</p>
                  <p className="text-sm text-muted-foreground">Department Officials</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{user.role}</p>
                        {user.department && (
                          <p className="text-xs text-muted-foreground">{user.department}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
