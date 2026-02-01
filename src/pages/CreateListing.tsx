import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, Camera, MapPin, Search, 
  CheckCircle2, Plus, Minus, Home, Sparkles 
} from "lucide-react";

const CreateListing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const totalSteps = 3;

  const locations = ["Ikoyi", "Victoria Island", "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Ikeja GRA", "Magodo"];
  const filteredLocations = locations.filter(l => l.toLowerCase().includes(search.toLowerCase()));

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                  step >= s ? "bg-slate-900 w-10" : "bg-slate-200"
                }`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Step {step}/3</span>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 pb-32">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* STEP 1: BASICS & LOCATION SEARCH */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">The Basics</h1>
                <p className="text-slate-500 font-medium text-sm">Where is your luxury space located?</p>
              </header>

              <Card className="border-none shadow-soft rounded-[2.5rem] p-6 space-y-6 bg-white">
                <FormInput label="Listing Title" placeholder="e.g. Waterfront VI Penthouse" />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Search District</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search Lagos districts..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-11 pr-4 font-bold text-slate-900 focus:ring-2 focus:ring-slate-200 transition-all text-sm"
                    />
                  </div>
                  {search && (
                    <div className="bg-slate-50 rounded-2xl p-2 mt-2 border border-slate-100 max-h-40 overflow-y-auto">
                      {filteredLocations.map(loc => (
                        <button 
                          key={loc}
                          onClick={() => { setSearch(loc); }}
                          className="w-full text-left p-3 hover:bg-white rounded-xl text-sm font-bold text-slate-700 transition-colors"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <FormInput label="Price per Night (₦)" placeholder="150,000" type="number" />
              </Card>
            </div>
          )}

          {/* STEP 2: SPACE DETAILS - REFRESHED MOBILE GRID */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Space Details</h1>
                <p className="text-slate-500 font-medium text-sm">Define the capacity of your property.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                <Counter label="Bedrooms" />
                <Counter label="Bathrooms" />
                <Counter label="Max Guests" />
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Key Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["24/7 Power", "Fast WiFi", "Swimming Pool", "Private Chef", "In-house Gym", "Armed Security"].map((item) => (
                    <AmenityButton key={item} label={item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO UPLOAD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Visuals</h1>
                <p className="text-slate-500 font-medium text-sm">Upload at least 5 photos for better visibility.</p>
              </header>

              <div 
                className="group border-4 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center bg-white hover:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => alert('Gallery Open')}
              >
                <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center mb-4 shadow-xl">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <p className="font-black text-slate-900">Add Property Photos</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Drag and drop or tap to browse</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t p-4 pb-8 md:pb-6 z-50">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="rounded-2xl h-14 px-6 border-2 font-black text-xs uppercase"
            >
              Back
            </Button>
          )}
          <Button 
            onClick={step === totalSteps ? () => navigate("/host/dashboard") : nextStep}
            className={`flex-1 rounded-2xl h-14 font-black shadow-xl transition-all active:scale-95 ${
              step === totalSteps ? 'bg-[#FF7A00] text-white hover:bg-orange-600' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {step === totalSteps ? "Finish & Launch" : "Next Step"}
          </Button>
        </div>
      </footer>
    </div>
  );
};

// --- MOBILE REFINED HELPERS ---

const FormInput = ({ label, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-slate-200 transition-all text-sm" 
    />
  </div>
);

const Counter = ({ label }: { label: string }) => {
  const [val, setVal] = useState(1);
  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] shadow-soft border border-slate-50">
      <span className="font-black text-slate-900 text-sm tracking-tight">{label}</span>
      <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl">
        <button onClick={() => setVal(Math.max(1, val - 1))} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-900 font-bold"><Minus className="h-4 w-4" /></button>
        <span className="w-4 text-center font-black text-sm text-slate-900">{val}</span>
        <button onClick={() => setVal(val + 1)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-900 shadow-sm text-white font-bold"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

const AmenityButton = ({ label }: { label: string }) => {
  const [selected, setSelected] = useState(false);
  return (
    <button 
      onClick={() => setSelected(!selected)}
      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 font-black text-xs uppercase tracking-tight ${
        selected ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-white text-slate-400'
      }`}
    >
      {label}
      <CheckCircle2 className={`h-4 w-4 ${selected ? 'text-[#FF7A00]' : 'text-slate-100'}`} />
    </button>
  );
};

export default CreateListing;