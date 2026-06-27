import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import { decode } from 'html-entities';
import { Image } from 'expo-image';

import { fetchArticleById } from '@/services/api';
import Colors from '@/constants/Colors';

import BackIcon from '@/components/icons/BackIcon';
import BackButton from '@/components/BackButton';

const htmlStyles = {
  body: { color: Colors.text, fontSize: 16, fontFamily: 'Lato', lineHeight: 26 },
  p: { marginBottom: 16 },
  h1: { fontFamily: 'LatoSemibold', color: Colors.text, fontSize: 28, marginTop: 24, marginBottom: 16 },
  h2: { fontFamily: 'LatoSemibold', color: Colors.text, fontSize: 24, marginTop: 20, marginBottom: 12 },
  strong: { 
    fontFamily: 'LatoSemibold', 
    color: Colors.text, 
    fontSize: 20, // Slightly larger than body (16)
  },
  b: { 
    fontFamily: 'LatoSemibold', 
    color: Colors.text,
  },
  a: { color: Colors.url, textDecorationLine: 'underline' as const }, // TS requires as const here
};

const customSystemFonts = [
  'Lora', 
  'Lato', 
  'LatoSemibold', 
  'LatoBold',
];

const HEADER_MAX_HEIGHT = 450;

export default function ArticleScreen() {
  const { id } = useLocalSearchParams(); // Gets ID from URL
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Helps place header elements below notches
  const { width } = useWindowDimensions(); // Used to scale the HTML content
  
  // Initialise scroll tracker
  const scrollY = useRef(new Animated.Value(0)).current;

  // The height of the collapsed header (Safe Area + px for the title)
  const HEADER_MIN_HEIGHT = insets.top + 84; 
  const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const { data: article, isLoading } = useQuery({
    queryKey: ['epc_article', id],
    queryFn: () => fetchArticleById(id as string),
  });

  if (isLoading || !article) {
    return (
      <View style={styles.loadingContainer}>
        {/* Hides header immediately during loading phase */}
        <Stack.Screen options={{ headerShown: false }} />
        
        <ActivityIndicator size="large" color={Colors.tint} />
      </View>
    );
  }

  // Formatting data
  const thumbnailUrl = article._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const wpCategories = (article._embedded as any)?.['wp:term']?.[0];
  const categoryName = wpCategories && wpCategories.length > 0 ? wpCategories[0].name : 'TFP / Issue Four';
  const publishDate = new Date(article.date).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Fades in collapsed header right as the article image is about to vanish
  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 60, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

 return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Scrolling content */}
      <Animated.ScrollView 
        style={StyleSheet.absoluteFill}
        bounces={false} 
        showsVerticalScrollIndicator={false}
        // Wire scroll tracker to scroll view at 60 fps
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16} 
      >

      {/*</Animated.ScrollView><ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>*/}
        
        {/* Hero header */}
        <View style={styles.heroContainer}>
          {thumbnailUrl && (
            <Image 
              source={{ uri: thumbnailUrl }} 
              // top: -30 pushes it up out of the screen. Add 30 to height so it still hits the bottom
              style={[
                StyleSheet.absoluteFill, 
                { top: -30, height: HEADER_MAX_HEIGHT + 30 }
              ]} 
              contentFit="cover" 
            />
          )}
          
          {/* Scrim */}
          <LinearGradient
            colors={['transparent','transparent', 'rgba(0,0,0,0.8)']}
            style={[StyleSheet.absoluteFill, { top: -30, height: HEADER_MAX_HEIGHT + 30 }]}
          />

          {/* Header text */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.category}>{categoryName}</Text>
            <Text style={styles.title}>{decode(article.title.rendered)}</Text>
            <Text style={styles.date}>{publishDate}</Text>
          </View>
        </View>

        {/* Article content */}
        <View style={styles.contentContainer}>
          <RenderHtml
            contentWidth={width - 40} 
            source={{ html: article.content.rendered }}
            tagsStyles={htmlStyles}
            systemFonts={customSystemFonts} // Forces engine to use our fonts as react-native-render-html by default strips out any fontFamily that isn't universally recognized standard web font
          />
        </View>
      {/*</ScrollView>*/}
      </Animated.ScrollView>

      {/* Collapsed header */}
      <Animated.View 
        style={[
          styles.stickyHeader, 
          { height: HEADER_MIN_HEIGHT, opacity: collapsedHeaderOpacity }
        ]}
        pointerEvents="none" 
      >
        {/* Use article image and gradient for collapsed header background */}
        {thumbnailUrl && (
          <Image 
            source={{ uri: thumbnailUrl }} 
            style={[StyleSheet.absoluteFill, { top: -30, height: HEADER_MAX_HEIGHT + 30 }]} 
            contentFit="cover"
            blurRadius={10}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

        {/* Collapsed title */}
        <Text 
          style={[styles.collapsedTitle, { top: insets.top + 26 }]} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {decode(article.title.rendered)}
        </Text>
      </Animated.View>
      
      <BackButton onPress={() => router.back()} shadow={true}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  heroContainer: {
    width: '100%',
    height: HEADER_MAX_HEIGHT, 
    justifyContent: 'flex-end',
    zIndex: 0,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    overflow: 'hidden', // Crops duplicated article image
    zIndex: 10, // Place over scrolling text
  },
  collapsedTitle: {
    fontSize: 24,
    fontFamily: 'Lora',
    color: Colors.white,
    position: 'absolute',
    left: 90, // Clears the BackButton
    right: 32,
  },
  headerTextContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  category: {
    fontSize: 13,
    fontFamily: 'LatoSemibold',
    color: Colors.tint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Lora',
    color: Colors.white,
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: '#E0E0E0',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60, // Room to scroll past the bottom
  },
});