"use client";

import { useState } from "react";
import { User, Key, Shield, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("Bishal Sarkar");
  const [email, setEmail] = useState("bishalsarkar5695@gmail.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile credentials updated successfully.");
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 800);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
          Admin Profile & Security
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage your personal administrative credentials, password, and security access privileges.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
          <div className="p-2 bg-rose-gold/10 rounded-lg">
            <User className="w-5 h-5 text-rose-gold-dark" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-deep-plum">Administrator Account</h2>
            <p className="text-xs text-neutral-400">Master account credentials for Cherry Jewelry CMS.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold font-medium text-deep-plum"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold font-medium text-deep-plum"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-deep-plum text-white px-5 py-2 rounded-xl font-medium hover:bg-deep-plum-dark transition-colors disabled:opacity-50"
            >
              Update Account Details
            </button>
          </div>
        </form>
      </div>

      {/* Password Security Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
          <div className="p-2 bg-rose-gold/10 rounded-lg">
            <Key className="w-5 h-5 text-rose-gold-dark" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-deep-plum">Password & Authentication</h2>
            <p className="text-xs text-neutral-400">Change your administrative login password.</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="uppercase tracking-wider text-neutral-400 font-medium block">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-deep-plum text-white px-5 py-2 rounded-xl font-medium hover:bg-deep-plum-dark transition-colors disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
