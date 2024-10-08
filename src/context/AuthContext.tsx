"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js"; 

interface AuthContextType {
  user: User | null; 
  session: CustomSession | null;
  loading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, code: string) => Promise<void>;
}

interface CustomSession {
  user: User; 
  expires_at: number;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<CustomSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        setSession({ user: data.session.user, expires_at: Date.now() + 3600 });
        setUser(data.session.user);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(
          session ? { user: session.user, expires_at: Date.now() + 3600 } : null
        );
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (code: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("security_code", parseInt(code))
      .maybeSingle();

    console.log(data,error);
    

    if (!error && !data) {
      toast({
        variant: "destructive",
        title: "Invalid security code.",
        description: "There is no user with this security code.",
      });
    }

    const cusSession: CustomSession = {
      user: data,
      expires_at: Date.now() + 3600 * 1000,
    };
    setSession(cusSession);
    setUser(cusSession.user);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setSession(null);
    setUser(null);
  };

  const register = async (username: string, code: string) => {
    const { error } = await supabase.from("users").insert([
      {
        username: username.trim(),
        security_code: parseInt(code),
      },
    ]);

    if (error) {
      if (error.code === "23505")
        toast({
          variant: "destructive",
          title: "Security Code Already Taken.",
          description: "This security code is already in use. Please choose a different one.",
        });
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, login, logout, register }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
