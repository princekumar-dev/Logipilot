'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { User, Bell, Shield, Link2, Loader2, Palette, Database, CheckCircle2, XCircle, Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from 'sonner';

import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth.service';
import integrationService, { Integration, DatabaseConfig } from '../../services/integration.service';

const tabs = [
  { id: 'profile', label: 'Personal info', icon: User, desc: 'Provide personal details and how we can reach you' },
  { id: 'security', label: 'Login & security', icon: Shield, desc: 'Update your password and secure your account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Choose notification preferences and how you want to be contacted' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Customize the look and feel of your workspace' },
  { id: 'integrations', label: 'Connected apps', icon: Link2, desc: 'Manage your connected third-party logistics apps' },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');
  const pathname = usePathname();

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
  const [routingProvider, setRoutingProvider] = useState<'public' | 'local'>('local');
  const [osrmUrl, setOsrmUrl] = useState('');
  const [osrmUrlMasked, setOsrmUrlMasked] = useState('');
  const [routingId, setRoutingId] = useState('');
  const [openWeatherKey, setOpenWeatherKey] = useState('');
  const [openWeatherMasked, setOpenWeatherMasked] = useState('');
  const [openWeatherId, setOpenWeatherId] = useState('');
  const [trafficApiKey, setTrafficApiKey] = useState('');
  const [trafficApiMasked, setTrafficApiMasked] = useState('');
  const [trafficApiId, setTrafficApiId] = useState('');
  const [trafficProvider, setTrafficProvider] = useState('tomtom');

  // Database Integrations State
  const [dbIntegrations, setDbIntegrations] = useState<Integration[]>([]);
  const [showAddDb, setShowAddDb] = useState(false);
  const [editingDb, setEditingDb] = useState<Integration | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingApiId, setTestingApiId] = useState<string | null>(null);
  const [apiStatuses, setApiStatuses] = useState<Record<string, { success: boolean; message: string; status: string }>>({});
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // New Database Form State
  const [dbProvider, setDbProvider] = useState('postgresql');
  const [dbName, setDbName] = useState('');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('5432');
  const [dbDatabase, setDbDatabase] = useState('');
  const [dbUsername, setDbUsername] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [dbSsl, setDbSsl] = useState(false);
  const [dbConnectionString, setDbConnectionString] = useState('');
  const [dbErrors, setDbErrors] = useState<Record<string, string>>({});

  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);

  const scrollToContent = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const dbProviders = [
    { id: 'postgresql', label: 'PostgreSQL', port: '5432', color: '#336791' },
    { id: 'mysql', label: 'MySQL', port: '3306', color: '#4479A1' },
    { id: 'mongodb', label: 'MongoDB', port: '27017', color: '#47A248' },
    { id: 'sqlserver', label: 'SQL Server', port: '1433', color: '#CC2927' },
    { id: 'redis', label: 'Redis', port: '6379', color: '#DC382D' },
  ];

  const fetchIntegrations = useCallback(async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    try {
      setLoadingIntegrations(true);
      const { integrations } = await integrationService.getAll();
      setDbIntegrations(integrations.filter(i => i.type === 'database'));

      const routingApi = integrations.find(i => i.type === 'api' && i.provider === 'routing');
      if (routingApi) {
        setRoutingId(routingApi._id);
        const cfg: any = routingApi.config || {};
        setRoutingProvider((cfg.provider as 'public' | 'local') || 'local');
        setOsrmUrlMasked(cfg.url || '');
        setOsrmUrl('');
        setRoutingSavedStatus(routingApi.status || null);
      } else {
        setRoutingSavedStatus(null);
      }
      const weatherApi = integrations.find(i => i.type === 'api' && i.provider === 'openweather');
      if (weatherApi) {
        setOpenWeatherId(weatherApi._id);
        setOpenWeatherMasked(weatherApi.config.apiKey || '');
        setWeatherSavedStatus(weatherApi.status || null);
      } else {
        setWeatherSavedStatus(null);
      }
      const trafficApi = integrations.find(i => i.type === 'api' && i.provider === 'traffic');
      if (trafficApi) {
        setTrafficApiId(trafficApi._id);
        setTrafficApiMasked(trafficApi.config.apiKey || '');
        setTrafficProvider((trafficApi.config.trafficProvider as string) || 'tomtom');
        setTrafficSavedStatus(trafficApi.status || null);
      } else {
        setTrafficSavedStatus(null);
      }
    } catch {
      // silently fail on initial load
    } finally {
      setLoadingIntegrations(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [pathname]);

  useEffect(() => {
    if (showAddDb || editingDb) {
      const defaults = dbProviders.find(p => p.id === (editingDb?.provider || dbProvider));
      if (defaults && !editingDb) {
        setDbPort('');
      }
    }
  }, [dbProvider, showAddDb, editingDb]);

  useEffect(() => {
    if (showAddDb && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showAddDb]);

  const resetDbForm = () => {
    setDbProvider('postgresql');
    setDbName('');
    setDbHost('');
    setDbPort('');
    setDbDatabase('');
    setDbUsername('');
    setDbPassword('');
    setDbSsl(false);
    setDbConnectionString('');
    setDbErrors({});
    setEditingDb(null);
    setShowAddDb(false);
  };

  const startEditDb = (integration: Integration) => {
    setEditingDb(integration);
    setDbProvider(integration.provider);
    setDbName(integration.name);
    const hasConnectionString = !!integration.config.connectionString;
    setDbHost(hasConnectionString ? '' : (integration.config.host || 'localhost'));
    setDbPort(hasConnectionString ? '' : String(integration.config.port || ''));
    setDbDatabase(integration.config.database || '');
    setDbUsername(hasConnectionString ? '' : (integration.config.username || ''));
    setDbPassword('');
    setDbSsl(integration.config.ssl || false);
    setDbConnectionString(integration.config.connectionString || '');
    setShowAddDb(true);
  };

  const handleSaveDb = async () => {
    const errors: Record<string, string> = {};
    const hasConnectionString = !!dbConnectionString.trim();
    if (!dbName.trim()) errors.name = 'Connection name is required.';
    if (!hasConnectionString) {
      if (!dbHost.trim()) errors.host = 'Host is required.';
      if (!dbPort.trim()) errors.port = 'Port is required.';
      if (!dbUsername.trim()) errors.username = 'Username is required.';
      if (!dbPassword.trim() && !editingDb) errors.password = 'Password is required.';
    }
    if (!dbDatabase.trim()) errors.database = 'Database name is required.';

    setDbErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSaving(true);
      const config: DatabaseConfig = {
        host: dbHost,
        port: parseInt(dbPort) || undefined,
        database: dbDatabase,
        username: dbUsername,
        password: dbPassword,
        ssl: dbSsl,
        connectionString: dbConnectionString || undefined,
      };

      if (editingDb) {
        await integrationService.update(editingDb._id, { name: dbName, config });
        toast.success('Database connection updated.');
      } else {
        await integrationService.create({
          type: 'database',
          name: dbName,
          provider: dbProvider,
          config,
        });
        toast.success('Database connection created. Test it to verify.');
      }

      resetDbForm();
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save database connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id);
      const result = await integrationService.testConnection(id);
      toast[result.result.success ? 'success' : 'error'](result.message);
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Connection test failed.');
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteDb = async (id: string) => {
    try {
      await integrationService.delete(id);
      toast.success('Database connection removed.');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete connection.');
    }
  };

  const handleTestApiKey = async (id: string) => {
    try {
      setTestingApiId(id);
      const result = await integrationService.testApiKey(id);
      setApiStatuses(prev => ({ ...prev, [id]: result.result }));
      if (result.result.status === 'active') {
        toast.success('API key is active');
      } else if (result.result.status === 'quota_exhausted') {
        toast.warning('API quota exhausted');
      } else {
        toast.error(result.result.message);
      }
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to test API key.');
    } finally {
      setTestingApiId(null);
    }
  };

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

  const handleSaveIntegrations = async () => {
    setIsSaving(true);
    try {
      // Save routing config
      const routingUrl = osrmUrl.trim() || undefined;
      if (routingId) {
        await integrationService.update(routingId, { config: { provider: routingProvider, url: routingProvider === 'local' ? routingUrl : undefined } });
      } else {
        const result = await integrationService.create({ type: 'api', name: 'Route Planning', provider: 'routing', config: { provider: routingProvider, url: routingProvider === 'local' ? routingUrl : undefined } });
        setRoutingId(result.integration._id);
      }

      if (openWeatherKey.trim()) {
        if (openWeatherId) {
          await integrationService.update(openWeatherId, { config: { apiKey: openWeatherKey.trim() } });
        } else {
          const result = await integrationService.create({ type: 'api', name: 'OpenWeather', provider: 'openweather', config: { apiKey: openWeatherKey.trim() } });
          setOpenWeatherId(result.integration._id);
        }
        setOpenWeatherKey('');
      }

      if (trafficApiKey.trim()) {
        if (trafficApiId) {
          await integrationService.update(trafficApiId, { config: { apiKey: trafficApiKey.trim(), trafficProvider } });
        } else {
          const result = await integrationService.create({ type: 'api', name: 'Traffic Data', provider: 'traffic', config: { apiKey: trafficApiKey.trim(), trafficProvider } });
          setTrafficApiId(result.integration._id);
        }
        setTrafficApiKey('');
      }

      await fetchIntegrations();
      toast.success('Integrations updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update integrations.');
    } finally {
      setIsSaving(false);
    }
  };

  const [testingRoutingUrl, setTestingRoutingUrl] = useState(false);
  const [routingUrlStatus, setRoutingUrlStatus] = useState<'connected' | 'error' | null>(null);
  const [routingSavedStatus, setRoutingSavedStatus] = useState<'connected' | 'disconnected' | 'error' | null>(null);

  const [testingWeatherKey, setTestingWeatherKey] = useState(false);
  const [weatherKeyStatus, setWeatherKeyStatus] = useState<'active' | 'invalid_key' | 'error' | null>(null);
  const [weatherSavedStatus, setWeatherSavedStatus] = useState<'connected' | 'disconnected' | 'error' | null>(null);

  const [testingTrafficKey, setTestingTrafficKey] = useState(false);
  const [trafficKeyStatus, setTrafficKeyStatus] = useState<'active' | 'invalid_key' | 'error' | null>(null);
  const [trafficSavedStatus, setTrafficSavedStatus] = useState<'connected' | 'disconnected' | 'error' | null>(null);

  const testWeatherKey = async () => {
    if (!openWeatherId) return toast.error('Save the integration first');
    setTestingWeatherKey(true);
    setWeatherKeyStatus(null);
    try {
      const result = await integrationService.testApiKey(openWeatherId);
      const status = result.result.status as 'active' | 'invalid_key' | 'error';
      setWeatherKeyStatus(status);
      if (status === 'active') toast.success('OpenWeather API key is active');
      else if (status === 'invalid_key') toast.error('API key is invalid');
      else toast.error(result.result.message);
      setWeatherSavedStatus(result.status as 'connected' | 'disconnected' | 'error');
      fetchIntegrations();
    } catch {
      setWeatherKeyStatus('error');
      toast.error('Failed to test OpenWeather API key');
    } finally {
      setTestingWeatherKey(false);
    }
  };

  const testTrafficKey = async () => {
    if (!trafficApiId) return toast.error('Save the integration first');
    setTestingTrafficKey(true);
    setTrafficKeyStatus(null);
    try {
      const result = await integrationService.testApiKey(trafficApiId);
      const status = result.result.status as 'active' | 'invalid_key' | 'error';
      setTrafficKeyStatus(status);
      if (status === 'active') toast.success(`${trafficProvider} API key is active`);
      else if (status === 'invalid_key') toast.error('API key is invalid');
      else toast.error(result.result.message);
      setTrafficSavedStatus(result.status as 'connected' | 'disconnected' | 'error');
      fetchIntegrations();
    } catch {
      setTrafficKeyStatus('error');
      toast.error(`Failed to test ${trafficProvider} API key`);
    } finally {
      setTestingTrafficKey(false);
    }
  };

  const testRoutingUrl = async () => {
    if (routingProvider === 'local' && !osrmUrl.trim() && !osrmUrlMasked) {
      setRoutingUrlStatus('error');
      toast.error('Enter a localhost address first');
      return;
    }
    const url = (osrmUrl.trim() || osrmUrlMasked || 'https://router.project-osrm.org').replace(/\/+$/, '');
    setTestingRoutingUrl(true);
    setRoutingUrlStatus(null);
    try {
      const response = await fetch(`${url}/route/v1/driving/77.1025,28.7041;77.2090,28.5272?overview=false`, { signal: AbortSignal.timeout(5000) });
      setRoutingUrlStatus(response.ok ? 'connected' : 'error');
      if (response.ok) toast.success('OSRM server is reachable');
      else toast.error(`OSRM returned status ${response.status}`);
    } catch {
      setRoutingUrlStatus('error');
      toast.error('Cannot reach OSRM server');
    } finally {
      setTestingRoutingUrl(false);
    }
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

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 py-12">
        <div className="transition-all duration-300">
          <h1 className="text-[32px] font-bold text-[#222222] mb-2 tracking-tight">Account</h1>
          <p className="text-[18px] font-normal text-[#222222] mb-8">
            <span className="font-bold">{user?.name}</span>, {user?.email}
          </p>

          {/* Mobile: Grid Cards */}
          <div className="md:hidden grid grid-cols-1 gap-4 mb-8">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); scrollToContent(); }}
                className={`p-5 rounded-[14px] cursor-pointer transition-all duration-200 border flex items-center gap-4 ${
                  activeTab === tab.id
                    ? 'bg-[#222222] border-[#222222] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                    : 'bg-white border-[#dddddd] hover:border-[#222222]'
                }`}
              >
                <div className={`p-2.5 rounded-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-[#f7f7f7]'}`}>
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-[#222222]'}`} strokeWidth={2} />
                </div>
                <div>
                  <h3 className={`text-[15px] font-bold ${activeTab === tab.id ? 'text-white' : 'text-[#222222]'}`}>{tab.label}</h3>
                  <p className={`text-[12px] ${activeTab === tab.id ? 'text-white/70' : 'text-[#6a6a6a]'}`}>{tab.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Pill Tab Bar */}
          <div className="hidden md:flex gap-2 mb-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#222222] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                    : 'bg-[#f7f7f7] text-[#6a6a6a] hover:bg-[#eeeeee] hover:text-[#222222] border border-[#dddddd]'
                }`}
              >
                <tab.icon className="w-4 h-4" strokeWidth={2} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={contentRef} className="max-w-2xl w-full">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div key="profile" className="transition-all duration-300">
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
                        <p className="text-[#6a6a6a] text-[14px] capitalize">{user?.role}</p>
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
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div key="notifications" className="transition-all duration-300">
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
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <div key="appearance" className="transition-all duration-300">
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
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div key="security" className="transition-all duration-300">
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
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div key="integrations" className="transition-all duration-300">
                  <div className="space-y-0">

                    {/* Route Planning */}
                    <div className="py-6 border-b border-[#dddddd]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[18px] font-bold text-[#222222]">Route Planning (OSRM)</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (routingProvider === 'public') {
                                testRoutingUrl();
                              } else {
                                testRoutingUrl();
                              }
                            }}
                            disabled={testingRoutingUrl}
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] hover:bg-[#eeeeee] px-2 py-0.5 rounded-full border border-[#dddddd] transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${testingRoutingUrl ? 'animate-spin' : ''}`} />
                            {testingRoutingUrl ? 'Checking...' : 'Check Status'}
                          </button>
                          {routingUrlStatus === 'connected' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Reachable
                            </span>
                          )}
                          {routingUrlStatus === 'error' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Unreachable
                            </span>
                          )}
                          {!routingUrlStatus && routingId && routingProvider === 'public' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          )}
                          {!routingUrlStatus && routingProvider === 'local' && !osrmUrlMasked && !osrmUrl.trim() && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Not Configured
                            </span>
                          )}
                          {!routingUrlStatus && routingProvider === 'local' && (osrmUrlMasked || osrmUrl.trim()) && routingSavedStatus === 'connected' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          )}
                          {!routingUrlStatus && routingProvider === 'local' && (osrmUrlMasked || osrmUrl.trim()) && routingSavedStatus !== 'connected' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Not Connected
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[14px] text-[#6a6a6a] mb-4">Used for live routing, direction, and route optimization.</p>

                      <div className="flex gap-3 mb-4">
                        <button
                          onClick={() => { setRoutingProvider('public'); setRoutingUrlStatus(null); }}
                          className={`flex-1 py-3 px-4 rounded-[10px] text-[14px] font-bold border-2 transition-all ${
                            routingProvider === 'public'
                              ? 'border-[#222222] bg-[#222222] text-white'
                              : 'border-[#dddddd] bg-white text-[#6a6a6a] hover:border-[#222222]'
                          }`}
                        >
                          Public OSRM
                        </button>
                        <button
                          onClick={() => { setRoutingProvider('local'); setRoutingUrlStatus(null); }}
                          className={`flex-1 py-3 px-4 rounded-[10px] text-[14px] font-bold border-2 transition-all ${
                            routingProvider === 'local'
                              ? 'border-[#222222] bg-[#222222] text-white'
                              : 'border-[#dddddd] bg-white text-[#6a6a6a] hover:border-[#222222]'
                          }`}
                        >
                          Local Docker
                        </button>
                      </div>

                      {routingProvider === 'local' && (
                        <>
                          {osrmUrlMasked && (
                            <div className="mb-3 px-4 py-2.5 bg-[#f7f7f7] border border-[#dddddd] rounded-[8px] font-mono text-[14px] text-[#6a6a6a]">
                              {osrmUrlMasked}
                            </div>
                          )}
                          <input
                            type="text"
                            value={osrmUrl}
                            onChange={(e) => { setOsrmUrl(e.target.value); setRoutingUrlStatus(null); }}
                            className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors font-mono"
                            placeholder={osrmUrlMasked ? 'Enter new URL to replace' : 'http://localhost:5000'}
                          />
                          <p className="text-[12px] text-[#6a6a6a] mt-1.5">Run OSRM via Docker: <code className="bg-[#f7f7f7] px-1.5 py-0.5 rounded">docker run -p 5000:5000 osrm/osrm-backend</code></p>
                        </>
                      )}

                      {routingProvider === 'public' && (
                        <div className="px-4 py-3 bg-[#f7f7f7] border border-[#dddddd] rounded-[8px]">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-[13px] font-bold text-[#222222]">Using public OSRM</span>
                          </div>
                          <p className="text-[12px] text-[#6a6a6a] mt-1">No configuration needed. Requests are throttled to 1/sec.</p>
                        </div>
                      )}
                    </div>

                    {/* OpenWeather API */}
                    <div className="py-6 border-b border-[#dddddd]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[18px] font-bold text-[#222222]">OpenWeather API</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => testWeatherKey()}
                            disabled={testingWeatherKey}
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] hover:bg-[#eeeeee] px-2 py-0.5 rounded-full border border-[#dddddd] transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${testingWeatherKey ? 'animate-spin' : ''}`} />
                            {testingWeatherKey ? 'Checking...' : 'Check Status'}
                          </button>
                          {weatherKeyStatus === 'active' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                          {weatherKeyStatus === 'invalid_key' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Invalid Key
                            </span>
                          )}
                          {weatherKeyStatus === 'error' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                          {!weatherKeyStatus && weatherSavedStatus === 'connected' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          )}
                          {!weatherKeyStatus && weatherSavedStatus !== 'connected' && openWeatherId && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] px-2 py-0.5 rounded-full">
                              Not Tested
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[14px] text-[#6a6a6a] mb-4">Weather risk assessment and route optimization. Free tier: 1000 calls/day.</p>
                      {openWeatherMasked && (
                        <div className="mb-3 px-4 py-2.5 bg-[#f7f7f7] border border-[#dddddd] rounded-[8px] font-mono text-[14px] text-[#6a6a6a]">
                          {openWeatherMasked}
                        </div>
                      )}
                      <input
                        type="text"
                        value={openWeatherKey}
                        onChange={(e) => { setOpenWeatherKey(e.target.value); setWeatherKeyStatus(null); }}
                        className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors font-mono"
                        placeholder={openWeatherMasked ? 'Enter new key to replace' : 'Enter OpenWeather API Key'}
                      />
                      <p className="text-[12px] text-[#6a6a6a] mt-1.5">Get a free key at <span className="font-bold">openweathermap.org/api</span></p>
                    </div>

                    {/* Traffic Data API */}
                    <div className="py-6 border-b border-[#dddddd]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[18px] font-bold text-[#222222]">Traffic Data API</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => testTrafficKey()}
                            disabled={testingTrafficKey}
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] hover:bg-[#eeeeee] px-2 py-0.5 rounded-full border border-[#dddddd] transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${testingTrafficKey ? 'animate-spin' : ''}`} />
                            {testingTrafficKey ? 'Checking...' : 'Check Status'}
                          </button>
                          {trafficKeyStatus === 'active' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                          {trafficKeyStatus === 'invalid_key' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Invalid Key
                            </span>
                          )}
                          {trafficKeyStatus === 'error' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                          {!trafficKeyStatus && trafficSavedStatus === 'connected' && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          )}
                          {!trafficKeyStatus && trafficSavedStatus !== 'connected' && trafficApiId && (
                            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] px-2 py-0.5 rounded-full">
                              Not Tested
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[14px] text-[#6a6a6a] mb-4">Real-time traffic intelligence for delay prediction and ETA accuracy.</p>

                      <div className="flex gap-2 mb-4">
                        {[
                          { id: 'tomtom', label: 'TomTom' },
                          { id: 'here', label: 'HERE' },
                          { id: 'mapbox', label: 'Mapbox' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setTrafficProvider(p.id)}
                            className={`px-4 py-2 rounded-[8px] text-[13px] font-bold border transition-all ${
                              trafficProvider === p.id
                                ? 'border-[#222222] bg-[#222222] text-white'
                                : 'border-[#dddddd] bg-white text-[#6a6a6a] hover:border-[#222222]'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      {trafficApiMasked && (
                        <div className="mb-3 px-4 py-2.5 bg-[#f7f7f7] border border-[#dddddd] rounded-[8px] font-mono text-[14px] text-[#6a6a6a]">
                          {trafficApiMasked}
                        </div>
                      )}
                      <input
                        type="text"
                        value={trafficApiKey}
                        onChange={(e) => { setTrafficApiKey(e.target.value); setTrafficKeyStatus(null); }}
                        className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors font-mono"
                        placeholder={trafficApiMasked ? 'Enter new key to replace' : `Enter ${trafficProvider === 'tomtom' ? 'TomTom' : trafficProvider === 'here' ? 'HERE' : 'Mapbox'} API Key`}
                      />
                      <p className="text-[12px] text-[#6a6a6a] mt-1.5">
                        {trafficProvider === 'tomtom' && 'Get a key at developer.tomtom.com (free tier available)'}
                        {trafficProvider === 'here' && 'Get a key at developer.here.com (free tier available)'}
                        {trafficProvider === 'mapbox' && 'Get a key at mapbox.com/account/access-tokens'}
                      </p>
                    </div>

                    {/* Slack Notifications */}
                    <div className="py-6 border-b border-[#dddddd] flex items-center justify-between">
                      <div>
                        <h4 className="text-[18px] font-bold text-[#222222]">Slack Notifications</h4>
                        <p className="text-[14px] text-[#6a6a6a]">Send high-priority alerts directly to Slack channels.</p>
                      </div>
                      <button className="text-[14px] font-bold underline text-[#222222]">Connect</button>
                    </div>

                    <div className="pt-8 pb-2">
                      <button onClick={handleSaveIntegrations} disabled={isSaving} className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Integrations
                      </button>
                    </div>
                  </div>

                    {/* Database Connections Section */}
                  <div className="mt-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-[20px] font-bold text-[#222222] flex items-center gap-2">
                          <Database className="w-5 h-5" /> Database Connections
                        </h3>
                        <p className="text-[14px] text-[#6a6a6a] mt-1">Connect to your company's databases to sync data.</p>
                      </div>
                      <button
                        onClick={() => { resetDbForm(); setShowAddDb(true); }}
                        className="flex items-center justify-center gap-2 bg-[#222222] text-white text-[14px] font-bold px-4 py-2.5 rounded-[8px] hover:bg-black transition-colors shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Database
                      </button>
                    </div>

                    {/* Existing Connections */}
                    {loadingIntegrations ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#6a6a6a]" />
                      </div>
                    ) : dbIntegrations.length === 0 && !showAddDb ? (
                      <div className="py-12 text-center border border-dashed border-[#dddddd] rounded-[14px]">
                        <Database className="w-10 h-10 text-[#dddddd] mx-auto mb-3" />
                        <p className="text-[14px] text-[#6a6a6a]">No database connections yet.</p>
                        <p className="text-[12px] text-[#6a6a6a] mt-1">Click "Add Database" to connect to PostgreSQL, MySQL, MongoDB, and more.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dbIntegrations.map((db) => {
                          const providerInfo = dbProviders.find(p => p.id === db.provider);
                          return (
                            <div key={db._id} className="border border-[#dddddd] rounded-[14px] p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: providerInfo?.color + '15' }}>
                                    <Database className="w-5 h-5" style={{ color: providerInfo?.color }} />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-[16px] font-bold text-[#222222] truncate">{db.name}</h4>
                                    <p className="text-[13px] text-[#6a6a6a] truncate">{providerInfo?.label} &middot; {db.config.connectionString ? (() => { try { const url = new URL(db.config.connectionString.replace(/\+/g, '.')); return url.hostname + (url.pathname !== '/' ? url.pathname : ''); } catch { return 'connection string'; } })() : `${db.config.host}:${db.config.port}`}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      {db.status === 'connected' && (
                                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                          <CheckCircle2 className="w-3 h-3" /> Connected
                                        </span>
                                      )}
                                      {db.status === 'error' && (
                                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                          <XCircle className="w-3 h-3" /> Error
                                        </span>
                                      )}
                                      {db.status === 'disconnected' && (
                                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#6a6a6a] bg-[#f7f7f7] px-2 py-0.5 rounded-full">
                                          Not tested
                                        </span>
                                      )}
                                      {db.lastTestedResult && (
                                        <span className="text-[11px] text-[#6a6a6a]">
                                          Last tested: {new Date(db.lastTestedAt!).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleTestConnection(db._id)}
                                    disabled={testingId === db._id}
                                    className="text-[13px] font-bold text-[#222222] underline hover:text-primary transition-colors disabled:opacity-50"
                                  >
                                    {testingId === db._id ? 'Testing...' : 'Test'}
                                  </button>
                                  <button
                                    onClick={() => startEditDb(db)}
                                    className="text-[13px] font-bold text-[#222222] underline hover:text-primary transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDb(db._id)}
                                    className="p-1.5 rounded-[6px] hover:bg-red-50 text-[#6a6a6a] hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {db.lastTestedResult && !db.lastTestedResult.success && (
                                <p className="text-[12px] text-red-500 mt-3 bg-red-50 px-3 py-2 rounded-[8px]">
                                  {db.lastTestedResult.message}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add/Edit Database Form */}
                    {showAddDb && (
                      <div ref={editFormRef} className="mt-6 border border-[#dddddd] rounded-[14px] p-4 sm:p-6">
                        <h4 className="text-[16px] font-bold text-[#222222] mb-5">
                          {editingDb ? 'Edit Database Connection' : 'New Database Connection'}
                        </h4>

                        {/* Provider Selection */}
                        <div className="mb-5">
                          <label className="text-[13px] font-bold text-[#222222] mb-3 block">Database Type</label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {dbProviders.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  if (editingDb) return;
                                  setDbProvider(p.id);
                                  setDbPort(p.port);
                                }}
                                disabled={!!editingDb}
                                className={`py-2.5 px-2 sm:px-3 rounded-[8px] text-[12px] sm:text-[13px] font-bold border transition-all truncate ${
                                  dbProvider === p.id
                                    ? 'border-[#222222] bg-[#222222] text-white'
                                    : 'border-[#dddddd] bg-white text-[#6a6a6a] hover:border-[#222222]'
                                } ${editingDb ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Connection Name */}
                        <div className="mb-4">
                          <label className="text-[13px] font-bold text-[#222222] mb-2 block">Connection Name</label>
                          <input
                            type="text"
                            value={dbName}
                            onChange={(e) => { setDbName(e.target.value); if (dbErrors.name) setDbErrors(prev => { const next = { ...prev }; delete next.name; return next; }); }}
                            className={`w-full px-4 py-3 bg-white border rounded-[8px] text-[14px] focus:outline-none transition-colors ${dbErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#dddddd] focus:border-[#222222] focus:ring-1 focus:ring-[#222222]'}`}
                            placeholder="e.g. Production Database"
                          />
                          {dbErrors.name && <p className="text-[12px] text-red-500 mt-1.5">{dbErrors.name}</p>}
                        </div>

                        {/* Connection String or Individual Fields */}
                        {(dbProvider === 'mongodb' || dbProvider === 'redis') ? (
                          <div className="mb-4">
                            <label className="text-[13px] font-bold text-[#222222] mb-2 block">Connection String (optional)</label>
                            <input
                              type="text"
                              value={dbConnectionString}
                              onChange={(e) => setDbConnectionString(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-[#dddddd] rounded-[8px] text-[13px] sm:text-[14px] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-colors font-mono"
                              placeholder={dbProvider === 'mongodb' ? 'mongodb://user:pass@host:27017/db' : 'redis://:pass@host:6379'}
                            />
                            <p className="text-[12px] text-[#6a6a6a] mt-1.5">Or fill in the fields below.</p>
                          </div>
                        ) : null}

                        {!dbConnectionString.trim() && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-[13px] font-bold text-[#222222] mb-2 block">Host</label>
                                <input
                                  type="text"
                                  value={dbHost}
                                  onChange={(e) => { setDbHost(e.target.value); if (dbErrors.host) setDbErrors(prev => { const next = { ...prev }; delete next.host; return next; }); }}
                                  className={`w-full px-4 py-3 bg-white border rounded-[8px] text-[14px] focus:outline-none transition-colors ${dbErrors.host ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#dddddd] focus:border-[#222222] focus:ring-1 focus:ring-[#222222]'}`}
                                  placeholder="localhost"
                                />
                                {dbErrors.host && <p className="text-[12px] text-red-500 mt-1.5">{dbErrors.host}</p>}
                              </div>
                              <div>
                                <label className="text-[13px] font-bold text-[#222222] mb-2 block">Port</label>
                                <input
                                  type="text"
                                  value={dbPort}
                                  onChange={(e) => { setDbPort(e.target.value); if (dbErrors.port) setDbErrors(prev => { const next = { ...prev }; delete next.port; return next; }); }}
                                  className={`w-full px-4 py-3 bg-white border rounded-[8px] text-[14px] focus:outline-none transition-colors ${dbErrors.port ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#dddddd] focus:border-[#222222] focus:ring-1 focus:ring-[#222222]'}`}
                                  placeholder={dbProviders.find(p => p.id === dbProvider)?.port}
                                />
                                {dbErrors.port && <p className="text-[12px] text-red-500 mt-1.5">{dbErrors.port}</p>}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="text-[13px] font-bold text-[#222222] mb-2 block">Username</label>
                                <input
                                  type="text"
                                  value={dbUsername}
                                  onChange={(e) => { setDbUsername(e.target.value); if (dbErrors.username) setDbErrors(prev => { const next = { ...prev }; delete next.username; return next; }); }}
                                  className={`w-full px-4 py-3 bg-white border rounded-[8px] text-[14px] focus:outline-none transition-colors ${dbErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#dddddd] focus:border-[#222222] focus:ring-1 focus:ring-[#222222]'}`}
                                  placeholder="Username"
                                />
                                {dbErrors.username && <p className="text-[12px] text-red-500 mt-1.5">{dbErrors.username}</p>}
                              </div>
                              <div>
                                <label className="text-[13px] font-bold text-[#222222] mb-2 block">Password</label>
                                <input
                                  type="password"
                                  value={dbPassword}
                                  onChange={(e) => { setDbPassword(e.target.value); if (dbErrors.password) setDbErrors(prev => { const next = { ...prev }; delete next.password; return next; }); }}
                                  className={`w-full px-4 py-3 bg-white border rounded-[8px] text-[14px] focus:outline-none transition-colors ${dbErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#dddddd] focus:border-[#222222] focus:ring-1 focus:ring-[#222222]'}`}
                                  placeholder={editingDb ? 'Leave blank to keep current' : 'Password'}
                                />
                                {dbErrors.password && <p className="text-[12px] text-red-500 mt-1.5">{dbErrors.password}</p>}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="mb-4">
                          <label className="text-[13px] font-bold text-[#222222] mb-2 block">Database Name</label>
                          <input
                            type="text"
                            value={dbDatabase}
                            onChange={(e) => { setDbDatabase(e.target.value); if (dbErrors.database) setDbErrors(prev => { const next = { ...prev }; delete next.database; return next; }); }}
                            className={`w-full px-4 py-3 bg-white border rounded-[8px] text-[14px] focus:outline-none transition-colors ${dbErrors.database ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#dddddd] focus:border-[#222222] focus:ring-1 focus:ring-[#222222]'}`}
                            placeholder="e.g. logipilot_prod"
                          />
                          {dbErrors.database && <p className="text-[12px] text-red-500 mt-1.5">{dbErrors.database}</p>}
                        </div>

                        {(dbProvider === 'postgresql' || dbProvider === 'mysql' || dbProvider === 'sqlserver') && (
                          <div className="mb-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dbSsl}
                                onChange={(e) => setDbSsl(e.target.checked)}
                                className="w-5 h-5 rounded-[6px] text-primary border-[#dddddd] focus:ring-primary focus:ring-2 cursor-pointer"
                              />
                              <div>
                                <span className="text-[14px] font-bold text-[#222222]">Enable SSL</span>
                                <p className="text-[12px] text-[#6a6a6a]">Recommended for production connections.</p>
                              </div>
                            </label>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            onClick={handleSaveDb}
                            disabled={isSaving}
                            className="bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-[8px] hover:bg-black transition-colors inline-flex items-center justify-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingDb ? 'Update Connection' : 'Save Connection'}
                          </button>
                          <button
                            onClick={resetDbForm}
                            className="text-[14px] font-bold text-[#6a6a6a] px-4 py-3 rounded-[8px] hover:bg-[#f7f7f7] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
      </div>
    </div>
  );
}
