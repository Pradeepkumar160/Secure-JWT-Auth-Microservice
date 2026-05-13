import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        // Store tokens
        if (result.accessToken) {
          localStorage.setItem("accessToken", result.accessToken);
        }
        if (result.refreshToken) {
          localStorage.setItem("refreshToken", result.refreshToken);
        }
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error("Login failed. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-lg mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 space-y-4 border-t border-slate-700 pt-6">
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <button onClick={() => navigate("/register")} className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                Sign up
              </button>
            </p>
            <p className="text-center text-sm text-slate-400">
              <button onClick={() => navigate("/forgot-password")} className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                Forgot your password?
              </button>
            </p>
          </div>
        </Card>

        {/* Security Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          🔒 Your login credentials are encrypted and secure
        </p>
      </div>
    </div>
  );
}
