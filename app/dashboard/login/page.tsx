"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const supabase = createClient();
		const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
		if (authError) { setError(authError.message); setLoading(false); return; }
		router.push("/dashboard");
		router.refresh();
	};

	return (
		<div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
			{/* Background — matching landing page style */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-accent/5 blur-[120px]" />
				<div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]" />
			</div>

			<div className="relative z-10 w-full max-w-md px-6 dash-animate-in">
				{/* Logo */}
				<div className="mb-10 text-center">
					<Link href="/" className="group inline-flex items-center gap-2.5 no-underline">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-lg text-white shadow-lg shadow-accent/20">
							T
						</div>
						<span className="font-Helvetica-Neue text-2xl font-bold text-primary">
							Twin<span className="text-accent">O</span>
						</span>
					</Link>
					<p className="mt-3 text-sm text-primary/50">Sign in to your agency dashboard</p>
				</div>

				{/* Login Card — glassmorphism like landing */}
				<div className="rounded-2xl border border-black/5 bg-white/60 p-8 shadow-xl backdrop-blur-md">
					<form onSubmit={handleLogin} className="space-y-5">
						{error && (
							<div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dash-animate-scale">
								<span className="shrink-0 text-base">⚠️</span>{error}
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="login-email" className="block text-sm font-medium text-primary/70">Email</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
								<input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agency.com" required className="w-full rounded-xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-sm text-primary placeholder-primary/30 transition-all duration-200 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/10" />
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="login-password" className="block text-sm font-medium text-primary/70">Password</label>
							<div className="relative">
								<input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full rounded-xl border border-black/10 bg-white py-3.5 pl-4 pr-12 text-sm text-primary placeholder-primary/30 transition-all duration-200 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/10" />
								<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary/50">
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
							{loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
						</button>
					</form>
				</div>

				<p className="mt-6 text-center text-sm text-primary/40">
					Don&apos;t have an account?{" "}
					<Link href="/dashboard/register" className="font-medium text-accent no-underline hover:text-accent/80">Register your agency</Link>
				</p>
			</div>
		</div>
	);
}
