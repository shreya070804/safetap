/**
 * Safety Guardian - Production Dashboard
 * Refined Visual Experience
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Menu, Shield, Activity, Droplet, Footprints, Pill, 
  Map, Phone, Share2, ChevronRight, Zap, Check, Heart, X, 
  ArrowLeft, Navigation, User, Users, Settings, LogOut, Clock, Mail, Lock, 
  UserPlus, Loader2, LogIn, Bell, MapPin, Search, Plus, Radio, Eye, EyeOff, AlertTriangle, CloudRain, Sun, Moon, PlusCircle, LayoutDashboard, Locate, PhoneIncoming, Stethoscope, Smartphone, TrendingUp
} from 'lucide-react';
import Caregiver from '../js/caregiver.js';
import Health from '../js/health.js';

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all duration-200 ${className}`}>
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

const StatCard = ({ icon: Icon, label, value, color, unit }) => (
  <Card className="hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <Badge variant="emerald" className="group-hover:scale-105 transition-transform">Active</Badge>
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
    <div className="flex items-end gap-1">
      <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
      <span className="text-slate-400 text-sm mb-1">{unit}</span>
    </div>
  </Card>
);

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
    full_name: '', blood_type: '', allergies: '', emergency_contact: '+91 ', physician: '', phone: '+91 '
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
                value={formData.emergency_contact} 
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
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
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('lastView') || 'dashboard');
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [healthData, setHealthData] = useState(null);
  
  // SOS State
  const [sosHolding, setSosHolding] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
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
      }
      setLoading(false);
    };
    init();
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
    // Exclude 'phone' if it's not in the database schema
    const { phone, ...dbData } = formData;
    const { error } = await window.supabase.from('profiles').upsert({
      id: session.user.id,
      ...dbData,
      onboarding_completed: true
    });
    if (error) throw error;
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
          alert("SOS Beacon Triggered! Guardians notified.");
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const handleSosRelease = () => {
    clearInterval(sosTimerRef.current);
    setSosHolding(false);
    setSosProgress(0);
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold animate-pulse">Syncing Guardian Node...</p>
    </div>
  );

  if (!session) return <LoginPage onLogin={handleLogin} onSignup={handleSignup} loading={loading} theme={theme} />;
  if (profile && !profile.onboarding_completed) return <OnboardingPage onSave={handleOnboarding} user={session.user} />;

  const isCaregiver = profile?.role === 'caregiver';

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'} text-slate-900 font-sans`}>
      {/* SIDEBAR */}
      <nav className="w-24 lg:w-72 hidden md:flex flex-col bg-slate-900 dark:bg-slate-950 p-6 h-screen sticky top-0 transition-all">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Shield size={24} fill="white" />
          </div>
          <span className="text-xl font-black text-white hidden lg:block italic">SafeTap</span>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'hospitals', icon: MapPin, label: 'Nearby Help' },
            { id: 'profile', icon: User, label: 'My Record' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={24} />
              <span className="font-bold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </div>

        <button onClick={() => window.supabase.auth.signOut()} className="flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all">
          <LogOut size={24} />
          <span className="font-bold hidden lg:block">Sign Out</span>
        </button>
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
                <Badge variant="blue" className="hidden sm:block">Status: Protected</Badge>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Footprints} label="Daily Steps" value={healthData?.steps || '0'} color="bg-blue-600" unit="Steps" />
                <StatCard icon={Activity} label="Heart Rate" value="72" color="bg-rose-500" unit="BPM" />
                <StatCard icon={TrendingUp} label="Activity Level" value="NOMINAL" color="bg-emerald-500" unit="Status" />
                <StatCard icon={Clock} label="Last Sync" value="12m" color="bg-amber-500" unit="ago" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 overflow-hidden p-0 h-[400px] relative">
                  <div className="absolute top-6 left-6 z-10">
                    <Badge variant="emerald" className="shadow-lg">Live GPS Active</Badge>
                  </div>
                  {location ? (
                    <iframe 
                      className="w-full h-full border-none grayscale-[0.2]"
                      src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${location.lat},${location.lng}&zoom=15`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for GPS Fix...</p>
                    </div>
                  )}
                </Card>

                <div className="flex flex-col gap-6">
                  <button 
                    onMouseDown={handleSosHold}
                    onMouseUp={handleSosRelease}
                    onMouseLeave={handleSosRelease}
                    className="flex-1 bg-rose-500 rounded-[3rem] p-8 flex flex-col items-center justify-center text-white relative overflow-hidden active:scale-95 transition-all shadow-2xl shadow-rose-200"
                  >
                    <div className="absolute bottom-0 left-0 w-full bg-rose-700 transition-all duration-100 ease-linear" style={{ height: `${sosProgress}%` }}></div>
                    <Shield size={64} className="relative z-10 mb-4" fill="white" />
                    <span className="text-4xl font-black relative z-10 italic">SOS</span>
                    <p className="text-sm font-bold opacity-80 relative z-10 mt-2">Hold to Broadcast</p>
                  </button>
                  
                  <Card className="flex items-center gap-6 p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600">
                      <PhoneIncoming size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl">Quick Link</h4>
                      <p className="text-slate-500 text-sm font-medium">Contact Emergency Service</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentView === 'hospitals' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Nearby Hospitals</h2>
                  <p className="text-slate-500 font-medium">Surgical centers & Emergency units within 5km</p>
                </div>
                <button 
                  onClick={findHospitals} 
                  disabled={scanning}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  {scanning ? <Loader2 className="animate-spin" /> : <Activity size={20} />}
                  Refresh Scan
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((h, i) => (
                  <Card key={i} className="group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Stethoscope size={28} />
                      </div>
                      <Badge variant="blue">{h.distance.toFixed(1)} km</Badge>
                    </div>
                    <h4 className="text-xl font-black mb-1">{h.name}</h4>
                    <p className="text-slate-500 text-sm font-medium mb-8">Emergency extraction node ready.</p>
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`)}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <Navigation size={18} fill="white" /> Open Route
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Medical Record</h2>
                <p className="text-slate-500 font-medium">Secure biometric and identification data</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 flex flex-col items-center py-12">
                  <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 border-4 border-white shadow-inner">
                    <User size={64} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{profile?.full_name}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 mb-10">Alpha Level Access</p>
                  
                  <div className="w-full px-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <span className="text-slate-500 font-bold text-xs uppercase">Blood Type</span>
                      <span className="text-rose-500 font-black">{profile?.blood_type}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <span className="text-slate-500 font-bold text-xs uppercase">ID Status</span>
                      <span className="text-emerald-500 font-black">VERIFIED</span>
                    </div>
                  </div>

                  <button 
                    onClick={syncHealth}
                    className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center gap-3 active:scale-95 transition-all"
                  >
                    <Footprints size={20} />
                    Link Google Fit
                  </button>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 border-b pb-4">Vital Statistics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div>
                        <p className="text-slate-400 font-bold text-xs uppercase mb-2">Primary Physician</p>
                        <p className="text-xl font-bold">{profile?.physician || 'Not Assigned'}</p>
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
                          <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold">{a.trim()}</span>
                        )) || 'No allergies recorded.'}
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h4 className="text-3xl font-black mb-4 italic">Guardian Link</h4>
                    <p className="text-blue-100 font-medium mb-10 max-w-sm leading-relaxed">Your safety coordinator is receiving encrypted telemetry every 30 seconds for maximum protection.</p>
                    <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold shadow-2xl active:scale-95 transition-all">Setup Backup Link</button>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Settings</h2>
                <p className="text-slate-500 font-medium">Node configuration & Accessibility</p>
              </header>
              <Card className="p-12 flex flex-col items-center justify-center border-dashed border-2">
                 <Settings size={48} className="text-slate-200 mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Module under maintenance</p>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* --- REVERT CSS --- */}
      <style>{`
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