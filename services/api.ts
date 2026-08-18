import axios from 'axios';

export const wpApi = axios.create({
  baseURL: 'https://epcbits.com/wp-json/wp/v2', // Root directory
});

// Intercept all outgoing requests
wpApi.interceptors.request.use((config) => {
  // Print fully constructed URL trying to be hit to log
  console.log(`📡 [API REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Intercept all incoming responses/errors
wpApi.interceptors.response.use(
  (response) => {
    console.log(`✅ [API RES] ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ [API ERR] ${error.response?.status} from ${error.config?.url}`);
    return Promise.reject(error);
  }
);

export const fetchArticleById = async (id: string): Promise<EPCArticle> => {
  try {
    const response = await wpApi.get(`/posts/${id}?_embed`);
    return response.data;
  } catch (error: any) {
    // If post not found (404), fallback to pages endpoint
    if (error.response?.status === 404) {
      const pageResponse = await wpApi.get(`/pages/${id}?_embed`);
      return pageResponse.data;
    }
    throw error;
  }
};

export const fetchArticleBySlug = async (slug: string): Promise<EPCArticle> => {
  const response = await wpApi.get(`/posts?slug=${slug}&_embed`);
  // WordPress returns an array when querying by slug
  if (response.data && response.data.length > 0) {
    return response.data[0];
  }
  // If post array is empty, fallback to pages endpoint
  const pageResponse = await wpApi.get(`/pages?slug=${slug}&_embed`);
  if (!pageResponse.data || pageResponse.data.length === 0) {
    throw new Error("Article not found");
  }
  return pageResponse.data[0];
};

// Define shape of WordPress JSON payload
export interface EPCArticle {
  id: number;
  date: string;
  link: string;
  categories: number[];
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          thumbnail?: {
            source_url: string;
          };
        };
      };
    }>;
    'wp:term'?: Array<Array<{ name: string }>>;
  };
  jetpack_featured_media_url?: string;
}