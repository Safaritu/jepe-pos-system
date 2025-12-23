import { supabase, checkAuth } from './auth.js';

let isLogin = true;
const form = document.getElementById('auth-form');
const msg = document.getElementById('msg');
const submitBtn = document.getElementById('submit-btn');
const toggleMode = document.getElementById('toggle-mode');
const signupFields = document.getElementById('signup-fields');
const formTitle = document.getElementById('form-title');

// Toggle between Login and Signup
toggleMode.onclick = () => {
    isLogin = !isLogin;
    formTitle.innerText = isLogin ? "Login" : "Sign Up";
    submitBtn.innerText = isLogin ? "Sign In" : "Register";
    signupFields.style.display = isLogin ? "none" : "block";
    toggleMode.innerHTML = isLogin ? "New here? <b>Create an account</b>" : "Have an account? <b>Login</b>";
};

form.onsubmit = async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    msg.style.color = "var(--accent)";
    msg.innerText = "Processing...";

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;

    try {
        let result;
        if (isLogin) {
            // Sign In
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            // Sign Up - Metadata is sent to your SQL Trigger
            result = await supabase.auth.signUp({
                email, password,
                options: { 
                    data: { name: name || 'Staff', role: role } 
                }
            });
        }

        if (result.error) throw result.error;

        msg.innerText = "Success! Checking permissions...";

        // Wait for the SQL trigger to create the user profile in public.users
        let profile = null;
        for (let i = 0; i < 5; i++) {
            profile = await checkAuth();
            if (profile) break;
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!profile) {
            throw new Error("Profile not found. Please ensure 'Confirm Email' is OFF in Supabase.");
        }

        // Redirect based on the 'role' column
        if (profile.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'cashier.html';
        }

    } catch (err) {
        msg.style.color = "#f87171";
        msg.innerText = err.message;
        submitBtn.disabled = false;
    }
};