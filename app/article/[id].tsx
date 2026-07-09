import { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, Animated, Share, BackHandler, Linking, PanResponder } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import RenderHtml from 'react-native-render-html';
import { decode } from 'html-entities';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { HTMLElementModel, HTMLContentModel } from 'react-native-render-html';

import { fetchArticleById, fetchArticleBySlug } from '@/services/api';
import Colors from '@/constants/Colors';

import BackButton from '@/components/BackButton';
import CalendarIcon from '@/components/icons/CalendarIcon';
import ShareIcon from '@/components/icons/ShareIcon';
import PressableRipple from '@/components/PressableRipple';
import { 
  TFP_CATALOG, 
  AEP_CATALOG, 
  BEP_CATALOG, 
  OEP_CATALOG 
} from '@/constants/Publications';
import PrevIcon from '@/components/icons/PrevIcon';
import NextIcon from '@/components/icons/NextIcon';

const htmlStyles = {
  body: { color: Colors.text, fontSize: 16, fontFamily: 'Lato', lineHeight: 26 },
  p: { marginBottom: 16 },
  h1: { fontFamily: 'LatoSemibold', color: Colors.text, fontSize: 28, marginTop: 24, marginBottom: 16 },
  h2: { fontFamily: 'LatoSemibold', color: Colors.text, fontSize: 24, marginTop: 20, marginBottom: 12 },
  h3: { fontFamily: 'LatoSemibold', color: Colors.text, fontSize: 20, marginTop: 16, marginBottom: 8 },
  h4: { fontFamily: 'LatoSemibold', color: Colors.text, fontSize: 18, marginTop: 16, marginBottom: 6 },
  b: { fontFamily: 'LatoSemibold', color: Colors.text },
  i: { fontFamily: 'LatoItalic', color: Colors.text},
  em: { fontFamily: 'LatoItalic', color: Colors.text }, // For emphasised content, italicise
  a: { color: Colors.url, textDecorationLine: 'underline' as const }, // TS requires as const here
  strong: { fontFamily: 'LatoSemibold', color: Colors.text }, // For <strong>s that are not handled in domVisitors
};

const classesStyles = {
  'header-bold': { fontFamily: 'LatoBold' },
  'p-bold': { fontFamily: 'LatoSemibold' },
  'em-bold': { fontFamily: 'LatoBoldItalic' },
  // Remove bullets and indents from WP Galleries
  'blocks-gallery-grid': { paddingLeft: 0, listStyleType: 'none' },
  'blocks-gallery-item': { listStyleType: 'none', marginBottom: 16 },
  'wp-block-gallery': { paddingLeft: 0, listStyleType: 'none' },
};

const domVisitors = {
  onElement: (element: any) => {
    // When the parser hits a bold tag
    if (element.name === 'strong' || element.name === 'b') {
      let current = element.parent;
      let inHeader = false;
      let inEm = false;
      
      // Traverse up HTML tree to see where bold tag lives
      while (current) {
        if (/^h[1-6]$/.test(current.name)) inHeader = true;
        if (current.name === 'em' || current.name === 'i') inEm = true;
        current = current.parent;
      }

      // Inject appropriate class based on its parent
      if (inHeader) {
        element.attribs.class = element.attribs.class ? `${element.attribs.class} header-bold` : 'header-bold';
      } else if (inEm) {
        element.attribs.class = element.attribs.class ? `${element.attribs.class} em-bold` : 'em-bold';
      } else {
        element.attribs.class = element.attribs.class ? `${element.attribs.class} p-bold` : 'p-bold';
      }
    }
  }
};

const customSystemFonts = [
  'Lora', 
  'LoraItalic',
  'Lato', 
  'LatoSemibold', 
  'LatoBold',
  'LatoItalic',
  'LatoBoldItalic',
];

const HEADER_MAX_HEIGHT = 420; // Reduce here for image height crop

