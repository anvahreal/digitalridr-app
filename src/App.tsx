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
import HostWallet from "./pages/HostWallet";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/dashboard" element={<UserDashboard/>} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/host/create-listing" element={<CreateListing />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/messages" element={<MessagingCenter />} />
          <Route path="/host/wallet" element={<HostWallet />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/host" element={<Host />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
