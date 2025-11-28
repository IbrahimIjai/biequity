const getApiUrl = () => {
	if (typeof window !== "undefined") {
		return "http://127.0.0.1:8787";
	}
	return process.env.NEXT_PUBLIC_BIEQUITY_WORKER_API || "http://127.0.0.1:8787";
};

export const BIEQUITY_API_URL = getApiUrl();
export const SUPPORTED_STOCKS_ENDPOINT = `${BIEQUITY_API_URL}/api/assets/supported`;
export const ASSETS_API_ENDPOINT = `${BIEQUITY_API_URL}/api/assets`;
