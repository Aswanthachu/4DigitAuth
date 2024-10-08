"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const { session, register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    code: "",
    reEnterCode: "",
  });
  const [error, setError] = useState<string>("");

  if (session) {
    router.push("/");
    return null;
  }

  const handleInput = (key: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!/^\d{4}$/.test(formData.code)) {
      setError("Security code must be a 4-digit number.");
      return;
    }

    if (formData.code !== formData.reEnterCode) {
      setError("Security codes do not match.");
      return;
    }

    try {
      await register(formData.username, formData.code);
      toast.success("Registration successful!");
      setFormData({ username: "", code: "", reEnterCode: "" });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-gray-800 rounded shadow-lg w-full max-w-sm"
      >
        <h2 className="mb-4 text-2xl font-bold text-center text-white">
          Register
        </h2>
        <form onSubmit={handleRegister} className="space-y-10">
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">
              Username
            </label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => handleInput("username")(e.target.value)}
              required
              className="w-full bg-gray-700 text-white"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">
              4-Digit Security Code
            </label>
            <Input
              type="password"
              value={formData.code}
              onChange={(e) => handleInput("code")(e.target.value)}
              required
              maxLength={4}
              className="w-full bg-gray-700 text-white"
              placeholder="Enter a 4-digit code"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold text-white">
              Re-enter Security Code
            </label>
            <Input
              type="password"
              value={formData.reEnterCode}
              onChange={(e) => handleInput("reEnterCode")(e.target.value)}
              required
              maxLength={4}
              className="w-full bg-gray-700 text-white"
              placeholder="Re-enter your 4-digit code"
            />
          </div>
          {error && (
            <div className="p-2 mb-4 text-center text-red-500">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
          >
            Register
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
