import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const MAP_URL = 'https://map.epcbits.com/';

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ headerShown: false }} />

      <BackButton onPress={() => router.back()} color={Colors.grey} />
      
      {/* Header */}
      <View style={[styles.header, { height: insets.top + 80, paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Campus Map</Text>
      </View>

      {/* 3D webview engine */}
      <View style={styles.mapContainer}>
        <WebView 
          source={{ uri: MAP_URL }}
          style={styles.webview}
          
          // Anti caching protocols
          cacheEnabled={false} // Global: disables disk caching
          cacheMode="LOAD_NO_CACHE" // Android: forces network fetch only
          incognito={true} // iOS: forces an ephemeral session, no cache/cookies saved
          
          // 3D performance protocols
          javaScriptEnabled={true} // Mandatory for WebGL/Three.js to run
          androidLayerType="hardware" // Android: forces the GPU to render the 3D models
          bounces={false} // iOS: stops the map from rubber-banding when swiping
          overScrollMode="never" // Android: stops the overscroll glow
          
          // Loading screen elements
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.tint} />
              <Text style={styles.loadingText}>Rendering 3D Map...</Text>
            </View>
          )}
        />
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
    zIndex: 10, // Keeps header above the map
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Lora',
    color: Colors.text,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#000000', // Black background while 3D engine initializes
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Lato',
    color: Colors.text,
    fontSize: 14,
  },
});