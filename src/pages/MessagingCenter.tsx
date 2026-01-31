import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Info, 
  CheckCheck, 
  Clock, 
  MapPin, 
  Calendar 
} from "lucide-react";
import { format } from "date-fns";

// --- MOCK CHATS ---
const mockChats = [
  {
    id: "1",
    guestName: "Chidi Okoro",
    guestAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    lastMessage: "Is there a backup generator for the AC?",
    time: "10:45 AM",
    unread: 2,
    status: "Inquiry",
    listing: "Waterfront Ikoyi Penthouse",
    dates: "Dec 20 - Dec 27",
  },
  {
    id: "2",
    guestName: "Fatima Yusuf",
    guestAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    lastMessage: "Thanks for the check-in instructions!",
    time: "Yesterday",
    unread: 0,
    status: "Confirmed",
    listing: "Modern Studio Lekki",
    dates: "Jan 05 - Jan 10",
  },
];

const mockMessages = [
  { id: 1, sender: "guest", text: "Hello! I'm interested in the Ikoyi penthouse.", time: "09:30 AM" },
  { id: 2, sender: "host", text: "Hi Chidi! It's available. Would you like to know anything specific?", time: "09:45 AM" },
  { id: 3, sender: "guest", text: "Yes, I need to be sure about the power. Is there a generator?", time: "10:40 AM" },
  { id: 4, sender: "guest", text: "Is there a backup generator for the AC?", time: "10:45 AM" },
];

const MessagingCenter = () => {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <main className="flex-1 overflow-hidden flex pt-4 pb-4 container max-w-7xl gap-4">
        
        {/* LEFT: CHAT LIST */}
        <aside className="w-full md:w-80 lg:w-96 flex flex-col gap-4">

          {/* BACK BUTTON */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/host/dashboard")}
            className="justify-start hover:bg-white rounded-2xl font-black text-slate-400 hover:text-primary p-4"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Dashboard
          </Button>

          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search messages..." 
              className="pl-11 h-12 rounded-2xl border-none shadow-sm bg-white font-medium"
            />
          </div>

          <Card className="flex-1 border-none shadow-soft rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b bg-white">
              <h2 className="text-xl font-black text-slate-900">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-320px)] p-2 space-y-1">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                    selectedChat.id === chat.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={chat.guestAvatar} />
                    <AvatarFallback>{chat.guestName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className={`font-bold truncate ${selectedChat.id === chat.id ? "text-white" : "text-slate-900"}`}>
                        {chat.guestName}
                      </p>
                      <span className="text-[10px] opacity-70 font-bold">{chat.time}</span>
                    </div>
                    <p className={`text-xs truncate mb-2 ${selectedChat.id === chat.id ? "text-white/80" : "text-slate-500"}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && selectedChat.id !== chat.id && (
                      <Badge className="bg-primary text-white border-none h-5 px-1.5">{chat.unread}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        {/* CENTER: CHAT WINDOW */}
        <section className="hidden md:flex flex-1 flex-col gap-4">
          <Card className="flex-1 border-none shadow-soft rounded-[2.5rem] overflow-hidden flex flex-col bg-white">
            
            {/* Chat Header */}
            <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.guestAvatar} />
                </Avatar>
                <div>
                  <h3 className="font-black text-slate-900">{selectedChat.guestName}</h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              <div className="text-center">
                <Badge variant="outline" className="bg-white text-slate-400 border-slate-100 text-[10px] font-bold">TODAY</Badge>
              </div>

              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "host" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-5 py-3 rounded-[1.5rem] shadow-sm ${
                    msg.sender === "host" 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 justify-end ${msg.sender === "host" ? "text-white/50" : "text-slate-400"}`}>
                      <span className="text-[9px] font-bold">{msg.time}</span>
                      {msg.sender === "host" && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t">
              <div className="flex gap-3 bg-slate-100 p-2 rounded-2xl focus-within:ring-2 ring-primary transition-all">
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="border-none bg-transparent focus-visible:ring-0 font-medium"
                />
                <Button className="rounded-xl h-11 w-11 p-0 shadow-lg shadow-primary/30">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* RIGHT: BOOKING CONTEXT */}
        <aside className="hidden lg:block w-72 space-y-4">
          <Card className="border-none shadow-soft rounded-[2rem] overflow-hidden">
            <div className="h-32 w-full relative">
              <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400" className="h-full w-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge className="absolute top-4 right-4 bg-primary border-none">{selectedChat.status}</Badge>
            </div>
            <CardContent className="p-6">
              <h4 className="font-black text-slate-900 mb-4 leading-tight">{selectedChat.listing}</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg"><Calendar className="h-4 w-4 text-slate-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Dates</p>
                    <p className="text-xs font-bold text-slate-700">{selectedChat.dates}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-lg"><Info className="h-4 w-4 text-slate-500" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Payout</p>
                    <p className="text-xs font-bold text-slate-700">₦595,000</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <Button className="w-full rounded-xl font-bold bg-slate-900 hover:bg-primary">Accept Booking</Button>
                <Button variant="outline" className="w-full rounded-xl font-bold border-2">Decline</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft rounded-[2rem] p-6 bg-amber-50 border border-amber-100">
            <div className="flex gap-3 text-amber-700">
              <Clock className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                Response rate affects your search ranking. Try to reply within 1 hour!
              </p>
            </div>
          </Card>
        </aside>

      </main>
      <Footer />
    </div>
  );
};

export default MessagingCenter;