import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft, Camera, MapPin, Search,
  CheckCircle2, Plus, Minus, Home, Sparkles, Loader2, X
} from "lucide-react";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
import { AMENITIES } from "@/constants/amenities";

const CreateListing = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Check if editing
  const isEditMode = !!id;

  const { user, updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const totalSteps = 3;

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: [] as string[],
    amenities: [] as string[],
    images: [] as string[], // Stores public URLs
    video_url: "",
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const locations = ["Ikoyi", "Victoria Island", "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Ikeja GRA", "Magodo", "Yaba", "Surulere"];
  const filteredLocations = locations.filter(l => l.toLowerCase().includes(locationSearch.toLowerCase()));

  // Fetch data if editing
  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title,
            location: data.location,
            price: data.price_per_night.toString(),
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            guests: data.max_guests,
            amenities: data.amenities || [],
            amenities: data.amenities || [],
            images: data.images || [],
            video_url: data.video_url || ""
          });
        }
      } catch (err: any) {
        toast.error("Failed to load listing details");
        navigate("/host/dashboard");
      } finally {
        setFetching(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast.error("You must be logged in to upload images.");
      return;
    }

    setUploading(true);
    try {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success("Images uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const saveListing = async () => {
    if (!user) {
      toast.error("You must be logged in to host.");
      return;
    }
    if (!formData.title || !formData.location || !formData.price || formData.images.length === 0) {
      toast.error("Please fill in all required fields and upload at least one photo.");
      return;
    }

    setLoading(true);
    try {
      const priceValue = parseInt(formData.price.toString().replace(/[^0-9]/g, ''));

      const payload = {
        title: formData.title,
        location: formData.location,
        price_per_night: priceValue,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        max_guests: formData.guests,
        amenities: formData.amenities,
        images: formData.images,
        host_id: user.id,
        city: "Lagos",
        host_id: user.id,
        city: "Lagos",
        country: "Nigeria",
        video_url: formData.video_url,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('listings')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        toast.success("Listing updated successfully!");
      } else {
        const { error } = await supabase
          .from('listings')
          .insert({ ...payload, rating: 0, review_count: 0, is_superhost: false });
        if (error) throw error;

        // Update profile to be a host
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_host: true })
          .eq('id', user.id);

        if (profileError) console.error("Failed to update host status:", profileError);

        toast.success("Listing published successfully! You are now a host.");
      }

      navigate("/host/dashboard");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.price || !formData.location)) {
      toast.error("Please completely fill out the basics.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  if (fetching) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  // Host Approval Check
  if (user?.host_status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            {user?.host_status === 'pending' ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : <Home className="h-10 w-10 text-muted-foreground" />}
          </div>
          <h1 className="text-2xl font-black text-foreground">
            {user?.host_status === 'pending' ? 'Application Pending' : 'Become a Host'}
          </h1>
          <p className="text-muted-foreground">
            {user?.host_status === 'pending'
              ? "Your host application is currently under review by our admin team. Check back soon!"
              : "You need to be an approved host to list properties."}
          </p>
          {user?.host_status === 'none' || !user?.host_status ? (
            <Button
              onClick={async () => {
                try {
                  await updateProfile({ host_status: 'pending' });
                  toast.success("Application submitted! Pending approval.");
                } catch (e: any) {
                  toast.error(`Failed to apply: ${e.message || "Unknown error"}`);
                  console.error("Host Application Error:", e);
                }
              }}
              className="w-full font-bold"
            >
              Apply to Host
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => navigate('/')} className="w-full font-bold">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
      {/* HEADER */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full text-foreground hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step >= s ? "bg-primary w-10" : "bg-muted"
                  }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Step {step}/3</span>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 pb-32">
        <div className="max-w-xl mx-auto space-y-8">

          {/* STEP 1: BASICS & LOCATION SEARCH */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-foreground tracking-tighter">{isEditMode ? "Edit Listing" : "The Basics"}</h1>
                <p className="text-muted-foreground font-medium text-sm">Where is your luxury space located?</p>
              </header>

              <Card className="border-border shadow-soft rounded-[2.5rem] p-6 space-y-6 bg-card">
                <FormInput
                  label="Listing Title"
                  placeholder="e.g. Waterfront VI Penthouse"
                  value={formData.title}
                  onChange={(e: any) => handleInputChange("title", e.target.value)}
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Search District</label>
                  <div className="relative z-50">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={formData.location || "Search Lagos districts..."}
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full h-14 bg-muted border-none rounded-2xl pl-11 pr-4 font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground"
                    />
                    {locationSearch && (
                      <div className="bg-card rounded-2xl p-2 mt-2 border border-border max-h-40 overflow-y-auto shadow-2xl absolute w-full top-full left-0 z-50">
                        {filteredLocations.map(loc => (
                          <button
                            key={loc}
                            onClick={() => {
                              handleInputChange("location", loc);
                              setLocationSearch("");
                            }}
                            className="w-full text-left p-3 hover:bg-muted rounded-xl text-sm font-bold text-foreground transition-colors"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-2 mt-2 px-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{formData.location}</span>
                    </div>
                  )}
                </div>

                <FormInput
                  label="Price per Night (₦)"
                  placeholder="150,000"
                  type="number"
                  value={formData.price}
                  onChange={(e: any) => handleInputChange("price", e.target.value)}
                />
              </Card>
            </div>
          )}

          {/* STEP 2: SPACE DETAILS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-foreground tracking-tighter">Space Details</h1>
                <p className="text-muted-foreground font-medium text-sm">Define the capacity of your property.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                <Counter label="Bedrooms" value={formData.bedrooms} onChange={(v) => handleInputChange("bedrooms", v)} />
                <Counter label="Bathrooms" value={formData.bathrooms} onChange={(v) => handleInputChange("bathrooms", v)} />
                <Counter label="Max Guests" value={formData.guests} onChange={(v) => handleInputChange("guests", v)} />
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Key Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AMENITIES.map((item) => (
                    <AmenityButton
                      key={item}
                      label={item}
                      selected={formData.amenities.includes(item)}
                      onClick={() => toggleAmenity(item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO UPLOAD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-foreground tracking-tighter">Visuals</h1>
                <h1 className="text-3xl font-black text-foreground tracking-tighter">Visuals & Tour</h1>
                <p className="text-muted-foreground font-medium text-sm">Upload photos and add a virtual tour.</p>
              </header>

              <label
                className={`group border-4 border-dashed border-border rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center bg-card transition-all cursor-pointer relative overflow-hidden ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-primary hover:bg-muted/50'}`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {uploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Camera className="h-8 w-8 text-primary" />}
                </div>
                <p className="font-black text-foreground">{uploading ? "Uploading..." : "Add Property Photos"}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Drag and drop or tap to browse</p>
              </label>

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 animate-in fade-in">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group border border-border">
                      <img src={url} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <FormInput
                  label="Virtual Tour URL (YouTube)"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e: any) => handleInputChange("video_url", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-2 ml-1">
                  Paste a YouTube link to show a virtual tour of your property.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 pb-8 md:pb-6 z-50">
        <div className="max-w-xl mx-auto flex gap-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={loading}
              className="rounded-2xl h-14 px-6 border-2 border-border font-black text-xs uppercase hover:bg-muted text-foreground"
            >
              Back
            </Button>
          )}
          <Button
            onClick={step === totalSteps ? saveListing : nextStep}
            disabled={loading || uploading}
            className="flex-1 rounded-2xl h-14 font-black shadow-xl transition-all active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Saving..." : "Publishing..."}</>
            ) : (
              step === totalSteps ? (isEditMode ? "Save Changes" : "Finish & Launch") : "Next Step"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
};

// --- HELPERS ---

const FormInput = ({ label, placeholder, type = "text", value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full h-14 bg-muted border-none rounded-2xl px-6 font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground"
    />
  </div>
);

const Counter = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => {
  return (
    <div className="flex items-center justify-between p-5 bg-card rounded-[2rem] shadow-none border border-border">
      <span className="font-black text-foreground text-sm tracking-tight">{label}</span>
      <div className="flex items-center gap-4 bg-muted p-1.5 rounded-xl">
        <button onClick={() => onChange(Math.max(1, value - 1))} className="h-8 w-8 flex items-center justify-center rounded-lg bg-card shadow-sm text-foreground font-bold hover:bg-muted/80 transition-colors"><Minus className="h-4 w-4" /></button>
        <span className="w-4 text-center font-black text-sm text-foreground">{value}</span>
        <button onClick={() => onChange(value + 1)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-foreground shadow-sm text-background font-bold hover:bg-foreground/90 transition-colors"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

const AmenityButton = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 font-black text-xs uppercase tracking-tight ${selected ? 'border-primary bg-primary text-white shadow-lg' : 'border-border bg-card text-muted-foreground hover:bg-muted'
        }`}
    >
      {label}
      <CheckCircle2 className={`h-4 w-4 ${selected ? 'text-white' : 'text-muted-foreground/30'}`} />
    </button>
  );
};

export default CreateListing;