import { MapPin, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grievance, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface GrievanceCardProps {
  grievance: Grievance;
}

export function GrievanceCard({ grievance }: GrievanceCardProps) {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[grievance.status];
  const priorityConfig = PRIORITY_CONFIG[grievance.priority];

  const getStatusVariant = () => {
    const variantMap: Record<string, any> = {
      submitted: 'submitted',
      assigned: 'assigned',
      in_progress: 'in-progress',
      resolved: 'resolved',
      closed: 'closed',
      rejected: 'rejected',
    };
    return variantMap[grievance.status] || 'default';
  };

  const getPriorityVariant = () => {
    const variantMap: Record<string, any> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      urgent: 'urgent',
    };
    return variantMap[grievance.priority] || 'default';
  };

  const timeAgo = grievance.createdAt 
    ? formatDistanceToNow(new Date(grievance.createdAt), { addSuffix: true })
    : 'Recently';

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 animate-fade-in"
      onClick={() => navigate(`/grievance/${grievance.grievanceId}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2 flex-1">{grievance.title}</h3>
          <Badge variant={getPriorityVariant()} className="shrink-0">
            {priorityConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={getStatusVariant()}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {grievance.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {grievance.departments.slice(0, 2).map((dept) => (
            <div key={dept} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{dept}</span>
            </div>
          ))}
          {grievance.departments.length > 2 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              +{grievance.departments.length - 2} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{grievance.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {grievance.imageUrls && grievance.imageUrls.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {grievance.imageUrls.slice(0, 3).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-border shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
            {grievance.imageUrls.length > 3 && (
              <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                +{grievance.imageUrls.length - 3}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
