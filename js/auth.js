/**
 * SafeTap Auth Module - PRODUCTION
 * Handles Authentication, Session, and Operative Management
 * REPLACED: OTP/Magic-Link -> Email+Password
 */

const Auth = {
    async init() {
    },

    // 1. SAFE AUTH CHECK (USE EVERYWHERE)
    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.warn("Auth not ready yet");
                return null;
            }
            return data.user;
        } catch (e) {
            console.warn("Auth not ready yet");
            return null;
        }
    },

    // 🆕 Sign Up Handler
    async signupUser(email, password) {
        // ENSURE INPUT VALUES ARE NOT EMPTY
        if (!email || !password) {
            Utils.showToast("Enter email and password", "warning");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            console.warn("Auth not ready yet");
            Utils.showToast(error.message, "danger");
        } else {
            Utils.showToast("Signup successful. You can now login.", "success");
        }
    },

    // 🆕 Login Handler
    async loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            Utils.showToast("Login failed: " + error.message, "danger");
        } else {
            console.log("SIGNED_IN");
            Utils.showToast("Welcome to SafeTap", "success");
        }
    },

    async logoutUser() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            Utils.showToast("Logged out successfully", "info");
            setTimeout(() => window.location.reload(), 1500);
        }
    },

    // 🛠️ Profile Provisioning Logic
    // 8. CLEAN PROFILE CREATION
    async createProfile() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("profiles")
            .insert([{
                id: user.id,
                email: user.email
            }]);

        if (error) {
            console.warn("Auth not ready yet");
            return null;
        }

        console.log("Profile created");
        return true;
    }
};

// 🔗 Global UI Bridge
window.login = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!email || !password) {
        Utils.showToast("Enter email and password", "warning");
        return;
    }
    Auth.loginUser(email, password);
};

window.signup = () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    Auth.signupUser(email, password);
};

window.logoutUser = () => Auth.logoutUser();
window.getCurrentUser = () => Auth.getCurrentUser();
window.Auth = Auth;