import { useQuery, QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATALOG_URL = 'https://cdn.jsdelivr.net/gh/ABRTPDR/epc-app-publications@main/catalog.json';
const CACHE_KEY = 'epc_catalog_offline_backup';

export const useCatalog = () => {
  return useQuery({
    queryKey: ['epc_catalog'],
    queryFn: async () => {
      try {
        // Fetch fresh data from GitHub CDN
        const res = await fetch(CATALOG_URL);
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        
        // Save the fresh data to the phone's physical storage
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        return data;
        
      } catch (error) {
        console.log('Network failed, checking offline storage');
        // If offline, check disk
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) return JSON.parse(cachedData);
        
        throw new Error('No offline catalog available');
      }
    },
    // Keep data fresh for 6 hours before fetching again
    staleTime: 1000 * 60 * 60 * 6,
  });
};

// Utility function to pre-load disk cache during the splash screen
export const loadCatalogFromDisk = async (queryClient: QueryClient) => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedData) {
      // Inject the disk data straight into React Query's memory instantly
      queryClient.setQueryData(['epc_catalog'], JSON.parse(cachedData));
    }
  } catch (e) {
    console.log('Failed to load catalog from disk');
  }
};