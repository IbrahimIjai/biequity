import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Mono } from "next/font/google";
import { SafeArea } from "@/providers/minikit-provider";
import { minikitConfig } from "@/minikit.config";
import { seoConfig } from "@/config/seo";
import "./globals.css";
import { RootProvider } from "@/providers/root-provider";
import { Toaster } from "@/components/ui/sonner";

const ROOT_URL =
	process.env.NEXT_PUBLIC_URL ||
	(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
	"http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
	return {
		metadataBase: new URL(ROOT_URL),
		title: {
			default: seoConfig.siteTitle,
			template: `%s | ${seoConfig.siteName}`,
		},
		description: seoConfig.siteDescription,
		keywords: [...seoConfig.keywords],
		authors: [{ name: `${seoConfig.siteName} Team` }],
		creator: seoConfig.siteName,
		publisher: seoConfig.siteName,
		robots: {
			index: !minikitConfig.noindex,
			follow: !minikitConfig.noindex,
			googleBot: {
				index: !minikitConfig.noindex,
				follow: !minikitConfig.noindex,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		openGraph: {
			type: "website",
			siteName: seoConfig.siteName,
			title: minikitConfig.miniapp.ogTitle || seoConfig.siteTitle,
			description:
				minikitConfig.miniapp.ogDescription || seoConfig.siteDescription,
			url: ROOT_URL,
			images: [
				{
					url: minikitConfig.miniapp.ogImageUrl || `${ROOT_URL}/hero.png`,
					width: seoConfig.ogImage.width,
					height: seoConfig.ogImage.height,
					alt: seoConfig.ogImage.alt,
				},
				{
					url: `${ROOT_URL}/icon-512.png`,
					width: 512,
					height: 512,
					alt: `${seoConfig.siteName} Logo`,
				},
			],
			locale: "en_US",
		},
		twitter: {
			card: seoConfig.twitterCard.type,
			title: minikitConfig.miniapp.ogTitle || seoConfig.siteTitle,
			description:
				minikitConfig.miniapp.ogDescription || seoConfig.siteDescription,
			images: [minikitConfig.miniapp.ogImageUrl || `${ROOT_URL}/hero.png`],
			creator: seoConfig.twitterCard.creator,
			site: seoConfig.twitterCard.site,
		},
		icons: {
			icon: [
				{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
				{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
				{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
			],
			apple: [
				{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
				{
					url: "/apple-touch-icon-152x152.png",
					sizes: "152x152",
					type: "image/png",
				},
			],
			other: [
				{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
			],
		},
		manifest: "/manifest.json",
		verification: {
			// Add your verification codes here when you get them
			// google: "your-google-verification-code",
			// bing: "your-bing-verification-code",
		},
		category: seoConfig.categories.primary,
		classification: seoConfig.categories.classification,
		other: {
			"fc:miniapp": JSON.stringify({
				version: minikitConfig.miniapp.version,
				imageUrl: minikitConfig.miniapp.heroImageUrl,
				button: {
					title: `Launch ${minikitConfig.miniapp.name}`,
					action: {
						name: `Launch ${minikitConfig.miniapp.name}`,
						type: "launch_miniapp",
					},
				},
			}),
			"theme-color": "#000000",
			"msapplication-TileColor": "#000000",
			"msapplication-config": "/browserconfig.xml",
		},
	};
}

const spaceMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-space-mono",
});
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersObj = await headers();
	const cookies = headersObj.get("cookie");
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Additional SEO and performance tags */}
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta name="apple-mobile-web-app-title" content="Biequity" />

				{/* Preconnect to external domains for performance */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>

				{/* DNS prefetch for better performance */}
				<link rel="dns-prefetch" href="//base.org" />
				<link rel="dns-prefetch" href="//docs.base.org" />

				{/* Structured Data for better search visibility */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: seoConfig.siteName,
							description: seoConfig.siteDescription,
							url: ROOT_URL,
							applicationCategory: "FinanceApplication",
							operatingSystem: "Web",
							browserRequirements: "Requires JavaScript. Requires HTML5.",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
							creator: {
								"@type": "Organization",
								name: seoConfig.organization.name,
								description: seoConfig.organization.description,
								url: seoConfig.organization.url,
								logo: seoConfig.organization.logo,
								foundingDate: seoConfig.organization.foundingDate,
								industry: seoConfig.organization.industry,
							},
						}),
					}}
				/>
			</head>
			<body className={`${spaceMono.variable}`}>
				<RootProvider cookies={cookies}>
					<SafeArea>
						{children}
						<Toaster />
					</SafeArea>
				</RootProvider>
			</body>
		</html>
	);
}
