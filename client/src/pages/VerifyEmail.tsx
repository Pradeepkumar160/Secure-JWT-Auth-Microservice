import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        toast.success(result.message);
      } else {
        setStatus("error");
        setMessage(result.message);
        toast.error(result.message);
      }
    },
    onError: (error) => {
      setStatus("error");
      setMessage("Verification failed. The link may be expired or invalid.");
      console.error(error);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    } else {
      setStatus("error");
      setMessage("Missing verification token.");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 shadow-2xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-white">Verifying Email</h1>
            <p className="text-slate-400">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Success!</h1>
              <p className="text-slate-400">{message}</p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
              <p className="text-slate-400">{message}</p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              Back to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
