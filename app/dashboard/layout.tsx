import "../globals.css";
import { helvetica, helveticaNeue } from "@/lib/fonts";

export const metadata = {
	title: "TwinO Dashboard",
	description: "AI-powered lead qualification dashboard for real estate agencies",
};

export default function DashboardRootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${helvetica.variable} ${helveticaNeue.variable} h-full antialiased`}
		>
			<body className="min-h-full bg-white">{children}</body>
		</html>
	);
}
