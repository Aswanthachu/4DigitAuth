"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  id: string;
  username: string;
  security_code: number;
  created_at: string;
}

const HomePage = () => {
  const { user, session, loading, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string>("");

  console.log(session);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    } else if (session && user) {
      fetchUserData();
    }
  }, [loading, session, user, router]);

  const fetchUserData = async () => {
    if (!user) {
      setError("User not found.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setUserData(data);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching user data.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Error signing out.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-white rounded shadow-md w-full max-w-md"
      >
        <h2 className="mb-4 text-2xl font-bold text-center text-black">
          Welcome, {userData?.username}!
        </h2>
      </motion.div>
    </div>
  );
};

export default HomePage;
