import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [, navigate] = useLocation();

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error("Failed to send reset link. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    resetMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-600 rounded-lg mb-4">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400">Enter your email to receive a reset link</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <div className="px-8 pb-8 border-t border-slate-700 pt-6">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 w-full text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
