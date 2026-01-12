import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import AcademyOverviewPage from "@/pages/academy-overview";
import WeeklyPage from "@/pages/weekly-page";
import TipsPage from "@/pages/tips-page";
import PostDetailPage from "@/pages/post-detail";
import AdminPage from "@/pages/admin";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      </Route>
      <Route path="/register">
        <AuthRoute>
          <RegisterPage />
        </AuthRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <MainLayout>
            <AcademyOverviewPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/week/:week">
        <ProtectedRoute>
          <MainLayout>
            <WeeklyPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tips">
        <ProtectedRoute>
          <MainLayout>
            <TipsPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/post/:id">
        <ProtectedRoute>
          <MainLayout>
            <PostDetailPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <AdminRoute>
          <MainLayout>
            <AdminPage />
          </MainLayout>
        </AdminRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
