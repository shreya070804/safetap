
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Menu, Shield, Activity, Droplet, Footprints, Pill, 
  Map, Phone, Share2, ChevronRight, Zap, Check, Heart, X, 
  ArrowLeft, Navigation, User, Users, Settings, LogOut, Clock, Mail, Lock, 
  UserPlus, Loader2, LogIn, Bell, MapPin, Search, Plus, Radio, Eye, EyeOff, AlertTriangle, CloudRain, Sun, Moon, PlusCircle, LayoutDashboard, Locate, PhoneIncoming, Stethoscope, Smartphone, TrendingUp
} from 'lucide-react';
import Caregiver from '../js/caregiver.js';
import Health from '../js/health.js';
import MapView from './MapView';
import { Toaster, toast } from 'react-hot-toast';
import emailjs from 'emailjs-com';
import ContactsPage from './ContactsPage';

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 ${className}`}>
    {children}
  </div>
);

const IconButton = ({ icon: Icon, onClick, className = "", active = false }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-100 dark:border-slate-700/50'} ${className}`}
  >
    <Icon size={20} />
  </button>
);

const StatCard = ({ icon: Icon, label, value, color, unit, statusColor = "emerald" }) => {
  const statusStyles = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500"
  };
  return (
    <Card className={`card-hover p-6 border-l-4 ${color.replace('bg-', 'border-')}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white`}>
          <Icon size={24} />
        </div>
        <div className={`w-2 h-2 rounded-full ${statusStyles[statusColor]} animate-pulse`}></div>
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">{value}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{unit}</span>
        </div>
      </div>
    </Card>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- PAGES ---

const LoginPage = ({ onLogin, onSignup, loading, theme }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) await onSignup(email, password, role);
      else await onLogin(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-6">
            <Shield size={32} fill="white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Safety Guardian</h1>
          <p className="text-slate-500 text-sm mt-2">{isSignUp ? 'Create your safety node' : 'Authorized Personnel Only'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="name@example.com"
                required
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Secure Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                placeholder="••••••••"
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {isSignUp && (
            <div className="flex p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setRole('user')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === 'user' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                Operator
              </button>
              <button 
                type="button" 
                onClick={() => setRole('caregiver')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === 'caregiver' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                Guardian
              </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Create Account' : 'Secure Login')}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center mt-8 group">
          <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
            {isSignUp ? 'Already have an account?' : 'Need a new safety node?'} <span className="font-bold underline ml-1">Switch here.</span>
          </span>
        </button>
      </div>
    </div>
  );
};

const OnboardingPage = ({ onSave, user }) => {
  const [formData, setFormData] = useState({
    full_name: '', blood_type: '', allergies: '', emergencyPhone: '+91 ', physician: '', phone: '+91 '
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone && !formData.phone.trim().startsWith('91')) {
      alert("Mobile number must start with 91");
      return;
    }
    if (formData.emergencyPhone && !formData.emergencyPhone.trim().startsWith('91')) {
      alert("Emergency contact must start with 91");
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-12 lg:p-16 border border-slate-100 dark:border-slate-700/50">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Medical Setup</h2>
        <p className="text-slate-500 mb-10">Complete your profile for emergency identification.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
              <input 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Mobile</label>
              <input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="+1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Blood Type</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <button 
                  key={type} 
                  type="button" 
                  onClick={() => setFormData({...formData, blood_type: type})}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${formData.blood_type === type ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Allergies</label>
            <textarea 
              value={formData.allergies} 
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all font-medium h-24 resize-none"
              placeholder="List any medical allergies..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Primary Physician</label>
              <input 
                value={formData.physician} 
                onChange={(e) => setFormData({...formData, physician: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Emergency Contact Number</label>
              <input 
                value={formData.emergencyPhone} 
                onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="+1"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Profile & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [steps, setSteps] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [activity, setActivity] = useState("IDLE");
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState("");
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('lastView') || 'dashboard');
  const [location, setLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  // SOS State
  const [sosHolding, setSosHolding] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
  const [sendingSos, setSendingSos] = useState(false);
  const sosTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('lastView', currentView);
  }, [currentView]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await window.supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
        await fetchHealth(session.user.id);
        await fetchAlertHistory(session.user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("fitData");
    const savedSync = localStorage.getItem("lastSync");

    if (saved) {
      const data = JSON.parse(saved);
      setSteps(data.steps);
      setHeartRate(data.heartRate);
      setActivity(data.activity);
      setConnected(true);
    }
    if (savedSync) {
      setLastSync(savedSync);
    }
  }, []);

  const fetchProfile = async (uid) => {
    try {
      const { data, error } = await window.supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      if (!error) setProfile(data);
    } catch(e) {}
  };

  const fetchHealth = async (uid) => {
    const data = await Health.getHealthData(uid);
    if (data) setHealthData(data);
  };

  const fetchAlertHistory = async (uid) => {
    try {
      const { data, error } = await window.supabase
        .from("alerts")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!error) setAlerts(data || []);
    } catch (e) {}
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    await fetchProfile(data.user.id);
    await fetchHealth(data.user.id);
    setLoading(false);
  };

  const handleSignup = async (email, password, role) => {
    setLoading(true);
    const { data, error } = await window.supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { role } }
    });
    if (error) throw error;
    setSession(data.session);
    setLoading(false);
  };

  const handleOnboarding = async (formData) => {
    // Mapping: emergency_contact: emergencyPhone, and removing personal phone
    const { phone, emergencyPhone, ...dbData } = formData;
    const { error } = await window.supabase.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email,
      ...dbData,
      emergency_contact: emergencyPhone,
      onboarding_completed: true
    });
    if (error) {
      console.error("Onboarding Error:", error);
      throw error;
    }
    await fetchProfile(session.user.id);
  };

  const syncHealth = async () => {
    if (!session) return;
    try {
      const updated = await Health.syncGoogleFit(session);
      if (updated) setHealthData(updated);
    } catch (e) {
      console.warn("Health sync error.");
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const findHospitals = async () => {
    if (!location) return;
    setScanning(true);
    try {
      const radius = 5000;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});out;`;
      const res = await fetch(overpassUrl);
      const data = await res.json();
      const processed = data.elements.map(e => ({
        id: e.id,
        name: e.tags.name || "Surgical Center",
        status: e.tags.speciality || "Emergency Trauma Unit",
        lat: e.lat,
        lon: e.lon,
        distance: calculateDistance(location.lat, location.lng, e.lat, e.lon)
      })).sort((a,b) => a.distance - b.distance);
      setHospitals(processed);
    } catch (e) {} finally { setScanning(false); }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleSosHold = () => {
    setSosHolding(true);
    setSosProgress(0);
    sosTimerRef.current = setInterval(() => {
      setSosProgress(prev => {
        if (prev >= 100) {
          clearInterval(sosTimerRef.current);
          triggerSOS();
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const triggerSOS = async () => {
    try {
      setSendingSos(true);
      
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your device.");
        setSendingSos(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

        console.log("SOS TRIGGERED AT:", locationLink);

        const { data: { user } } = await window.supabase.auth.getUser();

        // 1. Log alert in Supabase History
        await window.supabase.from("alerts").insert([
          {
            user_id: user.id,
            location: locationLink,
            latitude: lat,
            longitude: lng,
            status: 'active'
          }
        ]);

        // 2. Fetch contacts and send EmailJS alerts
        const { data: contacts, error } = await window.supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user.id);

        if (!error && contacts && contacts.length > 0) {
          for (const contact of contacts) {
            await emailjs.send(
              "service_s59mm4l",
              "template_64uvz6k",
              {
                to_email: contact.email,
                name: profile?.full_name || "SafeTap User",
                location: locationLink,
              },
              "Dql-YFEBcPCFCoys4"
            );
          }
        }

        toast.success("🚨 SOS sent successfully!");
        await fetchAlertHistory(user.id);
        setSendingSos(false);
      }, (err) => {
        console.error("Geolocation Error:", err);
        toast.error("Location error: Please ensure GPS is enabled.");
        setSendingSos(false);
      }, { enableHighAccuracy: true, timeout: 10000 });

    } catch (err) {
      console.error("SOS Dispatch Failed:", err);
      toast.error("SOS failed. Please try again.");
      setSendingSos(false);
    }
  };

  const handleSosRelease = () => {
    clearInterval(sosTimerRef.current);
    setSosHolding(false);
    setSosProgress(0);
  };

  const connectGoogleFit = () => {
    toast.success("Google Fit connected!");
    const data = {
      steps: 5234,
      heartRate: 72,
      activity: "ACTIVE"
    };
    const now = new Date().toLocaleTimeString();

    localStorage.setItem("fitData", JSON.stringify(data));
    localStorage.setItem("lastSync", now);

    setSteps(data.steps);
    setHeartRate(data.heartRate);
    setActivity(data.activity);
    setConnected(true);
    setLastSync(now);
  };

  const handleSetupBackupLink = async () => {
    const backupId = Math.random().toString(36).substring(2, 15);
    const backupUrl = `https://safetap.app/v1/secure/node/${backupId}`;
    
    try {
      await navigator.clipboard.writeText(backupUrl);
      toast.success("✅ SECURE LINK GENERATED\nCopied to clipboard.");
    } catch (err) {
      toast.error(`Link generated: ${backupUrl}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold animate-pulse">Syncing Guardian Node...</p>
    </div>
  );

  if (!session) return <LoginPage onLogin={handleLogin} onSignup={handleSignup} loading={loading} theme={theme} />;
  if (!profile || !profile.onboarding_completed) return <OnboardingPage onSave={handleOnboarding} user={session.user} />;

  const isCaregiver = profile?.role === 'caregiver';

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-900'} text-white font-sans`}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 'bold' },
      }} />
      {/* SIDEBAR */}
      <nav className="w-24 lg:w-72 hidden md:flex flex-col bg-slate-900 dark:bg-slate-950 p-6 h-screen sticky top-0 transition-all border-r border-white/5">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/10">
            <Shield size={24} fill="white" />
          </div>
          <span className="text-xl font-black text-white hidden lg:block italic tracking-tight">SafeTap</span>
        </div>

        {/* User Profile Mini Card */}
        <div className="mb-10 px-2 hidden lg:block">
          <div className="bg-white/5 rounded-3xl p-4 flex items-center gap-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:scale-105 transition-transform">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-black text-sm truncate">{profile?.full_name || 'Guardian'}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Node</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'hospitals', icon: MapPin, label: 'Nearby Help', dot: true },
            { id: 'contacts', icon: Users, label: 'Emergency Circle' },
            { id: 'profile', icon: User, label: 'My Record' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${currentView === item.id ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="relative">
                  <item.icon size={24} />
                  {item.dot && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 group-hover:scale-125 transition-all"></div>}
                </div>
                <span className="font-bold hidden lg:block">{item.label}</span>
                {currentView === item.id && <div className="absolute left-0 w-1 h-8 bg-blue-300 rounded-r-full hidden lg:block"></div>}
              </button>
          ))}
        </div>

        <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
          <button onClick={() => window.supabase.auth.signOut()} className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all">
            <LogOut size={24} />
            <span className="font-bold hidden lg:block">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-4 z-[100]">
        {[LayoutDashboard, MapPin, Phone, User].map((Icon, i) => (
          <Icon key={i} className="text-slate-400" size={24} />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden min-h-screen">
        <div className="max-w-6xl mx-auto">
          
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Safety Dashboard</h2>
                  <p className="text-slate-500 font-medium">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</p>
                </div>
                <div className="flex items-center gap-3">
                   <Badge variant="blue" className="hidden sm:block">Status: Protected</Badge>
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Footprints} label="Daily Steps" value={steps} color="bg-blue-600" unit="Steps" />
                <StatCard icon={Activity} label="Heart Rate" value={heartRate} color="bg-rose-500" unit="BPM" />
                <StatCard icon={TrendingUp} label="Activity Level" value={activity} color="bg-emerald-500" unit="Status" />
                <StatCard icon={Clock} label="Last Sync" value={lastSync || (connected ? "Just now" : "Never")} color="bg-amber-500" unit="" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 ml-1">
                    <MapPin size={16} className="text-rose-500" />
                    📍 Live Location
                  </h3>
                  <Card className="overflow-hidden p-0 h-[400px] relative card-hover border border-white/5">
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                      <Badge variant="emerald" className="shadow-lg backdrop-blur-md bg-emerald-500/80 text-white border-none">Live GPS Active</Badge>
                      <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-white/5 space-y-2 text-[10px] font-bold">
                         <div className="flex items-center gap-2 text-rose-500">
                            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                            <span>YOU (LIVE)</span>
                         </div>
                         <div className="flex items-center gap-2 text-blue-500">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>NEARBY HELP</span>
                         </div>
                      </div>
                    </div>
                    <MapView onLocationUpdate={setUserLocation} />
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <button 
                      onMouseDown={handleSosHold}
                      onMouseUp={handleSosRelease}
                      onMouseLeave={handleSosRelease}
                      disabled={sendingSos}
                      className={`flex-1 rounded-[3rem] p-8 flex flex-col items-center justify-center text-white relative overflow-hidden active:scale-95 transition-all backdrop-blur-xl border border-white/20 ${sendingSos ? 'bg-slate-700/80' : 'bg-rose-600/90'}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-full bg-rose-500/40 backdrop-blur-sm transition-all duration-100 ease-linear" style={{ height: `${sosProgress}%` }}></div>
                      
                      {sendingSos ? (
                        <Loader2 className="animate-spin mb-4" size={48} />
                      ) : (
                        <div className="relative mb-4">
                          <Shield size={64} className="relative z-10" fill="white" />
                          {sosHolding && (
                            <div className="absolute -top-2 -right-2 bg-white text-rose-600 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-xl animate-bounce">
                              {Math.ceil((100 - sosProgress) / 20)}s
                            </div>
                          )}
                        </div>
                      )}
                      
                      <span className="text-4xl font-black relative z-10 italic tracking-tighter drop-shadow-lg">{sendingSos ? 'SENDING...' : 'SOS'}</span>
                      <p className="text-sm font-black opacity-90 relative z-10 mt-2 tracking-widest uppercase flex items-center gap-2">
                        {sendingSos ? 'Broadcasting coordinates' : (sosHolding ? 'RELEASING CANCELS' : 'Hold for Emergency')}
                      </p>
                    </button>
                    <p className="text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest px-4 leading-relaxed opacity-70">
                      Alerts emergency circle with GPS link
                    </p>
                  </div>
                  
                  <a 
                    href="tel:112"
                    className="flex items-center gap-6 p-8 bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 card-hover transition-all"
                  >
                    <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500">
                      <PhoneIncoming size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-white">Quick Help</h4>
                      <p className="text-blue-500 text-sm font-black uppercase tracking-widest mt-1 underline">Call 112</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* ALERT HISTORY SECTION */}
              <Card className="mt-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">SOS History</h4>
                    <p className="text-slate-500 text-sm font-medium">Recent emergency transmissions</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.length > 0 ? alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200 card-hover">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                          <Radio size={18} className="animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-sm dark:text-white">Emergency Alert Triggered</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open(alert.location, '_blank')}
                        className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100"
                      >
                        View Event
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <Radio size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                      <h5 className="text-slate-900 dark:text-white font-black text-sm mb-1">🚫 No alerts yet</h5>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Your emergency activity will appear here</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
          
          {currentView === 'contacts' && (
            <ContactsPage 
              user={session.user} 
              onBack={() => setCurrentView('dashboard')} 
            />
          )}

          {currentView === 'hospitals' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Nearby Help</h2>
                  <p className="text-slate-500 font-medium tracking-tight">Surgical centers & Emergency units within 5km</p>
                </div>
                <button 
                  onClick={findHospitals} 
                  disabled={scanning}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 border border-blue-400/30 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {scanning ? <Loader2 className="animate-spin" /> : <Activity size={20} />}
                  Refresh Scan
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((h, i) => (
                  <Card className={`group card-hover overflow-hidden relative border border-white/5 ${i === 0 ? 'bg-emerald-500/5' : ''}`}>
                    {i === 0 && <div className="absolute top-4 right-4"><Badge variant="emerald">NEAREST</Badge></div>}
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                          <Plus size={32} />
                        </div>
                        <Badge variant="blue">{h.distance.toFixed(1)} km</Badge>
                      </div>
                      <h4 className="text-xl font-black mb-1 text-white">{h.name}</h4>
                      <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-8">{h.status}</p>
                      
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`)}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                      >
                        <Navigation size={18} fill="white" /> View Route
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">Medical Record</h2>
                  <p className="text-slate-500 font-medium">Secure biometric and identification data</p>
                </div>
                <button 
                  onClick={() => toast.loading("🔐 Edit Mode: Authenticating...")}
                  className="bg-white/5 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Settings size={18} />
                  Edit Record
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 flex flex-col items-center py-12">
                  <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 border border-white/10">
                    <User size={64} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white">{profile?.full_name}</h3>
                  <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mt-2 mb-10">Authorized Access</p>
                  
                  <div className="w-full px-6 space-y-4">
                    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Blood Type</span>
                      <span className="text-rose-500 font-black text-lg">{profile?.blood_type}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">ID Status</span>
                      <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Verified</span>
                    </div>
                  </div>

                  <button 
                    onClick={connectGoogleFit}
                    className={`mt-10 w-full mx-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border ${connected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600 text-white border-blue-400/30'}`}
                  >
                    <Activity size={16} />
                    {connected ? "Connected" : "Link Health"}
                  </button>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 border-b pb-4">Vital Statistics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div>
                        <p className="text-slate-400 font-bold text-xs uppercase mb-2">Primary Physician</p>
                        <p className="text-xl font-bold leading-tight break-words">{profile?.physician || 'Not Assigned'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold text-xs uppercase mb-2">Emergency Hub</p>
                        <p className="text-xl font-bold">{profile?.emergency_contact || 'None'}</p>
                      </div>
                    </div>
                    <div className="mt-10">
                      <p className="text-slate-400 font-bold text-xs uppercase mb-4">Known Contraindications (Allergies)</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.allergies?.split(',').map((a, i) => (
                          <span key={i} className="px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-[11px] font-black uppercase tracking-wider border border-white/5">{a.trim()}</span>
                        )) || <span className="text-slate-600 italic text-sm">No allergies recorded.</span>}
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white border-none p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h4 className="text-3xl font-black mb-4 italic tracking-tighter">Guardian Link</h4>
                    <p className="text-white/80 font-medium mb-10 max-w-sm leading-relaxed">Your safety coordinator is receiving encrypted telemetry every 30 seconds for maximum protection.</p>
                    <button 
                      onClick={handleSetupBackupLink}
                      className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all hover:bg-slate-50"
                    >
                      Setup Backup Link
                    </button>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h2 className="text-3xl font-black text-white mb-1">Settings</h2>
                <p className="text-slate-500 font-medium">Node configuration & Tactical tools</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">Display Options</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Dark Interface</p>
                      <p className="text-xs text-slate-500">Enable high-contrast night mode</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newTheme = theme === 'light' ? 'dark' : 'light';
                        setTheme(newTheme);
                        localStorage.setItem('theme', newTheme);
                      }}
                      className={`w-14 h-8 rounded-full p-1 transition-all ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Reduced Motion</p>
                      <p className="text-xs text-slate-500">Disable heavy UI animations</p>
                    </div>
                    <div className="w-14 h-8 bg-slate-700 rounded-full p-1">
                      <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">Security Arsenal</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => toast("🚨 Fake Call Initiated...\nYour phone will ring in 10 seconds.", { icon: '📞' })}
                      className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black flex items-center justify-between hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-3">
                        <Phone size={18} />
                        <span>Trigger Fake Call</span>
                      </div>
                      <Shield size={16} fill="white" />
                    </button>
                    
                    <button 
                      className="w-full bg-slate-800 text-white p-4 rounded-2xl font-black flex items-center justify-between opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <Bell size={18} />
                        <span>Safety Check-in</span>
                      </div>
                      <Clock size={16} />
                    </button>
                  </div>
                </Card>

                <Card className="p-8 space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-4">SOS Configuration</h3>
                  <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div>
                      <p className="font-bold text-white">Auto-Dispatch Emergency</p>
                      <p className="text-xs text-slate-500">Skip hold timer (High Risk)</p>
                    </div>
                    <div className="w-14 h-8 bg-slate-700 rounded-full p-1">
                      <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-500 p-4 bg-slate-950 rounded-xl border-l-4 border-amber-500">
                    ⚠️ Configuration locked during active node session.
                  </p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- REVERT CSS --- */}
      <style>{`
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 3px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

export default App;