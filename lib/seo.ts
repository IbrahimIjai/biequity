import { Metadata } from "next";
import { seoConfig } from "@/config/seo";

interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	noindex?: boolean;
	keywords?: string[];
	type?: "website" | "article";
}

export function generateSEO({
	title,
	description,
	image,
	url,
	noindex = false,
	keywords = [],
	type = "website",
}: SEOProps = {}): Metadata {
	const siteUrl = seoConfig.siteUrl;
	const pageTitle = title
		? `${title} | ${seoConfig.siteName}`
		: seoConfig.siteTitle;
	const pageDescription = description || seoConfig.siteDescription;
	const pageImage = image || `${siteUrl}/hero.png`;
	const pageUrl = url ? `${siteUrl}${url}` : siteUrl;
	const allKeywords = [...seoConfig.keywords, ...keywords];

	return {
		title: pageTitle,
		description: pageDescription,
		keywords: allKeywords,
		robots: {
			index: !noindex,
			follow: !noindex,
		},
		openGraph: {
			type,
			siteName: seoConfig.siteName,
			title: pageTitle,
			description: pageDescription,
			url: pageUrl,
			images: [
				{
					url: pageImage,
					width: seoConfig.ogImage.width,
					height: seoConfig.ogImage.height,
					alt: title
						? `${title} - ${seoConfig.siteName}`
						: seoConfig.ogImage.alt,
				},
			],
		},
		twitter: {
			card: seoConfig.twitterCard.type,
			title: pageTitle,
			description: pageDescription,
			images: [pageImage],
			creator: seoConfig.twitterCard.creator,
		},
		alternates: {
			canonical: pageUrl,
		},
	};
}

// Pre-configured SEO for common pages
export const pageSEO = {
	home: () =>
		generateSEO({
			title: "Home",
			description:
				"Start trading tokenized stocks on Base blockchain with transparent collateral backing",
			keywords: ["home", "trading platform", "tokenized stocks"],
		}),

	trade: () =>
		generateSEO({
			title: "Trade",
			description:
				"Trade tokenized equities with real-time prices. Buy and redeem stock tokens backed by USDC",
			url: "/trade",
			keywords: ["trade", "buy stocks", "sell stocks", "trading interface"],
		}),

	protocol: () =>
		generateSEO({
			title: "Protocol",
			description:
				"Learn about Biequity protocol mechanics, tokenization process, and collateral backing system",
			url: "/protocol",
			keywords: ["protocol", "how it works", "tokenization", "documentation"],
		}),
};
