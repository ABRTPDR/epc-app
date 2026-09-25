import { Directory, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { QueryClient } from '@tanstack/react-query';

// Helper to get raw bytes
export const getCacheSizeBytes = (): number => {
  const cacheDir = new Directory(Paths.cache);
  return cacheDir.size || 0;
};

// Formats bytes into a readable string
export const formatCacheSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Wiping logic
export const wipeAppCache = async (queryClient: QueryClient) => {
  try {
    queryClient.clear();
    await Image.clearMemoryCache();
    await Image.clearDiskCache();

    const cacheDir = new Directory(Paths.cache);
    if (cacheDir.exists) {
      const contents = cacheDir.list();
      for (const item of contents) {
        item.delete(); 
      }
    }
  } catch (error) {
    console.log('Error wiping cache:', error);
  }
};