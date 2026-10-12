
import { environment } from '../../../environments/environment';

const baseUrl = environment.apiUrl.trim().replace(/\/+$/, '');

if (!baseUrl) {
    throw new Error(
        'Stockly API URL is missing. Check the Angular environment configuration.',
    );
}

export const API_CONFIG = {
    baseUrl: `${baseUrl}/api`,
} as const;
