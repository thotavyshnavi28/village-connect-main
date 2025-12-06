import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Grievance } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { GrievanceCard } from '@/components/grievance/GrievanceCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyGrievances() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'grievances'),
      where('submittedBy', '==', currentUser.uid),
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
  }, [currentUser]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Grievances</h1>
            <p className="text-sm text-muted-foreground">Track your submitted issues</p>
          </div>
          <Button variant="hero" onClick={() => navigate('/submit')}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : grievances.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No grievances yet</p>
            <p className="text-muted-foreground mb-6">Report an issue in your village to get started</p>
            <Button variant="hero" onClick={() => navigate('/submit')}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Grievance
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {grievances.map((grievance) => (
              <GrievanceCard key={grievance.grievanceId} grievance={grievance} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
