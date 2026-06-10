'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager', 'dispatcher', 'driver'])
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'manager' }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      const response = await authService.register(data.name, data.email, data.password, data.role);
      setAuth(response.user, response.accessToken);
      setIsNavigating(true);
      router.push('/');
    } catch (err: unknown) {
      const error = err as any;
      setError(error.response?.data?.message || 'Registration failed. Please verify your details.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      
      {/* Left Side: Clean Form */}
      <div className="w-full md:w-[480px] lg:w-[560px] flex-shrink-0 flex flex-col justify-center px-8 sm:px-16 py-12 bg-white z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 text-primary mb-12">
            <img src="/logo.svg" alt="LogiPilot Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl tracking-tight text-[#ff385c]">LogiPilot</span>
          </div>
          
          <h1 className="text-[32px] font-bold text-foreground tracking-tight mb-2">Create an account</h1>
          <p className="text-[#6a6a6a] text-base mb-8">Join the platform to manage your logistics and fleet.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {error && (
              <div className="bg-[#fff8f6] border border-[#ffd1da] text-[#c13515] p-4 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <input
                {...register('name')}
                type="text"
                className="input-airbnb w-full"
                placeholder="Full name"
              />
              {errors.name && <p className="mt-1 text-xs text-[#c13515] font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <input
                {...register('email')}
                type="email"
                className="input-airbnb w-full"
                placeholder="Email address"
              />
              {errors.email && <p className="mt-1 text-xs text-[#c13515] font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register('password')}
                type="password"
                className="input-airbnb w-full"
                placeholder="Password (min 8 characters)"
              />
              {errors.password && <p className="mt-1 text-xs text-[#c13515] font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <select
                {...register('role')}
                className="input-airbnb w-full bg-white appearance-none"
              >
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <p className="text-xs text-[#6a6a6a] py-2">
              By selecting <strong>Agree and continue</strong>, I agree to LogiPilot's Terms of Service, Payments Terms of Service, and Nondiscrimination Policy.
            </p>

            <button
              type="submit"
              disabled={isSubmitting || isNavigating}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting || isNavigating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Agree and continue"
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[#dddddd]">
            <p className="text-[14px] text-[#222222]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold underline hover:text-black">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Right Side: Photography */}
      <div className="hidden md:block flex-1 bg-[#f7f7f7] relative overflow-hidden">
        <img 
          src="/images/fleet_background.png" 
          alt="Logistics fleet on the road" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <h2 className="text-white text-4xl font-bold tracking-tight mb-2 drop-shadow-md">Empower your fleet.</h2>
          <p className="text-white/90 text-lg drop-shadow-md">Get real-time visibility and predictive analytics.</p>
        </div>
      </div>

    </div>
  );
}
