import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // React query tools
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';

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

function RootLayoutNav() {

  const router = useRouter();
  const url = Linking.useLinkingURL();

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
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> */}{/*Animates an in-app modal, leaving uncommented throws console warning */}
        </Stack>
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}