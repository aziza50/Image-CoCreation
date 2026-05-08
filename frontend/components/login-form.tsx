"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { arizonia, bacasime, garamond } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { getUserStyle } from "@/src/app/services/users";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      //for now, check if user has user style in the database, if not -> onboarding
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = user?.id;
      if (!userId) {
        setError("User not authenticated. Please log in again.");
        return;
      }
      const response = await getUserStyle(userId);
      if (!response.success) {
        toast.error("Failed to fetch user style. Please try again.");
        return;
      }
      if (!response.data) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/onboarding`,
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className={`${arizonia.className} text-3xl`}>
            Login
          </CardTitle>
          <div
            className={`${garamond.className} text-sm justify-items-center flex flex-col gap-4 mt-2 mb-4`}
          >
            <Button
              className="justify-items-center border-dashed hover:bg-transparent hover:border-gray-400"
              variant="outline"
              onClick={signInWithGoogle}
            >
              Sign in with Google
              <Image
                src="/images/google.png"
                alt="Google Icon"
                width={20}
                height={20}
                className="ml-2"
              ></Image>
            </Button>
          </div>
        </CardHeader>
        <div
          className={`items-center w-full flex flex-col ${garamond.className} text-sm`}
        >
          or
        </div>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${bacasime.className} placeholder:italic placeholder:text-slate-400 `}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className={`${garamond.className} ml-auto inline-block text-sm underline-offset-4 hover:underline`}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${bacasime.className} placeholder:italic placeholder:text-slate-400 `}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className={`${garamond.className} mt-4 text-center text-sm`}>
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
