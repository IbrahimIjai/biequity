const getApiUrl = () => {
  return "https://cloudfare-worker.whizibrahim.workers.dev"
}

export const BIEQUITY_API_URL = getApiUrl()
export const SUPPORTED_STOCKS_ENDPOINT = `${BIEQUITY_API_URL}/api/assets/supported`
export const ASSETS_API_ENDPOINT = `${BIEQUITY_API_URL}/api/assets`
export const SETTLEMENT_EXECUTE_ENDPOINT = `${BIEQUITY_API_URL}/api/settlement/execute`
