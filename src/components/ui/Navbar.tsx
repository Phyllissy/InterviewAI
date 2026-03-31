"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <Link href="/" className="text-lg font-semibold text-indigo-500">
        InterviewAI
      </Link>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        ) : user ? (
          <>
            <div
              className="max-w-[140px] truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
              title={user.email}
            >
              {user.email}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-red-500"
            >
              <LogOut size={14} />
              登出
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-600"
          >
            登录
          </Link>
        )}
      </div>
    </nav>
  );
}
