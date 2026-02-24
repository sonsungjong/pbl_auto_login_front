import appConfig from '../config.json'

export const API_BASE = appConfig.apiBase || 'http://localhost:55558'
export const TARGET_URL = appConfig.targetUrl || 'https://pbl-llm.vercel.app'
export const LAUNCH_TOKEN_ENDPOINT = appConfig.launchTokenEndpoint || '/api/launch-token'
export const LAUNCH_TOKEN_QUERY = appConfig.launchTokenQuery || 'cntn_key'
