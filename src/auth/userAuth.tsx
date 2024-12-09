import supabase from '@/utils/supabase';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const supabaseLocalStorageSession = import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION;

export const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed:', errorData.message);
      return { error: errorData.message };
    }

    const data = await response.json();

    if (data) {
      const { error: sessionError } = await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      if (sessionError) {
        console.error('Error setting session:', sessionError.message);
      }
    }

    return { data };
  } catch (error) {
    console.error('Network error:', error);
    return { error: 'Network error or failed to connect to server' };
  }
};

export const handleLogout = async () => {
  const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
  if (!isConfirmed) return;

  try {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
    });

    const res = await response.json();
    if (!response.ok) {
      console.error("Error logging out:", res.message);
    }

    localStorage.removeItem("user_role");
    localStorage.removeItem("lastWritten");
    localStorage.removeItem(supabaseLocalStorageSession);
    window.location.href = '/';
  } catch (error) {
    console.error("Error logging out:", error);
    return { error };
  }
};