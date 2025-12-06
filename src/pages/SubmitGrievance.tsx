import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, Department, Priority, PRIORITY_CONFIG } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Phone, Image, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departments: [] as Department[],
    priority: 'medium' as Priority,
    location: '',
    imageUrls: '',
    contactPhone: userData?.phoneNumber || '',
  });

  const handleDepartmentToggle = (dept: Department) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userData) {
      toast.error('Please sign in to submit a grievance');
      return;
    }

    if (formData.departments.length === 0) {
      toast.error('Please select at least one department');
      return;
    }

    setLoading(true);

    try {
      const imageUrlArray = formData.imageUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .slice(0, 5);

      await addDoc(collection(db, 'grievances'), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        departments: formData.departments,
        status: 'submitted',
        priority: formData.priority,
        location: formData.location.trim(),
        imageUrls: imageUrlArray,
        submittedBy: currentUser.uid,
        submittedByName: userData.displayName,
        contactPhone: formData.contactPhone,
        contactEmail: userData.email,
        assignedTo: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Grievance submitted successfully!');
      navigate('/community');
    } catch (error) {
      console.error('Error submitting grievance:', error);
      toast.error('Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Report an Issue</h1>
            <p className="text-sm text-muted-foreground">Help us improve your village</p>
          </div>
        </div>

        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  maxLength={1000}
                />
              </div>

              {/* Departments */}
              <div className="space-y-3">
                <Label>Select Department(s) *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <div
                      key={dept}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.departments.includes(dept)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                      onClick={() => handleDepartmentToggle(dept)}
                    >
                      <Checkbox
                        checked={formData.departments.includes(dept)}
                        onCheckedChange={() => handleDepartmentToggle(dept)}
                      />
                      <span className="text-sm font-medium">{dept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority Level *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {key === 'urgent' && <AlertCircle className="w-4 h-4 text-priority-urgent" />}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Where is the issue located?"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    className="pl-10"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div className="space-y-2">
                <Label htmlFor="imageUrls">Image URLs (optional)</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="imageUrls"
                    placeholder="Paste image URLs (one per line, max 5)"
                    className="pl-10"
                    rows={3}
                    value={formData.imageUrls}
                    onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 image URLs to help illustrate the issue
                </p>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Grievance
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
