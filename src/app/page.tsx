"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Spinner from "@/assets/svgs/Spinner.svg";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  username: string;
  security_code: number;
  created_at: string;
}

const HomePage = () => {
  const { user, session, loading, } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string>("");

  const { toast } = useToast();

  if(!session?.user)router.push("/login");

  useEffect(() => {
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
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("An unexpected error occurred while fetching user data.");
      }
    };

    if (!loading && !session) {
      router.push("/login");
    } else if (session && user) {
      fetchUserData();
    }
  }, [loading, session, user, router]);

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900">
        <Image src={Spinner} alt="Loading" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 px-4">
      {userData?.username && (
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
      )}
    </div>
  );
};

export default HomePage;
