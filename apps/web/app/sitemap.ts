import { MetadataRoute } from "next";
import { minikitConfig } from "@/minikit.config";

const ROOT_URL =
	process.env.NEXT_PUBLIC_URL ||
	(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
	"http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
	const routes = [
		{
			url: ROOT_URL,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 1,
		},
		{
			url: `${ROOT_URL}/trade`,
			lastModified: new Date(),
			changeFrequency: "hourly" as const,
			priority: 0.9,
		},
		{
			url: `${ROOT_URL}/protocol`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		},
	];

	return routes;
}
