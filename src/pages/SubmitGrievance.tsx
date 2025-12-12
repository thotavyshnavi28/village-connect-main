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
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Phone, Loader2, ChevronDown, Sparkles, X, Camera } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';

export default function SubmitGrievance() {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departments: [] as Department[],
    priority: 'medium' as Priority,
    location: '',
    contactPhone: userData?.phoneNumber || '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        toast.error('You can only upload up to 5 images');
        return;
      }

      setSelectedFiles(prev => [...prev, ...files]);

      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      // Revoke the URL being removed to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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
      // 0. Import all needed utils and lib functions dynamically to save initial load if possible, 
      // but here we just import normally at top, however for 'analyzePriority' we did dynamic import before. 
      // We will stick to that pattern if desired, or just import everything.
      const { analyzePriority } = await import('@/lib/gemini');
      const { resizeImage } = await import('@/lib/imageUtils');
      const { notifyGrievanceSubmission, createNotification } = await import('@/lib/notificationUtils');

      // 1. Resize Images (Performance Optimization) - Parallel
      const resizedImages = await Promise.all(
        selectedFiles.map(file => resizeImage(file, 1280)) // Resize to max 1280px width
      );

      // 2. Prepare Parallel Tasks: AI Analysis & Image Upload

      // Task A: Prepare Base64 for AI & Run Analysis
      const aiAnalysisTask = (async () => {
        // Convert to base64
        const base64Images = await Promise.all(resizedImages.map(blob => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Content = base64String.split(',')[1];
              resolve(base64Content);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }));

        toast.info("Analyzing grievance priority with AI...");

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AI analysis timed out')), 8000);
        });

        try {
          return await Promise.race([
            analyzePriority(formData.title, formData.description, base64Images),
            timeoutPromise
          ]) as Priority;
        } catch (error) {
          console.warn("AI Analysis failed/timed out:", error);
          return 'medium'; // Fallback
        }
      })();

      // Task B: Upload Images to Firebase (Parallel with AI)
      const uploadTask = Promise.all(resizedImages.map(async (blob, index) => {
        const originalName = selectedFiles[index].name;
        const timestamp = Date.now();
        const storageRef = ref(storage, `grievances/${currentUser.uid}/${timestamp}_${originalName}`);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      }));

      // 3. Execute Parallel Tasks
      const [aiPriority, uploadedImageUrls] = await Promise.all([aiAnalysisTask, uploadTask]);

      if (aiPriority !== 'medium') {
        toast.success(`AI assigned priority: ${PRIORITY_CONFIG[aiPriority].label}`);
      }

      // 4. Create Grievance Document
      const docRef = await addDoc(collection(db, 'grievances'), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        departments: formData.departments,
        status: 'submitted',
        priority: aiPriority,
        location: formData.location.trim(),
        imageUrls: uploadedImageUrls,
        submittedBy: currentUser.uid,
        submittedByName: userData.displayName,
        contactPhone: formData.contactPhone,
        contactEmail: userData.email,
        assignedTo: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Send Notifications (Parallel)
      // Notify the submitter (Citizen)
      const notifyUserPromise = createNotification(
        currentUser.uid,
        'Grievance Submitted',
        `Your grievance "${formData.title}" has been successfully submitted.`,
        'success',
        docRef.id,
        formData.title
      );

      // Notify Admins & Departments
      const notifyOfficialsPromise = notifyGrievanceSubmission(
        docRef.id,
        formData.title,
        formData.departments,
        userData.displayName
      );

      await Promise.all([notifyUserPromise, notifyOfficialsPromise]);

      toast.success('Grievance submitted successfully!');
      navigate('/community');
    } catch (error) {
      console.error('Error submitting grievance:', error);
      toast.error('Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentToggle = (dept: Department) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
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
                    <label
                      key={dept}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.departments.includes(dept)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-primary rounded focus:ring-primary"
                        checked={formData.departments.includes(dept)}
                        onChange={() => handleDepartmentToggle(dept)}
                      />
                      <span className="text-sm font-medium">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
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

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Images (optional)</Label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {selectedFiles.length < 5 && (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground text-center px-2">Tap to add photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 photos to help illustrate the issue. Images help AI analyze priority better.
                </p>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Grievance
              </Button>
            </form >
          </CardContent >
        </Card >
      </div >
    </AppLayout >
  );
}
