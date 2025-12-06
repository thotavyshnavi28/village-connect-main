import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import SubmitGrievance from "./pages/SubmitGrievance";
import GrievanceDetail from "./pages/GrievanceDetail";
import MyGrievances from "./pages/MyGrievances";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            
            <Route path="/submit" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SubmitGrievance />
              </ProtectedRoute>
            } />
            
            <Route path="/grievance/:id" element={
              <ProtectedRoute>
                <GrievanceDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/my-grievances" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyGrievances />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['department']}>
                <DepartmentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
