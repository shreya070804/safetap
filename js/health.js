/**
 * SafeTap Health Service
 * Handles Google Fit OAuth integration and Supabase data persistence.
 */

const Health = {
    /**
     * Fetch health data from Supabase for a specific user
     */
    async getHealthData(userId) {
        if (!window.supabase) return null;
        try {
            const { data, error } = await window.supabase
                .from('health_data')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (e) {
            console.error("Health: Failed to fetch data", e);
            return null;
        }
    },

    /**
     * Trigger Google OAuth with Fitness Scopes
     */
    async connectGoogleFit() {
        if (!window.supabase) return;
        const { data, error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/fitness.activity.read',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    },

    /**
     * Pulse sync with Google Fit API and update Supabase
     */
    async syncGoogleFit(session) {
        if (!session?.provider_token) {
            console.warn("Health: No provider token available for sync.");
            return null;
        }

        try {
            // End of today in milliseconds
            const now = new Date();
            const endMillis = now.getTime();
            // Start of today (00:00:00) in milliseconds
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startMillis = startOfDay.getTime();

            // Google Fit Aggregate API to fetch steps
            const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aggregateBy: [{
                        dataTypeName: "com.google.step_count.delta",
                        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                    }],
                    bucketByTime: { durationMillis: 86400000 }, // Daily bucket
                    startTimeMillis: startMillis,
                    endTimeMillis: endMillis
                })
            });

            if (!response.ok) throw new Error("Google Fit API Error: " + response.statusText);

            const result = await response.json();
            let steps = 0;

            // Extract steps from buckets
            if (result.bucket && result.bucket.length > 0) {
                const dataset = result.bucket[0].dataset;
                if (dataset && dataset[0].point && dataset[0].point.length > 0) {
                    steps = dataset[0].point[0].value[0].intVal || 0;
                }
            }

            // Update Supabase
            const { data, error } = await window.supabase
                .from('health_data')
                .upsert({
                    user_id: session.user.id,
                    steps: steps,
                    last_updated: new Date().toISOString()
                })
                .select()
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error("Health: Sync Pulse Failed", e);
            throw e;
        }
    },

    async disconnect() {
        // Since we don't have a connections table, we just clear the health data
        // or the user can just sign out. For this implementation, we'll delete the health_data entry.
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;

        await window.supabase
            .from('health_data')
            .delete()
            .eq('user_id', user.id);
    }
};

export default Health;
