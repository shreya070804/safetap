import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Trash2, Loader2, Users, Shield, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 ${className}`}>
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

export default function ContactsPage({ user, onBack }) {
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 bg-slate-900 pr-6 rounded-2xl border border-white/5 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
              <ArrowLeft size={24} />
            </div>
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Back to Dashboard</span>
          </button>
          <div>
            <h2 className="text-3xl font-black text-white mb-1">Emergency Circle</h2>
            <p className="text-slate-500 font-medium">Manage your trusted responders</p>
          </div>
        </div>
        <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members: {contacts.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD CONTACT FORM */}
        <Card className="lg:col-span-1 h-fit sticky top-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center">
                <UserPlus size={32} />
              </div>
              <h3 className="font-black text-xl text-white">Add Guardian</h3>
            </div>

            <form onSubmit={addGuardian} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <input 
                  type="text"
                  placeholder="Guardian Name"
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500 outline-none rounded-2xl p-4 font-bold text-white transition-all"
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
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500 outline-none rounded-2xl p-4 pl-12 font-bold text-white transition-all"
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
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500 outline-none rounded-2xl p-4 pl-12 font-bold text-white transition-all"
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
                <Card key={contact.id} className="group hover:border-blue-500/30 transition-all p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => deleteContact(contact.id)}
                      className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl border border-white/10">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-white">{contact.name}</h4>
                    <Badge variant="blue">Trusted Responder</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                    <Mail size={16} className="text-blue-400" />
                    {contact.email}
                  </div>
                  {contact.phone ? (
                    <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
                      <Phone size={16} className="text-emerald-400" />
                      {contact.phone}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-rose-400 font-bold text-xs italic">
                      <Phone size={16} />
                      No phone added
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <Shield size={12} fill="currentColor" />
                    SOS Notifications Active
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
