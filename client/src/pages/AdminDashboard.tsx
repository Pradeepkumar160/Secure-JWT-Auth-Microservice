import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, LogOut, Shield, Mail, Calendar, Trash2, Edit } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      navigate("/");
      toast.error("Access denied");
    }
  }, [user, navigate]);

  const { data: usersData, isLoading } = trpc.user.getAllUsers.useQuery();
  const updateRoleMutation = trpc.user.updateUserRole.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        trpc.useUtils().user.getAllUsers.invalidate();
      } else {
        toast.error(result.message);
      }
    },
  });

  const deleteUserMutation = trpc.user.deleteUser.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        trpc.useUtils().user.getAllUsers.invalidate();
      } else {
        toast.error(result.message);
      }
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">Manage users and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.name || user.email}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {usersData?.users?.length || 0}
                  </p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Verified Emails</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {usersData?.users?.filter((u: any) => u.isEmailVerified).length || 0}
                  </p>
                </div>
                <Mail className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Admins</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {usersData?.users?.filter((u: any) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length || 0}
                  </p>
                </div>
                <Shield className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Users</h2>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading users...</div>
            ) : usersData?.users && usersData.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Verified</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.users.map((u: any) => (
                      <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                        <td className="py-3 px-4 text-white">{u.email}</td>
                        <td className="py-3 px-4 text-slate-300">{u.name || "-"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === "SUPER_ADMIN" ? "bg-purple-900 text-purple-200" :
                            u.role === "ADMIN" ? "bg-blue-900 text-blue-200" :
                            "bg-slate-700 text-slate-200"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.isEmailVerified ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
                          }`}>
                            {u.isEmailVerified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8"
                              onClick={() => {
                                const newRole = u.role === "USER" ? "ADMIN" : "USER";
                                updateRoleMutation.mutate({ userId: u.id, role: newRole });
                              }}
                              disabled={updateRoleMutation.isPending}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-900 hover:bg-red-800 h-8"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this user?")) {
                                  deleteUserMutation.mutate({ userId: u.id });
                                }
                              }}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No users found</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}