"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { BackspaceIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Spinner from "@/assets/svgs/Spinner.svg";

const LoginPage = () => {
  const { session, login } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loadingState, setLoadingState] = useState<boolean>(false);

  if (session) {
    router.push("/");
    return null;
  }

  const handleInput = (value: string) => {
    if (code.length < 4) {
      setCode((prevCode) => prevCode + value);
    }
  };

  const handleBackspace = () => {
    setCode((prevCode) => prevCode.slice(0, -1));
  };

  const handleClear = () => {
    setCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingState(true);

    if (code.length !== 4) {
      setError("Please enter a 4-digit security code.");
      setLoadingState(false);
      return;
    }

    try {
      await login(code);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingState(false);
    }
  };

  if (loadingState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 px-4">
        <Image src={Spinner} alt="Loading" />
        <h2 className="text-white font-semibold">
          Please Wait.. Validation on progress..
        </h2>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center p-6 bg-black rounded-lg w-full max-w-md"
      >
        <h2 className="mb-4 text-2xl font-bold text-white text-center">
          Enter 4-Digit Code
        </h2>

        <div
          className={`mb-4 text-center text-white text-4xl tracking-widest w-full
              bg-gray-800 border-4 border-yellow-500 rounded-lg px-4  py-2 shadow-lg transition-all`}
        >
          {code.padEnd(4, "•")}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Dial pad numbers */}
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="w-full p-4 text-2xl font-bold text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            >
              {num}
            </button>
          ))}

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-full p-4 flex items-center justify-center text-xl text-red-500 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>

          <button
            onClick={() => handleInput("0")}
            className="w-full p-4 text-2xl font-bold text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            0
          </button>

          {/* Backspace button */}
          <button
            onClick={handleBackspace}
            className="w-full p-4 flex items-center justify-center text-xl text-yellow-500 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            <BackspaceIcon className="w-8 h-8" />
          </button>
        </div>

        {error && (
          <div className="p-2 mb-4 text-center text-red-500">{error}</div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={code.length !== 4 || loadingState}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          {loadingState ? "Logging in..." : "Enter"}
        </Button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
