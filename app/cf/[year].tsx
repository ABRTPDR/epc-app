import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import ShareIcon from '@/components/icons/ShareIcon';
import PressableRipple from '@/components/PressableRipple';

// Import the covers dictionary from index file
import { CF_COVERS } from './index';

export default function CFViewerScreen() {
  const { year, url } = useLocalSearchParams<{ year: string; url: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);

  // Exact header height match from [id].tsx
  const HEADER_MIN_HEIGHT = insets.top + 84;

  if (!url) return null;

  // URL conversion logic
  let finalUrl = url;
  
  const driveIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  
  if (driveIdMatch && driveIdMatch[1]) {
    const fileId = driveIdMatch[1];
    finalUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  } else if (url.toLowerCase().endsWith('.pdf')) {
    finalUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  }

  // Header image selection: use the cover, default to the generic background if missing
  const headerImageSource = CF_COVERS[year] || require('@/assets/images/CFBackground.png');

  // Share button
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Read Cactus Flower ${year} from the EPC.\n${url}`,
        url: url, 
        title: `Cactus Flower ${year}`,
      });
    } catch (error) {
      console.log('Error sharing PDF:', error);
    }
  };

  // Force the webpage to allow pinch-to-zoom
  const enableZoomScript = `
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes');
    meta.setAttribute('name', 'viewport');
    document.head.appendChild(meta);
    true;
  `;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Collapsed header */}
      <View style={[styles.stickyHeader, { height: HEADER_MIN_HEIGHT }]}>
        
        {/* Blurred background cover image */}
        <Image 
          source={headerImageSource} 
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={10}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

        <View style={[StyleSheet.absoluteFill, { zIndex: 102 }]} pointerEvents="box-none">
          <BackButton onPress={() => router.back()} shadow={false} />
        </View>

        <Text 
          style={[styles.collapsedTitle, { top: insets.top + 26 }]} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Cactus Flower {year}
        </Text>
      </View>

      {/* PDF viewer */}
      <View style={[styles.contentContainer, { paddingTop: HEADER_MIN_HEIGHT + 20 }]}>
        
        <View style={styles.metadataRow}>
          <PressableRipple style={styles.categoryPill} onPress={() => router.push('/cf')}>
            <Text style={styles.categoryPillText} numberOfLines={1}>CF / {year}</Text>
          </PressableRipple>
          <PressableRipple style={styles.shareButton} onPress={handleShare}>
            <ShareIcon />
          </PressableRipple>
        </View>

        <View style={styles.webviewContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.tint} />
            </View>
          )}
          
          <View style={{ width: '100%', height: 630, marginVertical: 4, borderRadius: 12, overflow: 'hidden' }}>
            <WebView
              source={{ uri: finalUrl }}
              style={{ flex: 1 }}
              onLoadEnd={() => setIsLoading(false)}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              javaScriptEnabled={true} 
              domStorageEnabled={true}
              // Zoom props
              scalesPageToFit={true} // Essential for iOS
              setBuiltInZoomControls={true} // Essential for Android pinch-to-zoom
              setDisplayZoomControls={false} // Hides the clunky +/- magnifying glass buttons on Android
              injectedJavaScript={enableZoomScript} // Overrides anti-zoom HTML tags
            />
          </View>
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    overflow: 'hidden',
    zIndex: 10,
    backgroundColor: Colors.darkwhite,
  },
  collapsedTitle: {
    fontSize: 24,
    fontFamily: 'Lora',
    color: Colors.white,
    position: 'absolute',
    left: 80, 
    right: 24,
  },
  webviewContainer: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 60, 
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.blue,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryPillText: {
    fontFamily: 'LatoSemibold',
    fontSize: 13,
    color: Colors.text,
  },
  shareButton: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: Colors.lightGrey,
  },
});