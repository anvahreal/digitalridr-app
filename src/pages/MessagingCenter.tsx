import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Search, Send, Phone, CheckCheck, Clock, MapPin, Calendar, ChevronLeft, ShieldCheck, MessageSquare
} from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

export default function MessagingCenter() {
  const navigate = useNavigate();
  const {
    conversations,
    messages,
    selectedChatId,
    setSelectedChatId,
    loading,
    sendMessage,
    currentUserId
  } = useMessages();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedChatId && conversations.length > 0) {
      const chatExists = conversations.find(c => c.id === location.state.selectedChatId);
      if (chatExists && selectedChatId !== location.state.selectedChatId) {
        setSelectedChatId(location.state.selectedChatId);
        setView("chat");
      }
    }
  }, [location.state, conversations, selectedChatId, setSelectedChatId]);

  const [view, setView] = useState<"list" | "chat">("list");
  const [newMessageText, setNewMessageText] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  const selectedChat = conversations.find(c => c.id === selectedChatId);

  const handleSend = async () => {
    if (!newMessageText.trim()) return;
    await sendMessage(newMessageText);
    setNewMessageText("");
  };

  const handleContactSupport = async () => {
    try {
      setSupportLoading(true);
      // Find Admin
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_admin', true) // Look for ANY admin
        .limit(1)
        .maybeSingle();

      if (!adminProfile) {
        toast.error("Support currently unavailable (Admin profile not found)");
        return;
      }

      if (adminProfile.id === currentUserId) {
        toast.error("You are the super admin.");
        return;
      }

      // Check if conversation exists
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(host_id.eq.${currentUserId},guest_id.eq.${adminProfile.id}),and(host_id.eq.${adminProfile.id},guest_id.eq.${currentUserId})`)
        .limit(1)
        .maybeSingle();

      let conversationId = existingConvs?.id;

      if (!conversationId) {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            host_id: adminProfile.id,
            guest_id: currentUserId
          })
          .select()
          .single();

        if (error) throw error;
        conversationId = newConv.id;
      }

      setSelectedChatId(conversationId);
      setView("chat");

    } catch (err) {
      console.error("Support Error:", err);
      toast.error("Failed to connect to support");
    } finally {
      setSupportLoading(false);
    }
  };

  return (

    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />

      <main className="flex-1 flex container max-w-7xl gap-4 p-0 md:p-4 overflow-hidden relative">

        {/* --- 1. CHAT LIST (Sidebar) --- */}
        <aside className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col gap-3 p-4 md:p-0 transition-all duration-300",
          view === "chat" ? "hidden md:flex" : "flex"
        )}>
          <Button
            variant="ghost"
            onClick={() => navigate("/host/dashboard")}
            className="w-fit hover:bg-accent/50 rounded-2xl font-black text-muted-foreground p-2"
          >
            <ChevronLeft className="mr-1 h-5 w-5" /> Dashboard
          </Button>

          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-11 h-12 rounded-2xl border-none shadow-sm bg-card font-medium focus-visible:ring-primary text-foreground"
            />
          </div>

          <div className="px-4">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/5 font-bold"
              onClick={handleContactSupport}
              disabled={supportLoading}
            >
              <MessageSquare className="h-4 w-4" />
              {supportLoading ? "Connecting..." : "Contact Support"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <h2 className="px-2 text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">My Messages</h2>
            {loading ? <p className="p-4 text-muted-foreground text-sm">Loading...</p> : conversations.length === 0 ? <p className="p-4 text-muted-foreground text-sm">No conversations yet.</p> :
              conversations.map((chat) => (
                <Card
                  key={chat.id}
                  onClick={() => { setSelectedChatId(chat.id); setView("chat"); }}
                  className={cn(
                    "border-none shadow-sm rounded-2xl cursor-pointer transition-all p-4 flex items-start gap-4",
                    selectedChatId === chat.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent/50 text-foreground"
                  )}
                >
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-background/20">
                    <AvatarImage src={chat.other_user?.avatar_url} />
                    <AvatarFallback>{chat.other_user?.full_name[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold truncate text-sm">{chat.other_user?.full_name}</p>
                      <span className="text-[10px] font-bold opacity-70">
                        {chat.updated_at ? format(new Date(chat.updated_at), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", selectedChatId === chat.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {chat.last_message || "New Conversation"}
                    </p>
                    <p className="text-[10px] mt-1 opacity-60 font-medium truncate">{chat.listing?.title}</p>
                  </div>
                </Card>
              ))}
          </div>
        </aside>

        {/* --- 2. MAIN CHAT AREA --- */}
        <section className={cn(
          "flex-1 flex flex-col transition-all duration-300 bg-background md:bg-transparent h-full md:h-auto",
          view === "list" ? "hidden md:flex" : "flex"
        )}>
          {selectedChat ? (
            <Card className="flex-1 border-none md:shadow-sm rounded-none md:rounded-[2.5rem] overflow-hidden flex flex-col bg-card">

              {/* Header */}
              <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2 rounded-full" onClick={() => setView("list")}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={selectedChat.other_user?.avatar_url} />
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-black text-foreground truncate text-sm md:text-base leading-none mb-1">{selectedChat.other_user?.full_name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online</p>
                    </div>
                  </div>
                </div>

                {/* MOBILE ACTIONS */}
                <div className="flex items-center gap-2">
                  {/* Cleaned up unused actions */}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-muted/20">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-card px-4 py-1.5 rounded-full shadow-sm border border-border">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Payments are held securely by the platform</span>
                  </div>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-[1.4rem] shadow-sm",
                        isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card text-foreground rounded-tl-none border border-border"
                      )}>
                        <p className="text-[13px] md:text-sm font-medium leading-relaxed">{msg.content}</p>
                        <div className={cn("flex items-center gap-1 mt-1.5 justify-end opacity-50")}>
                          <span className="text-[9px] font-bold tracking-tight">{format(new Date(msg.created_at), 'HH:mm')}</span>
                          {isMe && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-card border-t border-border safe-bottom">
                <div className="flex gap-2 items-center bg-muted p-1.5 rounded-[1.5rem] focus-within:ring-2 ring-primary/10 transition-all">
                  <Input
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSend();
                    }}
                    placeholder="Type a message..."
                    className="border-none bg-transparent focus-visible:ring-0 font-medium placeholder:text-muted-foreground h-10 text-foreground"
                  />
                  <Button onClick={handleSend} className="rounded-2xl h-10 w-10 p-0 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90" disabled={!newMessageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-muted/10 rounded-[2.5rem] text-center p-8">
              <div className="h-20 w-20 bg-card rounded-full flex items-center justify-center shadow-lg mb-4 text-primary">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Select a Conversation</h3>
              <p className="text-muted-foreground max-w-xs">Participate in chats with your guests or hosts safely here.</p>
            </div>
          )}
        </section>

        {/* --- 3. DESKTOP SIDEBAR --- */}
        {selectedChat && (
          <aside className="hidden lg:block w-72 space-y-4 shrink-0 overflow-y-auto">
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-card">
              <div className="h-28 w-full relative">
                {selectedChat.listing?.images && selectedChat.listing.images.length > 0 ? (
                  <img src={selectedChat.listing.images[0]} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-3 right-3 bg-primary border-none">{selectedChat.status || 'Active'}</Badge>
              </div>
              <CardContent className="p-5">
                <h4 className="font-black text-foreground mb-4 leading-tight text-sm">{selectedChat.listing?.title || "Direct Message"}</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-xl"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /></div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Status</p>
                      <p className="text-[11px] font-bold text-foreground capitalize">{selectedChat.status || 'Active'}</p>
                    </div>
                  </div>

                  {/* Duration Display */}
                  {selectedChat.check_in && selectedChat.check_out && (
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-xl"><Clock className="h-3.5 w-3.5 text-muted-foreground" /></div>
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Duration</p>
                        <p className="text-[11px] font-bold text-foreground">
                          {differenceInDays(new Date(selectedChat.check_out), new Date(selectedChat.check_in))} nights
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {format(new Date(selectedChat.check_in), "d MMM")} - {format(new Date(selectedChat.check_out), "d MMM")}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedChat.total_price && (
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-xl"><Wallet className="h-3.5 w-3.5 text-muted-foreground" /></div>
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase leading-none">Total</p>
                        <p className="text-[11px] font-bold text-foreground leading-tight">{formatNaira(selectedChat.total_price)}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-5 border-t border-border space-y-2">
                  {/* Actions could be interactive later */}
                  <Button
                    onClick={() => selectedChat.listing_id && navigate(`/listing/${selectedChat.listing_id}`)}
                    disabled={!selectedChat.listing_id}
                    className="w-full rounded-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 py-6 transition-all"
                  >
                    View Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        )}

      </main>
    </div>
  );
}