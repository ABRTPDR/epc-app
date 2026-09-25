import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchTFPRecentArticles } from '@/app/(tabs)/explore/index'; 
import { getCacheSizeBytes, wipeAppCache } from '@/services/cacheManager';
import { useCatalog } from '@/hooks/useCatalog';

export {
  // Catch any errors thrown by the Layout component
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Lora: require('../assets/fonts/Lora-Regular.ttf'),
    LoraItalic: require('../assets/fonts/Lora-Italic.ttf'),
    Lato: require('../assets/fonts/Lato-Regular.ttf'),
    LatoSemibold: require('../assets/fonts/Lato-Semibold.ttf'),
    LatoBold: require('../assets/fonts/Lato-Bold.ttf'),
    LatoItalic: require('../assets/fonts/Lato-Italic.ttf'),
    LatoBoldItalic: require('../assets/fonts/Lato-Bold-Italic.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

// Create client instance outside component
const queryClient = new QueryClient();

// Invisible component that waits for the JSON, then preloads the articles
function DataPreloader() {
  const { data: catalogData } = useCatalog();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only fire the prefetch once the JSON has successfully downloaded
    if (catalogData && catalogData.TFP_YEARS_ORDER) {
      queryClient.prefetchQuery({
        queryKey: ['tfp_recent_random', catalogData.TFP_YEARS_ORDER[0]], // See logic for this in code for 'Explore' screen
        queryFn: () => fetchTFPRecentArticles(catalogData),
        staleTime: 1000 * 60 * 15,
      });
    }
  }, [catalogData, queryClient]);

  return null; // Renders absolutely nothing to the UI
}

function RootLayoutNav() {

  const router = useRouter();
  const url = Linking.useLinkingURL();
  const { isConnected } = useNetInfo(); // Network check hook
  const insets = useSafeAreaInsets();
  
  // isConnected can be null during the first millisecond of mounting, so strictly check for false
  const isOffline = isConnected === false;

  // Cache checker, auto-clears on start-up on reaching 50MB
  useEffect(() => {
    const checkAndClearCache = async () => {
      const fiftyMB = 50 * 1024 * 1024; // 50MB in bytes
      const sizeInBytes = getCacheSizeBytes();

      if (sizeInBytes > fiftyMB) {
        console.log('Cache exceeded 50MB limit. Auto-clearing on startup...');
        await wipeAppCache(queryClient);
      }
    };

    checkAndClearCache();
  }, []);

  // Global Android navbar settings
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        // @ts-ignore: Deprecated in favor of the component API, but safe to use
        NavigationBar.setButtonStyleAsync('dark');
      } catch (e) {
        console.log('Nav bar config error:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (url) {
      handleDeepLink(url);
    }
  }, [url]);

  const handleDeepLink = (incomingUrl: string) => {
    try {
      // Prevent 'Invalid URL' crash if the http scheme is missing
      let safeUrl = incomingUrl;
      if (!safeUrl.startsWith('http') && !safeUrl.startsWith('epcbits')) {
        safeUrl = `https://${safeUrl}`;
      }

      const parsedUrl = new URL(safeUrl);
      const hostname = parsedUrl.hostname;
      const path = parsedUrl.pathname; // eg. '/editorial-9/'

      // map.epcbits.com deeplink
      if (hostname === 'map.epcbits.com') {
        
        // If clicked from inside the app (a back stack already exists), push map.tsx
        if (router.canGoBack()) {
          router.push('/map');
        } else {
          // If opened externally, replace the root with 'More' to guarantee the back button goes there
          router.replace('/(tabs)/more');
          
          // Slight delay ensures the layout mounts before pushing the map on top
          setTimeout(() => {
            router.push('/map');
          }, 150);
        }
        return;
      }

      // epcbits.com article deeplink
      if (hostname === 'epcbits.com' || hostname === 'www.epcbits.com') {
        
        // Ignore category URLs as of now
        if (path.startsWith('/category/')) {
          return;
        }

        // Extract the slug (removes empty strings from slashes)
        // eg., "/editorial-9/" -> "editorial-9"
        const segments = path.split('/').filter(Boolean);
        const slug = segments[0];

        if (slug) {
          // Replace root with 'Home' to guarantee the back button goes to the Index
          router.replace('/(tabs)');
          
          setTimeout(() => {
            // Pass the slug as the ID parameter
            router.push(`/article/${slug}`);
          }, 150);
        }
      }
    } catch (error) {
      console.log('Error parsing deep link:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DataPreloader />
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> */}{/*Animates an in-app modal, leaving uncommented throws console warning */}
        </Stack>
        {/* Offline banner */}
        {isOffline && (
          <View style={[styles.offlineBanner, { bottom: (insets.bottom || 20) + 90 }]}>
            <Text style={styles.offlineText}>No internet connection. Viewing offline.</Text>
          </View>
        )}
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#333333', // Dark contrast pill
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    zIndex: 999, // Sits above all screens and modals
    
    // Floating shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  offlineText: {
    fontFamily: 'LatoSemibold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});