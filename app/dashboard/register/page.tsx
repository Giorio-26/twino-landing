"use client";

import {
	ArrowRight,
	Building2,
	Eye,
	EyeOff,
	Loader2,
	Mail,
	Phone,
	User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		agencyName: "",
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const updateField = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		const supabase = createClient();
		const { error: authError } = await supabase.auth.signUp({
			email: formData.email,
			password: formData.password,
			options: {
				data: {
					agency_name: formData.agencyName,
					first_name: formData.firstName,
					last_name: formData.lastName,
					phone: formData.phone,
				},
			},
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
		<div className="dashboard-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-dash-bg py-12">
			{/* Background effects */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 right-0 h-[500px] w-[700px] rounded-full bg-dash-accent/5 blur-[120px]" />
				<div className="absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-dash-purple/5 blur-[100px]" />
				<div
					className="absolute inset-0 opacity-[0.015]"
					style={{
						backgroundImage:
							"radial-gradient(var(--dash-text-muted) 1px, transparent 1px)",
						backgroundSize: "32px 32px",
					}}
				/>
			</div>

			<div className="relative z-10 w-full max-w-lg px-6 dash-animate-in">
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
						Register your real estate agency
					</p>
				</div>

				{/* Register Card */}
				<div className="rounded-2xl border border-dash-border bg-dash-surface/80 p-8 backdrop-blur-xl">
					<form onSubmit={handleRegister} className="space-y-5">
						{/* Error */}
						{error && (
							<div className="flex items-center gap-3 rounded-xl border border-dash-danger/20 bg-dash-danger-muted p-4 text-sm text-dash-danger dash-animate-scale">
								<span className="shrink-0 text-base">⚠️</span>
								{error}
							</div>
						)}

						{/* Agency Name */}
						<div className="space-y-2">
							<label htmlFor="reg-agency" className="block text-sm font-medium text-dash-text-secondary">
								Agency Name
							</label>
							<div className="relative">
								<Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
								<input
									id="reg-agency"
									type="text"
									value={formData.agencyName}
									onChange={(e) => updateField("agencyName", e.target.value)}
									placeholder="Sakura Properties"
									required
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-11 pr-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
							</div>
						</div>

						{/* Name Row */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="reg-first" className="block text-sm font-medium text-dash-text-secondary">
									First Name
								</label>
								<div className="relative">
									<User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
									<input
										id="reg-first"
										type="text"
										value={formData.firstName}
										onChange={(e) => updateField("firstName", e.target.value)}
										placeholder="John"
										required
										className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-11 pr-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<label htmlFor="reg-last" className="block text-sm font-medium text-dash-text-secondary">
									Last Name
								</label>
								<input
									id="reg-last"
									type="text"
									value={formData.lastName}
									onChange={(e) => updateField("lastName", e.target.value)}
									placeholder="Doe"
									required
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
							</div>
						</div>

						{/* Email */}
						<div className="space-y-2">
							<label htmlFor="reg-email" className="block text-sm font-medium text-dash-text-secondary">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
								<input
									id="reg-email"
									type="email"
									value={formData.email}
									onChange={(e) => updateField("email", e.target.value)}
									placeholder="john@sakuraproperties.ge"
									required
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-11 pr-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
							</div>
						</div>

						{/* Phone */}
						<div className="space-y-2">
							<label htmlFor="reg-phone" className="block text-sm font-medium text-dash-text-secondary">
								Phone
							</label>
							<div className="relative">
								<Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
								<input
									id="reg-phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => updateField("phone", e.target.value)}
									placeholder="+995 555 123 456"
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-11 pr-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
							</div>
						</div>

						{/* Password */}
						<div className="space-y-2">
							<label htmlFor="reg-password" className="block text-sm font-medium text-dash-text-secondary">
								Password
							</label>
							<div className="relative">
								<input
									id="reg-password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) => updateField("password", e.target.value)}
									placeholder="••••••••"
									required
									className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 pl-4 pr-12 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-dash-text-muted transition-colors hover:text-dash-text-secondary"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="space-y-2">
							<label htmlFor="reg-confirm" className="block text-sm font-medium text-dash-text-secondary">
								Confirm Password
							</label>
							<input
								id="reg-confirm"
								type="password"
								value={formData.confirmPassword}
								onChange={(e) => updateField("confirmPassword", e.target.value)}
								placeholder="••••••••"
								required
								className="w-full rounded-xl border border-dash-border bg-dash-bg py-3.5 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20"
							/>
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
									Creating account...
								</>
							) : (
								<>
									Create Agency Account
									<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</>
							)}
						</button>
					</form>
				</div>

				{/* Login Link */}
				<p className="mt-6 text-center text-sm text-dash-text-muted">
					Already have an account?{" "}
					<Link
						href="/dashboard/login"
						className="font-medium text-dash-accent transition-colors hover:text-dash-accent-hover no-underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
