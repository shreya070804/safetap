/**
 * SafeTap Caregiver Utility - PRODUCTION DATA BRIDGE
 * Build: 1.1.0-Guardian-Telemetry
 */
const Caregiver = {
    /**
     * Fetches members managed by a specific caregiver
     */
    async getManagedMembers(caregiverId) {
        if (!window.supabase) return [];
        try {
            // Fetch profiles that have this caregiverId as their guardian/caregiver
            // We use 'guardian_id' as the linking field in the 'profiles' table.
            const { data, error } = await window.supabase
                .from('profiles')
                .select('*, health_data(*)')
                .eq('guardian_id', caregiverId);
            
            if (error) {
                console.warn("Caregiver: Direct join failing, attempting primary fetch...");
                const { data: profiles, error: pError } = await window.supabase
                    .from('profiles')
                    .select('*')
                    .eq('guardian_id', caregiverId);
                
                if (pError) throw pError;
                return profiles;
            }
            return data || [];
        } catch (e) {
            console.error("Caregiver: Member telemetry sync failed.", e.message);
            return [];
        }
    },

    /**
     * Resolves an active alert in the system
     */
    async resolveAlert(alertId) {
        if (!window.supabase) return false;
        try {
            const { error } = await window.supabase
                .from('alerts')
                .update({ resolved: true, status: 'resolved' })
                .eq('id', alertId);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Caregiver: Alert resolution failed.", e.message);
            return false;
        }
    },

    /**
     * Requisition a new member link (Guardian Assignment)
     */
    async linkMember(caregiverId, memberEmail) {
        if (!window.supabase) return false;
        try {
            const { data: member, error: findError } = await window.supabase
                .from('profiles')
                .select('id')
                .eq('email', memberEmail)
                .maybeSingle();
            
            if (findError) throw new Error("Operator not found in Nexus.");

            const { error: linkError } = await window.supabase
                .from('profiles')
                .update({ guardian_id: caregiverId })
                .eq('id', member.id);
            
            if (linkError) throw linkError;
            return true;
        } catch (e) {
            console.error("Caregiver: Sector link failed.", e.message);
            throw e;
        }
    }
};

export default Caregiver;