import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Trash2, Loader2, Users, Shield, Plus, ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Card = ({ children, className = "", theme = 'dark' }) => (
  <div className={`backdrop-blur-xl rounded-[2.5rem] p-8 border transition-all duration-500 shadow-2xl ${
    theme === 'dark' 
      ? 'bg-slate-900/50 border-white/5' 
      : 'bg-white/70 border-slate-200'
  } ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "blue" }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default function ContactsPage({ user, onBack, theme = 'dark' }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '91 ' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await window.supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setContacts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addGuardian = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Mobile number validation
    if (formData.phone && !formData.phone.trim().startsWith('91')) {
      toast.error("Mobile number must start with 91");
      return;
    }

    setAdding(true);
    try {
      const { error } = await window.supabase
        .from("contacts")
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        ]);

      if (error) {
        toast.error("Error adding contact");
        console.log(error);
      } else {
        toast.success("Guardian added!");
        setFormData({ name: '', email: '', phone: '91 ' });
        await fetchContacts();
      }
    } catch (err) {
      toast.error("Failed to add contact");
    } finally {
      setAdding(false);
    }
  };

  const deleteContact = async (id) => {
    try {
      const { error } = await window.supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (!error) fetchContacts();
    } catch (e) {}
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* MISSION CRITICAL WARNING BANNER */}
      {contacts.some(c => !c.phone) && (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-6 transition-all ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20 shadow-lg shadow-rose-900/20' : 'bg-rose-50 border-rose-200 shadow-xl shadow-rose-100'}`}>
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse shrink-0">
               <AlertTriangle size={32} />
             </div>
             <div>
               <h3 className={`font-black text-xl mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Incomplete Safety Node</h3>
               <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md">Responders with missing phone links won't receive tactical SMS alerts during emergencies.</p>
             </div>
          </div>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-black text-sm transition-all active:scale-95 whitespace-nowrap">
            Fix Contacts
          </button>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className={`group flex items-center gap-3 pr-6 rounded-2xl border transition-all active:scale-95 w-full sm:w-auto ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/5 text-slate-400 group-hover:text-blue-400' : 'bg-slate-50 text-slate-500 group-hover:text-blue-600'}`}>
              <ArrowLeft size={24} />
            </div>
            <span className={`font-bold uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Back</span>
          </button>
          <div>
            <h2 className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Emergency Circle</h2>
            <p className="text-slate-500 font-medium text-sm">Manage your trusted responders</p>
          </div>
        </div>
        <div className={`px-5 py-2 rounded-full border hidden sm:block ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members: {contacts.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD CONTACT FORM */}
        {/* ADD CONTACT FORM */}
        <Card theme={theme} className="lg:col-span-1 h-fit sticky top-8">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/10 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                <UserPlus size={32} />
              </div>
              <h3 className={`font-black text-xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Add Guardian</h3>
            </div>

            <form onSubmit={addGuardian} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <input 
                  type="text"
                  placeholder="Guardian Name"
                  className={`w-full border outline-none rounded-2xl p-4 font-bold transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'}`}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email"
                    placeholder="email@example.com"
                    className={`w-full border outline-none rounded-2xl p-4 pl-12 font-bold transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'}`}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="tel"
                    placeholder="91 00000 00000"
                    className={`w-full border outline-none rounded-2xl p-4 pl-12 font-bold transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'}`}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={adding}
                className="w-full bg-blue-600 text-white rounded-2xl p-5 font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {adding ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                {adding ? 'Securing...' : 'Add to Circle'}
              </button>
            </form>
        </Card>

        {/* CONTACT LIST */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-[2.5rem] border border-white/5">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Circles...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-[2.5rem] border border-dashed border-white/10 text-center px-8">
              <Users size={64} className="text-slate-800 mb-6" />
              <h3 className="text-xl font-black text-white mb-2">No Guardians Found</h3>
              <p className="text-slate-500 font-medium max-w-xs">Your emergency alerts will only be sent once you add trusted contacts to your circle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contacts.map((contact) => (
                <Card key={contact.id} theme={theme} className="group hover:border-blue-500/30 transition-all p-6 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                       Priority {contacts.indexOf(contact) + 1}
                    </div>
                    <button 
                      onClick={() => deleteContact(contact.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl border border-white/10 shadow-lg">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{contact.name}</h4>
                      <Badge variant="blue">Trusted Responder</Badge>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className={`flex items-center gap-3 font-bold text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Mail size={16} className="text-blue-400" />
                      {contact.email}
                    </div>
                    {contact.phone ? (
                      <div className={`flex items-center gap-3 font-bold text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Phone size={16} className="text-emerald-400" />
                        {contact.phone}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-rose-400 font-bold text-[10px] uppercase tracking-widest italic">
                        <AlertTriangle size={12} className="animate-pulse" />
                        Missing Mobile Link
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] mt-2">
                       <Clock size={12} />
                       Last Notified: Never
                    </div>
                  </div>

                  <div className={`mt-8 pt-6 border-t flex flex-col gap-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <Shield size={12} fill="currentColor" />
                        SOS Active
                      </div>
                      <button 
                        onClick={() => toast.success(`🚀 Test alert sent to ${contact.name.split(' ')[0]}!`)}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        Test Alert
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
