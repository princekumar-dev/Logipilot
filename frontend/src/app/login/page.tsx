'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await authService.login(data.email, data.password);
      setAuth(response.user, response.accessToken);
      setIsNavigating(true);
      router.push('/');
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Authentication failed. Verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans relative">
      
      {/* Background Image (Mobile - Full Screen Backdrop) */}
      <div className="md:hidden fixed inset-0 z-0">
        <img 
          src="/images/warehouse_background.png" 
          alt="Logistics warehouse" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-center md:items-stretch">
        
        {/* Left Side: Clean Form */}
        <div className="w-full md:w-[480px] lg:w-[560px] flex-shrink-0 flex flex-col justify-center px-6 py-16 md:px-16 md:py-12 md:pt-12 md:mt-0">
          {/* Mobile: Floating Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:rounded-none md:shadow-none md:bg-white md:p-0">
            <div className="transition-all duration-300">
              {/* Logo */}
              <div className="flex items-center gap-2 text-primary mb-16">
                <img src="/logo.svg" alt="LogiPilot Logo" className="w-8 h-8 object-contain" />
                <span className="font-display font-bold text-xl tracking-tight text-[#ff385c]">LogiPilot</span>
              </div>
              
              <h1 className="text-[32px] font-bold text-foreground tracking-tight mb-2">Welcome back</h1>
              <p className="text-[#6a6a6a] text-base mb-8">Log in to manage your logistics and fleet.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {error && (
                  <div className="bg-[#fff8f6] border border-[#ffd1da] text-[#c13515] p-4 rounded-lg flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <input
                      {...register('email')}
                      type="email"
                      className="input-airbnb w-full"
                      placeholder="Email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#c13515] font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      {...register('password')}
                      type="password"
                      className="input-airbnb w-full"
                      placeholder="Password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-[#c13515] font-medium">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isNavigating}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting || isNavigating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
              
              <div className="mt-10 pt-6 border-t border-[#dddddd]">
                <p className="text-[14px] text-[#222222]">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-bold underline hover:text-black">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Photography (Desktop) */}
        <div className="hidden md:block flex-1 bg-[#f7f7f7] relative overflow-hidden">
          <img 
            src="/images/warehouse_background.png" 
            alt="Logistics warehouse" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-12 left-12 z-20">
            <h2 className="text-white text-4xl font-bold tracking-tight mb-2 drop-shadow-md">Global logistics,<br/>simplified.</h2>
            <p className="text-white/90 text-lg drop-shadow-md">Join over 10,000 fleets actively running on LogiPilot.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