const OverlayPressable = ({ onPress, style, children, ...props }: any) => (
  <View style={[style, { overflow: 'hidden' }]} {...props}>
    {/* Visible layout (HTML image) */}
    {children}
    
    {/* Invisible touch layer on top */}
    <PressableRipple onPress={onPress} style={StyleSheet.absoluteFill}>
      <View /> 
    </PressableRipple>
  </View>
);

// Tell HTML parser to accept iframes, object tags and AMP text tags as valid block elements
const customHTMLElementModels = {
  iframe: HTMLElementModel.fromCustomModel({
    tagName: 'iframe',
    mixedUAStyles: { width: '100%', height: 500 },
    contentModel: HTMLContentModel.block,
  }),
  object: HTMLElementModel.fromCustomModel({
    tagName: 'object',
    mixedUAStyles: { width: '100%', height: 500 },
    contentModel: HTMLContentModel.block,
  }),
  'amp-fit-text': HTMLElementModel.fromCustomModel({
    tagName: 'amp-fit-text',
    contentModel: HTMLContentModel.block,
  }),
};

// Define how the iframe or object should be drawn using a WebView
const renderers = {
  iframe: ({ tnode }: any) => {
    const src = tnode.attributes.src;
    if (!src) return null;

    return (
      <View style={{ width: '100%', height: 590, marginVertical: 12, borderRadius: 12, overflow: 'hidden' }}>
        <WebView
          source={{ uri: src }}
          style={{ flex: 1 }}
          nestedScrollEnabled={true} 
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  },
  
  // Renderer for <object> tags
  object: ({ tnode }: any) => {
    const dataSrc = tnode.attributes.data;
    if (!dataSrc) return null;

    // Native Android WebViews will forcefully download .pdf links
    // Wrap it in Google PDF viewer to force it to render inline like the iframe
    let finalUrl = dataSrc;
    if (dataSrc.toLowerCase().endsWith('.pdf')) {
      finalUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(dataSrc)}`;
    }

    return (
      <View style={{ width: '100%', height: 590, marginVertical: 12, borderRadius: 12, overflow: 'hidden' }}>
        <WebView
          source={{ uri: finalUrl }}
          style={{ flex: 1 }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
};

// Helper function to map WP category IDs back to Press/Year/Issue structure
function findArticleClassification(categoryIds: number[], articleId: number) {
  const catalogs = [
    { press: 'TFP', data: TFP_CATALOG },
    { press: 'AEP', data: AEP_CATALOG },
    { press: 'BEP', data: BEP_CATALOG },
    { press: 'OEP', data: OEP_CATALOG },
  ];

  for (const { press, data } of catalogs) {
    for (const [year, yearCatalog] of Object.entries(data)) {
      for (const issue of yearCatalog.issues) {
        if ('children' in issue) {
          for (const child of issue.children) {
            // 1. Priority check: explicitly included here?
            if (child.includedArticles?.includes(articleId)) {
              return { press, year, issueName: issue.name };
            }
            // 2. Fallback check: matches category AND not excluded?
            if (categoryIds.includes(child.categoryId) && !child.excludedArticles?.includes(articleId)) {
              return { press, year, issueName: issue.name };
            }
          }
        } else {
          // 1. Priority check: explicitly included here?
          if (issue.includedArticles?.includes(articleId)) {
            return { press, year, issueName: issue.name };
          }
          // 2. Fallback check: matches category AND not excluded?
          if (categoryIds.includes(issue.categoryId) && !issue.excludedArticles?.includes(articleId)) {
            return { press, year, issueName: issue.name };
          }
        }
      }
    }
  }
  return null;
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams(); // Get ID from URL
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Help place header elements below notches
  const { width } = useWindowDimensions(); // Used to scale HTML content
  
  // Initialise scroll tracker
  const scrollY = useRef(new Animated.Value(0)).current;

  // Height of the collapsed header (aafe area + px for title)
  const HEADER_MIN_HEIGHT = insets.top + 84; 
  const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // BackButton shadow logic
  const [showShadow, setShowShadow] = useState(true);
  const showShadowRef = useRef(true); // Track state silently to prevent effect re-binding

  // Image viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Handle OS back gesture while on image gallery screen
  useEffect(() => {
    const onBackPress = () => {
      if (viewerVisible) {
        setViewerVisible(false);
        return true; // Tells Android back handled, don't exit the screen
      }
      return false; // Tells Android back not handled, exit the screen
    };

    // Save subscription returned by addEventListener
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
    // Call .remove() directly on the subscription to clean
    return () => backHandler.remove();
  }, [viewerVisible]);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      // SCROLL_DISTANCE - 30 is halfway point of header's fade-in animation
      const isHeaderExpanded = value < (SCROLL_DISTANCE - 30); 
      
      // Only trigger React state update if boolean actually needs to flip
      if (isHeaderExpanded !== showShadowRef.current) {
        showShadowRef.current = isHeaderExpanded;
        setShowShadow(isHeaderExpanded);
      }
    });
    
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [SCROLL_DISTANCE, scrollY]);

  const { data: article, isLoading } = useQuery({
    queryKey: ['epc_article', id],
    queryFn: () => {
      const idString = id as string;
      // If parameter is purely numbers, fetch by ID
      // Otherwise, it's a slug
      if (/^\d+$/.test(idString)) {
        return fetchArticleById(idString);
      } else {
        return fetchArticleBySlug(idString);
      }
    },
  });

  // Extract images, ignoring images that are already inside <a> tags (like article thumbnails)
  const articleImages = useMemo(() => {
    if (!article) return [];
    const urls: string[] = [];
    const regex = /(<a\b[^>]*>[\s\S]*?<\/a>)|(<img\b[^>]*?src=["']([^"']+?)["'][^>]*?>)/gi;
    let match;
    while ((match = regex.exec(article.content.rendered)) !== null) {
      const aTag = match[1];
      const imgUrl = match[3];
      // Only push the URL if it's not inside an anchor tag
      if (!aTag && imgUrl) {
        urls.push(decode(imgUrl)); 
      }
    }
    return urls;
  }, [article]);


  // Intercept HTML string to wrap standalone images in custom viewer link
  const processedHtml = useMemo(() => {
    if (!article) return '';
    
    let imgCounter = 0; // Start at 0, track standalone images in sync with articleImages array
    
    return article.content.rendered.replace(
      /(<a\b[^>]*>[\s\S]*?<\/a>)|(<img\b([^>]*?)src=["']([^"']+?)["']([^>]*?)>)/gi,
      (match, aTag, imgTag, p1, p2, p3) => {
        if (aTag) return aTag; // Leave existing image links (like related article thumbnails) untouched
        
        // Get current index and increment counter
        const currentIndex = imgCounter++;
        
        // Inject exact array index directly into URL schema (eg. imgview://gallery/2)
        return `<a href="imgview://gallery/${currentIndex}"><img${p1}src="${p2}"${p3}></a>`;
      }
    );
  }, [article]);

  const renderersProps = useMemo(() => ({
    a: {
      onPress: (event: any, href: string) => {
        // If custom gallery link
        if (href.includes('imgview://gallery/')) {
          
          // Extract integer index injected at the end of URL
          const indexStr = href.split('/').pop();
          const idx = parseInt(indexStr || '0', 10);
          
          // Set index, making exact tapped image open
          setCurrentImgIndex(!isNaN(idx) && idx >= 0 && idx < articleImages.length ? idx : 0);
          setViewerVisible(true);
          
        } else {
          Linking.openURL(href).catch(err => console.log('Error opening link:', err));
        }
      }
    }
  }), [articleImages]);

  // Swipe gesture handler for image gallery
  const galleryPanResponder = useMemo(() => PanResponder.create({
    // Only claim touch if user is swiping horizontally (prevents blocking taps)
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Swiped right (distance > 40px)
      // Go to previous image
      if (gestureState.dx > 40) {
        setCurrentImgIndex(prev => Math.max(0, prev - 1));
      } 
      // Swiped left (distance < -40px)
      // Go to next image
      else if (gestureState.dx < -40) {
        setCurrentImgIndex(prev => Math.min(articleImages.length - 1, prev + 1));
      }
    }
  }), [articleImages.length]);

  if (isLoading || !article) {
    return (
      <View style={styles.loadingContainer}>
        {/* Hide header during loading phase */}
        <Stack.Screen options={{ headerShown: false }} />
        
        <ActivityIndicator size="large" color={Colors.tint} />
      </View>
    );
  }

  // Formatting data
  const thumbnailUrl = article._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  // Conditionally use URL image or local fallback
  const headerImageSource = thumbnailUrl 
      ? { uri: thumbnailUrl } 
      : require('@/assets/images/Fallback.png');
  // Format Date (eg. "August 28, 2029")
  const publishDate = new Date(article.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Find classification
  const categoryIds = article.categories || [];
  const classification = findArticleClassification(categoryIds, article.id);
  
  // Strip special fest names from year string for the pill (eg. "2026 - The Skeumorph" -> "2026")
  const cleanYear = classification?.year.split(' –')[0] || '';
  const classificationText = classification 
    ? `${classification.press} ${cleanYear} / ${classification.issueName}` 
    : 'Article';

  // Dynamically determine pill color
  // Defaults to Colors.tint (purple) if  TFP or if classification fails, else Colors.yellow
  const pillColor = (!classification || classification.press === 'TFP') 
    ? Colors.tint 
    : Colors.yellow;

  // Fade in collapsed header right as article image is about to vanish upward
  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE - 60, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Share functionality via native share sheet
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${decode(article.title.rendered)}\n${article.link}`,
        url: article.link,
        title: decode(article.title.rendered),
      });
    } catch (error) {
      console.log('Error sharing article:', error);
    }
  };

  // Route to specific press page with correct issue pre-selected
  const handleCategoryPress = () => {
    if (!classification) return;
    
    if (classification.press === 'TFP') {
      router.push({
        pathname: '/tfp/[year]',
        params: { year: classification.year, issue: classification.issueName }
      });
    } else {
      router.push({
        pathname: '/festPresses/[year]',
        params: { press: classification.press, year: classification.year, issue: classification.issueName }
      });
    }
  };

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
        
        {/* Hero header */}
        <View style={styles.heroContainer}>
          <Image 
            source={headerImageSource} 
            style={[
              StyleSheet.absoluteFill, 
              { top: -30, height: HEADER_MAX_HEIGHT + 30 }
            ]} 
            contentFit="cover" 
          />
          
          {/* Scrim */}
          <LinearGradient
            colors={['transparent','transparent', 'rgba(0,0,0,1)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Header text */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{decode(article.title.rendered)}</Text>
          </View>
        </View>

        {/* Article content area */}
        <View style={styles.contentContainer}>

          {/* Metadata row */}
          <View style={styles.metadataRow}>
            {/* Category pill */}
            <View style={[styles.categoryPillMask, {backgroundColor: pillColor}]}>
              <PressableRipple style={styles.categoryPill} onPress={handleCategoryPress}>
                <Text style={styles.categoryPillText} numberOfLines={1}>{classificationText}</Text>
              </PressableRipple>
            </View>
            {/* Date pill */}
            <View style={styles.datePillMask}>
              <PressableRipple style={styles.datePill}>
                <CalendarIcon />
                <Text style={styles.datePillText}>{publishDate}</Text>
              </PressableRipple>
            </View>
            {/* Share button */}
            <View style={styles.shareButtonMask}>
              <PressableRipple style={styles.shareButton} onPress={handleShare}>
                <ShareIcon />
              </PressableRipple>
            </View>
          </View>

          <RenderHtml
            contentWidth={width - 40} 
            source={{ html: processedHtml }}
            tagsStyles={htmlStyles}
            classesStyles={classesStyles}
            domVisitors={domVisitors}
            renderersProps={renderersProps}
            GenericPressable={OverlayPressable} // Custom ripple on article images
            renderers={renderers} 
            customHTMLElementModels={customHTMLElementModels}
            systemFonts={customSystemFonts} 
          />
        </View>
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

      {/* Full screen image gallery overlay */}
      {viewerVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: Colors.background }]}>
          
          {/* Replica header */}
          <View style={[styles.stickyHeader, { height: HEADER_MIN_HEIGHT, opacity: 1, zIndex: 101 }]}>
            {thumbnailUrl && (
              <Image 
                source={{ uri: thumbnailUrl }} 
                style={[StyleSheet.absoluteFill, { top: -30, height: HEADER_MAX_HEIGHT + 30 }]} 
                contentFit="cover"
                blurRadius={10}
              />
            )}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
            <Text 
              style={[styles.collapsedTitle, { top: insets.top + 26 }]} 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {decode(article.title.rendered)}
            </Text>
          </View>

          {/* Image container */}
          <View
            style={{ flex: 1, paddingTop: HEADER_MIN_HEIGHT, paddingBottom: 100 }}
            {...galleryPanResponder.panHandlers}
          >
             <Image 
               source={{ uri: articleImages[currentImgIndex] }} 
               style={{ flex: 1, width: '100%' }} 
               contentFit="contain" 
             />
          </View>

          {/* Image navigator at bottom */}
          <View style={[styles.imageNavigator, { paddingBottom: insets.bottom + 20 }]}>
            {articleImages.length > 1 ? (
              <>
                <PressableRipple 
                  onPress={() => setCurrentImgIndex(i => Math.max(0, i - 1))}
                  disabled={currentImgIndex === 0}
                  style={[styles.navButton, currentImgIndex === 0 && { opacity: 0.3 }]}
                >
                  <PrevIcon />
                </PressableRipple>
                
                <Text style={styles.navText}>{currentImgIndex + 1} / {articleImages.length}</Text>
                
                <PressableRipple 
                  onPress={() => setCurrentImgIndex(i => Math.min(articleImages.length - 1, i + 1))}
                  disabled={currentImgIndex === articleImages.length - 1}
                  style={[styles.navButton, currentImgIndex === articleImages.length - 1 && { opacity: 0.3 }]}
                >
                  <NextIcon />
                </PressableRipple>
              </>
            ) : (
              <Text style={styles.navText}>1 / 1</Text>
            )}
          </View>

        </View>
      )}
      
      <View style={[StyleSheet.absoluteFill, { zIndex: 102, elevation: 102 }]} pointerEvents="box-none">
        <BackButton 
          onPress={() => {
            if (viewerVisible) {
              setViewerVisible(false);
            } else {
              router.back();
            }
          }} 
          shadow={viewerVisible ? false : showShadow}
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
    overflow: 'hidden', // Crop duplicated article image
    zIndex: 10, // Place over scrolling text
    backgroundColor: Colors.darkwhite,
  },
  collapsedTitle: {
    fontSize: 24,
    fontFamily: 'Lora',
    color: Colors.white,
    position: 'absolute',
    left: 80, // Clear the BackButton
    right: 24,
  },
  headerTextContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Lora',
    color: Colors.white,
    marginBottom: 12,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60, // Room to scroll past bottom
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  categoryPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryPillText: {
    fontFamily: 'LatoSemibold',
    fontSize: 13,
    color: Colors.text,
  },
  categoryPillMask: {
    borderRadius: 16,
    overflow: 'hidden',
    flexShrink: 1, // Allow pill to shrink and ellipsize to maintain one-line metadata row
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  datePillText: {
    fontFamily: 'LatoSemibold',
    fontSize: 13,
    color: Colors.grey,
  },
  datePillMask: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#DBDBDB',
  },
  shareButton: {
    flex: 1, // Fill 32x32 mask below
    alignItems: 'center',
    padding: 6,
  },
  shareButtonMask: {
    borderRadius: 16,
    overflow: 'hidden',
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#DBDBDB',
  },
  imageNavigator: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 20,
    backgroundColor: Colors.background,
  },
  navButton: {
    width: 44, 
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.darkwhite,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontFamily: 'LatoSemibold',
    fontSize: 16,
    color: Colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
});