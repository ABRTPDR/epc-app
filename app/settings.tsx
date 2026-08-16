import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Directory, Paths } from 'expo-file-system';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import PressableRipple from '@/components/PressableRipple';

const ClearCachePress = () => {
  Toast.show({
    type: 'info',
    text1: 'Cache cleared successfully.',
    position: 'bottom',
    visibilityTime: 1500, // Disappears after 1.5ms
  });
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    calculateCacheSize();
  }, []);

  // Instant synchronous cache sizing (API)
  const calculateCacheSize = () => {
    const cacheDir = new Directory(Paths.cache);
    const bytes = cacheDir.size || 0;
    
    if (bytes === 0) {
      setCacheSize('0 B');
      return;
    }
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    setCacheSize(`${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`);
  };

  const handleClearCache = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    setCacheSize('Clearing...');

    // On hitting clear cache:
    try {
      // Clear React Query memory cache
      queryClient.clear();

      // Clear Expo Image memory and disk cache
      await Image.clearMemoryCache();
      await Image.clearDiskCache();

      // Synchronous directory wiping (API)
      const cacheDir = new Directory(Paths.cache);
      
      // Ensure directory actually exists before trying to list its contents
      if (cacheDir.exists) {
        // list() returns a unified array of both File and Directory objects
        const contents = cacheDir.list();
        
        for (const item of contents) {
          // The new API's delete() works on both files and folders
          item.delete(); 
        }
      }

      // Re-calculate cache
      calculateCacheSize();
      
      ClearCachePress();

    } catch (error) {
      console.log('Error clearing cache:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to clear cache',
        position: 'bottom'
      });
      calculateCacheSize(); // Fallback to current size on error
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Stack.Screen options={{ headerShown: false }} />

      <BackButton onPress={() => router.back()} color={Colors.grey} />
      
      <View style={[styles.header, { height: insets.top + 80, paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>

      <ScrollView style={{ flex: 1  }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.menuContainer}>
          
          <PressableRipple style={styles.menuCard}>
            <Text style={styles.menuText}>Notifications</Text>
          </PressableRipple>

          <PressableRipple style={styles.menuCard}>
            <Text style={styles.menuText}>Some setting</Text>
          </PressableRipple>

          <PressableRipple style={[styles.menuCard, {height: 74}]}  onPress={handleClearCache}>
            <Text style={styles.menuText}>Clear app cache</Text>
            <Text style={styles.cacheSizeText}>{cacheSize}</Text>
          </PressableRipple>
        </View>
      </ScrollView>

      <View style={styles.bottomContent}>
        <Text style={styles.textBold}>EPC App, v{Constants.expoConfig?.version ?? 'Unknown'}</Text>
        <Text style={styles.text}>Developed with ❤️ by Abhirup Tapadar</Text>
        <Text style={styles.textLicenses} onPress={() => router.push('/licenses')}>Open-source licenses</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Lora',
    color: Colors.text,
  },
  scrollContent: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuCard: {
    height: 64,
    backgroundColor: Colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'LatoSemibold',
    color: Colors.text,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    gap: 18,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: Colors.text,
    textAlign: 'center',
  },
  textBold: {
    fontSize: 14,
    fontFamily: 'LatoSemibold',
    color: Colors.text,
    textAlign: 'center',
  },
  textLicenses: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: Colors.url,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  cacheSizeText: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: Colors.grey,
  },
});