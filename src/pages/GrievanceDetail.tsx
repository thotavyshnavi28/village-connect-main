import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Grievance, Comment, STATUS_CONFIG, PRIORITY_CONFIG, GrievanceStatus, Priority } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Building2, User, Loader2, Send, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

export default function GrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState<GrievanceStatus | ''>('');
  const [newPriority, setNewPriority] = useState<Priority | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchGrievance = async () => {
      const docRef = doc(db, 'grievances', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setGrievance({
          ...data,
          grievanceId: docSnap.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
        } as Grievance);
      }
      setLoading(false);
    };

    fetchGrievance();

    // Listen to comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('grievanceId', '==', id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentList: Comment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        commentList.push({
          ...data,
          commentId: doc.id,
          createdAt: data.createdAt?.toDate(),
        } as Comment);
      });
      setComments(commentList);
    });

    return () => unsubscribe();
  }, [id]);

  const canUpdateStatus = userData?.role === 'admin' ||
    (userData?.role === 'department' && grievance?.departments.includes(userData.department!));

  const handleUpdate = async () => {
    if ((!newStatus && !newPriority) || !id || !grievance) return;

    setSubmitting(true);
    try {
      const updates: any = {
        updatedAt: serverTimestamp(),
      };

      if (newStatus) {
        updates.status = newStatus;
        if (newStatus === 'resolved') {
          updates.resolvedAt = serverTimestamp();
        }
      }

      if (newPriority) {
        updates.priority = newPriority;
      }

      await updateDoc(doc(db, 'grievances', id), updates);

      // Add update comment
      let commentText = '';
      if (newStatus && newPriority) {
        commentText = `Status updated to ${STATUS_CONFIG[newStatus].label} and Priority updated to ${PRIORITY_CONFIG[newPriority].label}`;
      } else if (newStatus) {
        commentText = `Status updated to ${STATUS_CONFIG[newStatus].label}`;
      } else if (newPriority) {
        commentText = `Priority updated to ${PRIORITY_CONFIG[newPriority].label}`;
      }

      await addDoc(collection(db, 'comments'), {
        grievanceId: id,
        userId: currentUser?.uid,
        userName: userData?.displayName,
        userRole: userData?.role,
        comment: commentText,
        isStatusUpdate: true,
        newStatus: newStatus || undefined,
        createdAt: serverTimestamp(),
      });

      // SIMULATION: Notify the user who submitted the grievance
      if (grievance.submittedBy) {
        await addDoc(collection(db, 'notifications'), {
          userId: grievance.submittedBy,
          title: 'Grievance Updated',
          message: `Your grievance "${grievance.title}" has been updated. ${commentText}.`,
          type: 'info',
          read: false,
          createdAt: serverTimestamp(),
          relatedGrievanceId: id,
          relatedGrievanceTitle: grievance.title,
        });
      }

      setGrievance({
        ...grievance,
        ...(newStatus && { status: newStatus }),
        ...(newPriority && { priority: newPriority })
      });
      setNewStatus('');
      setNewPriority('');
      toast.success('Grievance updated successfully');
    } catch (error) {
      toast.error('Failed to update grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !id) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        grievanceId: id,
        userId: currentUser?.uid,
        userName: userData?.displayName,
        userRole: userData?.role,
        comment: newComment.trim(),
        isStatusUpdate: false,
        createdAt: serverTimestamp(),
      });

      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!grievance) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Grievance not found</p>
          <Button variant="link" onClick={() => navigate('/community')}>
            Back to Community
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[grievance.status];
  const priorityConfig = PRIORITY_CONFIG[grievance.priority];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{grievance.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={grievance.status.replace('_', '-') as any}>
                {statusConfig.label}
              </Badge>
              <Badge variant={grievance.priority as any}>
                {priorityConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Details */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-foreground">{grievance.description}</p>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{grievance.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{grievance.createdAt ? format(grievance.createdAt, 'PPp') : 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{grievance.submittedByName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{grievance.contactPhone}</span>
              </div>
            </div>

            <Separator />

            {/* Departments */}
            <div>
              <h3 className="text-sm font-medium mb-2">Assigned Departments</h3>
              <div className="flex flex-wrap gap-2">
                {grievance.departments.map((dept) => (
                  <div key={dept} className="flex items-center gap-1 text-xs bg-muted px-3 py-1.5 rounded-full">
                    <Building2 className="w-3 h-3" />
                    {dept}
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            {grievance.imageUrls && grievance.imageUrls.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Attached Images
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grievance.imageUrls.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Update (Department/Admin only) */}
        {canUpdateStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as GrievanceStatus)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Update Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleUpdate} disabled={(!newStatus && !newPriority) || submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity & Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.commentId} className={`p-3 rounded-lg ${comment.isStatusUpdate ? 'bg-accent' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <Badge variant="outline" className="text-xs">{comment.userRole}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {comment.createdAt && formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button size="icon" onClick={handleCommentSubmit} disabled={!newComment.trim() || submitting}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
