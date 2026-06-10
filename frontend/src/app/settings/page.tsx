'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Link2, Loader2, ChevronRight, Palette } from "lucide-react";
import { toast } from 'sonner';

import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth.service';

const tabs = [
  { id: 'profile', label: 'Personal info', icon: User, desc: 'Provide personal details and how we can reach you' },
  { id: 'security', label: 'Login & security', icon: Shield, desc: 'Update your password and secure your account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Choose notification preferences and how you want to be contacted' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Customize the look and feel of your workspace' },
  { id: 'integrations', label: 'Connected apps', icon: Link2, desc: 'Manage your connected third-party logistics apps' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('grid'); // 'grid' shows all options, otherwise shows specific tab

  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Preferences State
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
  const [theme, setTheme] = useState('light');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Integrations State
  const [openWeatherKey, setOpenWeatherKey] = useState('12fdcf0f1dd85810837c03e9d5092dbb');
  const [tomTomKey, setTomTomKey] = useState('tm_ih8k39GI0yU8QYDVfBWi1KZMVkAKrKSz');

  const [isSaving, setIsSaving] = useState(false);

  // Initialize state with user data
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      if (user.preferences) {
        const prefs = user.preferences as any;
        if (prefs.notifications) setNotifications(prefs.notifications);
        if (prefs.theme) setTheme(prefs.theme);
      }
    }
  }, [user]);

  const handleSaveProfileAndPrefs = async () => {
    try {
      setIsSaving(true);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const response = await authService.updateProfile({
        name: fullName,
        email,
        preferences: { notifications, theme }
      });
      updateUser(response.user);

      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIntegrations = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('API Keys updated successfully!');
      setIsSaving(false);
    }, 800);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    try {
      setIsSaving(true);
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout(); // Clear local store
      router.push('/login'); // Redirect
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-12">
        {activeTab === 'grid' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-[32px] font-bold text-[#222222] mb-2 tracking-tight">Account</h1>
            <p className="text-[18px] font-normal text-[#222222] mb-12">
              <span className="font-bold">{user.name}</span>, {user.email} · <span className="underline cursor-pointer">Go to profile</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="p-6 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-shadow duration-300 border border-[#dddddd] flex flex-col h-[180px] group bg-white"
                >
                  <tab.icon className="w-8 h-8 text-[#222222] mb-8 stroke-[2]" />
                  <h3 className="text-[18px] font-bold text-[#222222] mb-2">{tab.label}</h3>
                  <p className="text-[#6a6a6a] text-[14px] leading-snug">{tab.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center pt-8 border-t border-[#dddddd]">
              <button
                onClick={handleLogout}
                className="font-bold text-[16px] text-[#222222] underline hover:text-black transition-colors"
              >
                Log out
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-10">
              <button
                onClick={() => setActiveTab('grid')}
                className="text-[14px] font-bold text-[#222222] underline mb-6 flex items-center gap-1 hover:bg-[#f7f7f7] px-4 py-2 -ml-4 rounded-full transition-colors w-fit no-underline"
              >
                <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} /> Account
              </button>
              <h1 className="text-[32px] font-bold text-[#222222] tracking-tight">{tabs.find(t => t.id === activeTab)?.label}</h1>
            </div>

            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
                    <div className="space-y-0">
                      <div className="py-6 border-b border-[#dddddd] flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-[16px] text-[#222222] font-normal">Legal name</h4>
                          <p className="text-[#6a6a6a] text-[14px]">{firstName} {lastName}</p>
                        </div>
                        <button className="text-[14px] font-bold underline text-[#222222]">Edit</button>
                      </div>

                      <div className="py-6 border-b border-[#dddddd] flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-[16px] text-[#222222] font-normal">Email address</h4>
                          <p className="text-[#6a6a6a] text-[14px]">{email}</p>
                        </div>
                        <button className="text-[14px] font-bold underline text-[#222222]">Edit</button>
                      </div>

                      <div className="py-6 border-b border-[#dddddd] flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-[16px] text-[#222222] font-normal">Role</h4>
                          <p className="text-[#6a6a6a] text-[14px] capitalize">{user.role}</p>
                        </div>
                      </div>

                      <div className="py-8 px-6 rounded-[14px] border border-[#dddddd] mt-10">
                        <h4 className="text-[18px] font-bold text-[#222222] mb-6">Edit personal info</h4>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors" placeholder="First name" />
                          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors" placeholder="Last name" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors col-span-2" placeholder="Email" />
                        </div>
                        <button onClick={handleSaveProfileAndPrefs} disabled={isSaving} className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center gap-2">
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <motion.div key="notifications" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
                    <div className="space-y-0">
                      <div className="py-6 border-b border-[#dddddd] flex items-center justify-between">
                        <div>
                          <h4 className="text-[16px] text-[#222222] font-normal">Email Notifications</h4>
                          <p className="text-[14px] text-[#6a6a6a]">Receive daily summaries and critical alerts.</p>
                        </div>
                        <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} className="w-6 h-6 rounded-[6px] text-primary border-[#dddddd] focus:ring-primary focus:ring-2 cursor-pointer" />
                      </div>
                      <div className="py-6 border-b border-[#dddddd] flex items-center justify-between">
                        <div>
                          <h4 className="text-[16px] text-[#222222] font-normal">Push Notifications</h4>
                          <p className="text-[14px] text-[#6a6a6a]">Receive real-time alerts on your dashboard.</p>
                        </div>
                        <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} className="w-6 h-6 rounded-[6px] text-primary border-[#dddddd] focus:ring-primary focus:ring-2 cursor-pointer" />
                      </div>
                      <div className="py-6 border-b border-[#dddddd] flex items-center justify-between">
                        <div>
                          <h4 className="text-[16px] text-[#222222] font-normal">SMS Alerts</h4>
                          <p className="text-[14px] text-[#6a6a6a]">Receive text messages for severe delays.</p>
                        </div>
                        <input type="checkbox" checked={notifications.sms} onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })} className="w-6 h-6 rounded-[6px] text-primary border-[#dddddd] focus:ring-primary focus:ring-2 cursor-pointer" />
                      </div>
                      <div className="pt-8">
                        <button onClick={handleSaveProfileAndPrefs} disabled={isSaving} className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center gap-2">
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save preferences
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* APPEARANCE TAB */}
                {activeTab === 'appearance' && (
                  <motion.div key="appearance" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
                    <div className="space-y-0">
                      <div className="py-6 border-b border-[#dddddd]">
                        <h4 className="text-[18px] font-bold text-[#222222] mb-4">Theme Preferences</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div
                            onClick={() => setTheme('light')}
                            className={`p-4 border rounded-[14px] cursor-pointer transition-colors ${theme === 'light' ? 'border-[#222222] bg-[#f7f7f7]' : 'border-[#dddddd] bg-white hover:border-[#222222]'}`}
                          >
                            <div className="w-full h-24 bg-white border border-[#dddddd] rounded-[8px] mb-4 shadow-sm"></div>
                            <p className="text-center text-[14px] font-bold text-[#222222]">Light Theme</p>
                          </div>
                          <div
                            onClick={() => setTheme('dark')}
                            className={`p-4 border rounded-[14px] cursor-pointer transition-colors ${theme === 'dark' ? 'border-[#222222] bg-[#f7f7f7]' : 'border-[#dddddd] bg-white hover:border-[#222222]'}`}
                          >
                            <div className="w-full h-24 bg-[#222222] border border-[#dddddd] rounded-[8px] mb-4 shadow-sm"></div>
                            <p className="text-center text-[14px] font-bold text-[#222222]">Dark Theme (Coming Soon)</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8">
                        <button onClick={handleSaveProfileAndPrefs} disabled={isSaving} className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center gap-2">
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save appearance
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
                    <div className="py-6">
                      <h4 className="text-[18px] font-bold text-[#222222] mb-6">Update password</h4>
                      <div className="space-y-4 max-w-md">
                        <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors" />
                        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors" />
                        <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors" />
                        <button onClick={handleChangePassword} disabled={isSaving || !currentPassword || !newPassword} className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center gap-2 mt-4">
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Update password
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* INTEGRATIONS TAB */}
                {activeTab === 'integrations' && (
                  <motion.div key="integrations" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.2 }}>
                    <div className="space-y-0">
                      <div className="py-6 border-b border-[#dddddd]">
                        <h4 className="text-[18px] font-bold text-[#222222] mb-2">TomTom Maps API</h4>
                        <p className="text-[14px] text-[#6a6a6a] mb-4">Used for live routing and traffic intelligence.</p>
                        <input
                          type="text"
                          value={tomTomKey}
                          onChange={(e) => setTomTomKey(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors font-mono"
                          placeholder="TomTom API Key"
                        />
                      </div>

                      <div className="py-6 border-b border-[#dddddd]">
                        <h4 className="text-[18px] font-bold text-[#222222] mb-2">OpenWeather API</h4>
                        <p className="text-[14px] text-[#6a6a6a] mb-4">Used for weather risk and traffic maps.</p>
                        <input
                          type="text"
                          value={openWeatherKey}
                          onChange={(e) => setOpenWeatherKey(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors font-mono"
                          placeholder="OpenWeather API Key"
                        />
                      </div>

                      <div className="py-6 border-b border-[#dddddd] flex items-center justify-between">
                        <div>
                          <h4 className="text-[18px] font-bold text-[#222222]">Slack Notifications</h4>
                          <p className="text-[14px] text-[#6a6a6a]">Send high-priority alerts directly to Slack channels.</p>
                        </div>
                        <button className="text-[14px] font-bold underline text-[#222222]">Connect</button>
                      </div>

                      <div className="pt-8">
                        <button onClick={handleSaveIntegrations} disabled={isSaving} className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center gap-2">
                          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Integrations
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
