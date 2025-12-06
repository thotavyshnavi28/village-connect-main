import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grievance, DEPARTMENTS, Department, GrievanceStatus, STATUS_CONFIG } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { GrievanceCard } from '@/components/grievance/GrievanceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

export default function Community() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'grievances'),
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
  }, []);

  const filteredGrievances = grievances.filter((grievance) => {
    const matchesSearch = 
      grievance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === 'all' || 
      grievance.departments.includes(filterDepartment as Department);
    
    const matchesStatus = 
      filterStatus === 'all' || 
      grievance.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const clearFilters = () => {
    setFilterDepartment('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterDepartment !== 'all' || filterStatus !== 'all' || searchQuery !== '';

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
            <p className="text-sm text-muted-foreground">All reported issues in your village</p>
          </div>
          {userData?.role === 'citizen' && (
            <Button 
              variant="hero" 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg md:hidden"
              onClick={() => navigate('/submit')}
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Grievance List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No grievances found</p>
            {userData?.role === 'citizen' && (
              <Button variant="link" onClick={() => navigate('/submit')}>
                Submit the first one
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrievances.map((grievance) => (
              <GrievanceCard key={grievance.grievanceId} grievance={grievance} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop FAB for citizens */}
      {userData?.role === 'citizen' && (
        <Button
          variant="hero"
          className="fixed bottom-24 right-6 h-14 px-6 rounded-full shadow-lg hidden md:flex"
          onClick={() => navigate('/submit')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Submit Grievance
        </Button>
      )}
    </AppLayout>
  );
}
