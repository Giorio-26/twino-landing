"use client";

import {
	ArrowRight,
	Building2,
	Eye,
	EyeOff,
	Loader2,
	Mail,
} from "lucide-react";
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
		const { error: authError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (authError) {
			setError(authError.message);
			setLoading(false);
			return;
		}

		router.push("/dashboard");
		router.refresh();
	};

	return (
		<div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-dash-bg">
			{/* Background effects */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-dash-accent/5 blur-[120px]" />
				<div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-dash-purple/5 blur-[100px]" />
				<div
					className="absolute inset-0 opacity-[0.015]"
					style={{
						backgroundImage:
							"radial-gradient(var(--dash-text-muted) 1px, transparent 1px)",
						backgroundSize: "32px 32px",
					}}
				/>
			</div>

			<div className="relative z-10 w-full max-w-md px-6 dash-animate-in">
				{/* Logo */}
				<div className="mb-10 text-center">
					<Link href="/" className="group inline-flex items-center gap-2.5 no-underline">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dash-accent font-bold text-lg text-white shadow-lg shadow-dash-accent/20">
							T
						</div>
						<span className="font-Helvetica-Neue text-2xl font-bold text-dash-text">
							Twin<span className="text-dash-accent">O</span>
						</span>
					</Link>
					<p className="mt-3 text-sm text-dash-text-secondary">
						Sign in to your agency dashboard
					</p>
				</div>

				{/* Login Card */}
				<div className="rounded-2xl border border-dash-border bg-dash-surface/80 p-8 backdrop-blur-xl">
					<form onSubmit={handleLogin} className="space-y-5">
						{/* Error Alert */}
						{error && (
							<div className="flex items-center gap-3 rounded-xl border border-dash-danger/20 bg-dash-danger-muted p-4 text-sm text-dash-danger dash-animate-scale">
								<span className="shrink-0 text-base">⚠️</span>
								{error}
							</div>
						)}

						{/* Email */}
						<div className="space-y-2">
							<label
								htmlFor="login-email"
								className="block text-sm font-medium text-dash-text-secondary"
							>
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
								<input
									id="login-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@agency.com"
									required
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-11 pr-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
							</div>
						</div>

						{/* Password */}
						<div className="space-y-2">
							<label
								htmlFor="login-password"
								className="block text-sm font-medium text-dash-text-secondary"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="login-password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									required
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-4 pr-12 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-dash-text-muted transition-colors hover:text-dash-text-secondary"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="group flex w-full items-center justify-center gap-2 rounded-xl bg-dash-accent py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-dash-accent-hover hover:shadow-lg hover:shadow-dash-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								<>
									Sign In
									<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</>
							)}
						</button>
					</form>
				</div>

				{/* Register Link */}
				<p className="mt-6 text-center text-sm text-dash-text-muted">
					Don&apos;t have an account?{" "}
					<Link
						href="/dashboard/register"
						className="font-medium text-dash-accent transition-colors hover:text-dash-accent-hover no-underline"
					>
						Register your agency
					</Link>
				</p>
			</div>
		</div>
	);
}
