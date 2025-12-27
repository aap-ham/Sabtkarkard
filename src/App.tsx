import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Employers from "./pages/Employers";
import WorkDays from "./pages/WorkDays";
import Reports from "./pages/Reports";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import { useStatusBar } from "./hooks/useStatusBar";
const queryClient = new QueryClient();

const AppContent = () => {
  const { resolvedTheme } = useTheme();
  
  // Configure status bar based on current theme
  useStatusBar(resolvedTheme === 'dark');
  
  return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/employers" element={<Layout><Employers /></Layout>} />
          <Route path="/work-days" element={<Layout><WorkDays /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/payments" element={<Layout><Payments /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
  );
};
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppContent />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
