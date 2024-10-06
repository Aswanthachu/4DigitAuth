"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Toaster } from "./ui/toaster";
import { Toaster as HotToast} from 'react-hot-toast';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error: unknown) {
      if(error instanceof Error)
      console.error("Logout Error:", error.message);
    }
  };

  const handleRoute = () => {
    if (pathname === "/login") router.push("/register");
    else router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <nav className="p-4 h-16 bg-[#1F2937] text-white flex justify-between">
        <Link href="/" className="text-lg font-bold">
          DialAuth
        </Link>
        {session ? (
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleRoute}
            className="bg-green-500 hover:bg-green-600"
          >
            {pathname === "/register" ? "Login" : "Register"}
          </Button>
        )}
      </nav>
      <main>{children}</main>
      <Toaster />
      <HotToast/>
    </div>
  );
};

export default Layout;
