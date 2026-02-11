import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import ListingDetail from "./pages/ListingDetail";
import Auth from "./pages/Auth";
import Host from "./pages/Host";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/UserDashboard";
import HostDashboard from "./pages/HostDashboard";
import CreateListing from "./pages/CreateListing";
import Checkout from "./pages/Checkout";
import MessagingCenter from "./pages/MessagingCenter";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LearnMore from "./pages/LearnMore";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/learn-more" element={<LearnMore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/host/create-listing" element={<CreateListing />} />
              <Route path="/host/edit-listing/:id" element={<CreateListing />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/messages" element={<MessagingCenter />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/host" element={<Host />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
