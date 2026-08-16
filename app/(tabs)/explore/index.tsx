import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { decode } from 'html-entities';

import Colors from '@/constants/Colors';
import PressableRipple from '@/components/PressableRipple';
import StylisedSearch from '@/components/icons/StylisedSearch';
import EPCGraphic from '@/components/icons/EPCGraphic';
import APOGEEGraphic from '@/components/icons/APOGEEGraphic';
import BOSMGraphic from '@/components/icons/BOSMGraphic';
import OasisGraphic from '@/components/icons/OasisGraphic';
import CFGraphic from '@/components/icons/CFGraphic';
import { TFP_CATALOG, TFP_YEARS_ORDER, AEP_YEARS_ORDER, BEP_YEARS_ORDER, OEP_YEARS_ORDER } from '@/constants/Publications';
import ExpanderIcon from '@/components/icons/ExpanderIcon';

const BulletPoint = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.cardBodyText, { paddingTop: 1 }]}>{children}</Text>
    </View>
  );
}; 

const BulletList = ({ items }: { items: string[] }) => {
  return (
    <View>
      {items.map((item, index) => (
        <BulletPoint key={index}>{item}</BulletPoint>
      ))}
    </View>
  );
};

// Force the Jetpack CDN to resize images on the edge server
const optimiseJetpackUrl = (url: string | undefined, size: number) => {
  if (!url) return null;
  
  // If it goes through the WP global CDN (i0.wp.com, i1.wp.com, etc.)
  if (url.includes('.wp.com')) {
    const baseUrl = url.split('?')[0]; // Strip the unnecessarily large ?fit params
    // Use URL-encoded commas "%2C"
    return `${baseUrl}?resize=${size}%2C${size}&ssl=1`;
  }
  
  return url;
};

// Two featured articles on TFP card to be randomly picked from most recent 2 editions of TFP, excluding Editorials, Issue Twos (Elections), Special Issues
export const fetchTFPRecentArticles = async () => {
  const validCategoryIds: number[] = [];

  // 1. Grab the two most recent years from the array
  const targetYears = [TFP_YEARS_ORDER[0], TFP_YEARS_ORDER[1]];

  // Loop through both years and extract all valid category IDs
  targetYears.forEach((yearKey) => {
    const catalogData = TFP_CATALOG[yearKey];
    if (!catalogData) return;

    catalogData.issues.forEach((issue) => {
      if ('categoryId' in issue) {
        // Skip special issues
        if (catalogData.hasSpecialIssue && catalogData.specialIssueName && issue.name.includes(catalogData.specialIssueName)) {
          return;
        }
        // Exclude Issue Two (Elections)
        if (issue.name.includes('Issue Two')) {
          return;
        }
        validCategoryIds.push(issue.categoryId);
      }
    });
  });

  // Build URL and log to terminal
  const url = `https://epcbits.com/wp-json/wp/v2/posts?categories=${validCategoryIds.join(',')}&per_page=15&_embed=1`;
  console.log(`📡 [API REQ] GET ${url}`);

  const res = await fetch(url);

  if (res.ok) {
    const parsedUrl = new URL(url);
    console.log(`✅ [API RES] ${res.status} from /posts${parsedUrl.search}`);
  }

  const posts = await res.json();

  // Articles whose IDs listed here bypass the allowed Editorials check / are forcefully ignored
  const includedArticles: number[] = []; // []
  const excludedArticles: number[] = [ 10698 ]; // [ We Didn’t Start the Fire (TFP 2026 Issue Zero Editorial) ]
  
  // Filter out Editorials, apply manual overrides, randomize, and slice
  const filtered = posts.filter((post: any) => {
    if (excludedArticles.includes(post.id)) {
      return false;
    }
    if (includedArticles.includes(post.id)) {
      return true;
    }
    return !post.title.rendered.toLowerCase().includes('editorial');
  });
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

function TFPRecentArticles() {
  const router = useRouter();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['tfp_recent_random'],
    queryFn: fetchTFPRecentArticles, // Point to the extracted function
    staleTime: 1000 * 60 * 15, // Cache stays fresh for 15 minutes to respect the preload
  });

  if (isLoading || !articles) {
    return (
      <View style={{ gap: 14, marginTop: 12 }}>
        <ActivityIndicator size="small" color={'#FEF1FF'} style={{ alignSelf: 'flex-start', marginLeft: 10 }} />
      </View>
    );
  }

  return (
    <View style={{ gap: 8, marginTop: -2 }}>
      {articles.map((article: any) => {
        
        // Intercept Jetpack URL and shrink to 100x100 for the 40x40 thumbnail
        const thumbnailUrl = optimiseJetpackUrl(article.jetpack_featured_media_url, 100)
          || article._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.thumbnail?.source_url
          || article._embedded?.['wp:featuredmedia']?.[0]?.source_url;

        return (
          <PressableRipple 
            key={article.id} 
            style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 12, marginRight: 176 }}
            onPress={() => router.push(`/article/${article.id}`)} 
          >
            <Image 
              source={thumbnailUrl ? { uri: thumbnailUrl } : require('@/assets/images/Fallback.png')}
              style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF1FF' }} 
              contentFit="cover"
              transition={200}
            />
            <Text 
              style={[styles.cardBodyText, { fontFamily: 'LatoBold', fontSize: 14, flex: 1, paddingRight: 4 }]} 
              numberOfLines={2}
              ellipsizeMode='tail'
            >
              {decode(article.title.rendered)}
            </Text>
          </PressableRipple>
        );
      })}
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Total screen width minus 20px side margins
  const cardWidth = width - 40; 
  // Track active carousel dot
  const [activeFestPress, setActiveFestPress] = useState(0);
  // Refs to control auto-swipe and track the true index
  const scrollViewRef = useRef<ScrollView>(null);
  const activeFestPressRef = useRef(0);
  // Track actual timer so we can kill it when handing over swipe control to manual swipe
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Animated Value to mathematically calculate the scroll speed
  const animatedScrollX = useRef(new Animated.Value(0)).current;
  // Ref to track physical scroll position (for easing animation)
  const exactScrollXRef = useRef(0);

  // Bind the Animated Value to move the ScrollView
  useEffect(() => {
    // Every time a new micro-pixel calculated, move the ScrollView to it
    const listenerId = animatedScrollX.addListener(({ value }) => {
      scrollViewRef.current?.scrollTo({ x: value, animated: false }); // animated: false to disable OS scroll animation over which we have no speed control
    });
    return () => animatedScrollX.removeListener(listenerId);
  }, []);

  // Secret ref synced with the manual card swipes
  const onFestPressScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Log the physical sub-pixel
    const xOffset = event.nativeEvent.contentOffset.x;
    exactScrollXRef.current = xOffset;
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = xOffset / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeFestPress) {
      setActiveFestPress(roundIndex);
      activeFestPressRef.current = roundIndex; 
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll(); 
    
    autoScrollTimer.current = setInterval(() => {
      // Starts from the exact physical pixel to prevent jitter in animation
      animatedScrollX.setValue(exactScrollXRef.current);
      // Calculate the destination
      const nextIndex = activeFestPressRef.current === 2 ? 0 : activeFestPressRef.current + 1;
      
      Animated.timing(animatedScrollX, {
        toValue: nextIndex * cardWidth,
        duration: 480, // Auto-scroll swipe animation duration
        easing: Easing.inOut(Easing.sin), // Seems to be the smoothest curve profile
        useNativeDriver: false, 
      }).start();

      // Manually update the dot indicator to prevent the onScroll event from forcing a heavy component re-render mid-animation
      setActiveFestPress(nextIndex);
      activeFestPressRef.current = nextIndex;
      
    }, 4000); // Auto-scroll every 4000ms
  };

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  // Start the timer when the screen first loads, and clean it up if user's finger leaves fest card
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [cardWidth]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

        <PressableRipple style={styles.searchBar} onPress={() => router.push('/search')}>
          <StylisedSearch width={53} height={55} style={styles.stylisedSearch} />
          <Text style={styles.searchInactiveText}>Search for an article...</Text>
        </PressableRipple>

      <ScrollView style={{ flex: 1  }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <PressableRipple style={styles.tfpCard} onPress={() => router.push('/tfp')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>THE FINE PRINT</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: Colors.lightTint }]}>
                <Text style={styles.chipText}>TFP</Text>
              </View>
              <ExpanderIcon size={12} color={Colors.grey} style={{marginRight: 4}} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardBodyText, { paddingTop: 12 }]}>The campus newsletter. New{'\n'}issues every other month.</Text>
            <View style={styles.watermarkContainerEPC}>
              <EPCGraphic width={200} />
            </View>
          </View>
          <View style={[styles.cardBody, { paddingTop: 0, zIndex: 2 }]}>
            <TFPRecentArticles />
          </View>
        </PressableRipple>

        <View style={styles.festPressCard}>
          
          {/* Stationary header (routes to /festPresses/index.tsx) */}
          <PressableRipple onPress={() => router.push('/festPresses')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>FEST PRESSES</Text>
              <View style={styles.chipRow}>
                <View style={[styles.chip, { backgroundColor: Colors.lightYellow }]}>
                  <Text style={styles.chipText}>AEP</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: Colors.lightYellow }]}>
                  <Text style={styles.chipText}>BEP</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: Colors.lightYellow }]}>
                  <Text style={styles.chipText}>OEP</Text>
                </View>
                <ExpanderIcon size={12} color={Colors.grey} style={{marginRight: 4}} />
              </View>
            </View>
          </PressableRipple>
          
          <View style={styles.divider} />
          
          {/* Swipable carousel body (routes to particular fest press) */}
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onFestPressScroll}
              scrollEventThrottle={16}
              onScrollBeginDrag={stopAutoScroll} // Kills the timer when manual swipe occurs
              onScrollEndDrag={startAutoScroll}  // Starts fresh timer when finger lifts
            >
              {/* APOGEE Card */}
              <PressableRipple 
                style={{ width: cardWidth, flex: 1 }} 
                onPress={() => router.push({ pathname: '/festPresses/[year]', params: { press: 'AEP', year: AEP_YEARS_ORDER[0] } })}
              >
                <View style={styles.cardBody}>
                  <Text style={[styles.cardSubheaderText, { paddingTop: 8 }]}>APOGEE ENGLISH PRESS</Text>
                  <BulletList 
                    items={[
                      'Pre-fest interviews — club coords\nand the CoStAA.', 
                      'Digital archives of fest issues.'
                    ]} 
                  />
                  <View style={styles.watermarkContainerAPOGEE}>
                    <APOGEEGraphic width={138} height={138} />
                  </View>
                </View>
              </PressableRipple>

              {/* BOSM Card */}
              <PressableRipple 
                style={{ width: cardWidth, flex: 1 }} 
                onPress={() => router.push({ pathname: '/festPresses/[year]', params: { press: 'BEP', year: BEP_YEARS_ORDER[0] } })}
              >
                <View style={styles.cardBody}>
                  <Text style={[styles.cardSubheaderText, { paddingTop: 8 }]}>BOSM ENGLISH PRESS</Text>
                  <BulletList 
                    items={[
                      'Pre-fest interviews — team\ncaptains and the CoSSAc.', 
                      'Digital archives of fest issues.'
                    ]} 
                  />
                  <View style={styles.watermarkContainerBOSM}>
                    <BOSMGraphic width={142} height={142} />
                  </View>
                </View>
              </PressableRipple>

              {/* OASIS Card */}
              <PressableRipple 
                style={{ width: cardWidth, flex: 1 }} 
                onPress={() => router.push({ pathname: '/festPresses/[year]', params: { press: 'OEP', year: OEP_YEARS_ORDER[0] } })}
              >
                <View style={styles.cardBody}>
                  <Text style={[styles.cardSubheaderText, { paddingTop: 8 }]}>OASIS ENGLISH PRESS</Text>
                  <BulletList
                    items={[
                      'Pre-fest interviews — club coords\nand the StuCCA.', 
                      'Digital archives of fest issues.'
                    ]} 
                  />
                  <View style={styles.watermarkContainerOasis}>
                    <OasisGraphic width={138} height={138} />
                  </View>
                </View>
              </PressableRipple>
            </ScrollView>

            {/* Carousel dot indicator */}
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, activeFestPress === 0 && styles.activeDot]} />
              <View style={[styles.dot, activeFestPress === 1 && styles.activeDot]} />
              <View style={[styles.dot, activeFestPress === 2 && styles.activeDot]} />
            </View>
          </View>

        </View>

        <PressableRipple style={styles.cfCard} onPress={() => router.push('/cf')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>CACTUS FLOWER</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: Colors.lightBlue }]}>
                <Text style={styles.chipText}>CF</Text>
              </View>
              <ExpanderIcon size={12} color={Colors.grey} style={{marginRight: 4}} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardBodyText, { paddingTop: 12 }]}>Campus literary magazine; for writers, poets, and{'\n'}artists. Currently archived, CF returns soon.</Text>
            <Image
              source={require('@/assets/images/ArchiveGraphic.png')} 
              style={styles.archiveGraphic}
              contentFit="contain"
            />
            <View style={styles.watermarkContainerCF}>
              <CFGraphic width={130} height={130} />
            </View>
          </View>
        </PressableRipple>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    gap: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    height: 64,
    backgroundColor: Colors.lightGrey,
    borderRadius: 25,
    paddingHorizontal: 20,
    overflow: 'hidden',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  stylisedSearch: {
    bottom: -8,
    zIndex: 1,
  },
  searchInactiveText: {
    fontSize: 20,
    fontFamily: 'Lora',
    color: Colors.grey,
  },
  menuContainer: {
    gap: 16,
    marginBottom: 24,
  },
  tfpCard: {
    height: 222,
    backgroundColor: Colors.tint,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  festPressCard: {
    height: 176,
    backgroundColor: Colors.yellow,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  cfCard: {
    height: 212,
    backgroundColor: Colors.blue,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 12,
    paddingTop: 14,
    paddingBottom: 12,
    zIndex: 2,
  },
  cardBody: {
    paddingBottom: 12,
    paddingLeft: 20,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.background,
  },
  cardHeaderText: {
    fontSize: 20,
    fontFamily: 'Lora',
    color: Colors.text,
    zIndex: 2, // Keep text above the watermark
  },
  cardSubheaderText: {
    fontSize: 17.5,
    fontFamily: 'Lora',
    color: Colors.text,
    zIndex: 2,
  },
  cardBodyText: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: Colors.text,
    zIndex: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Keep bullet aligned to the top line of text
    marginBottom: -2, // Space between bullet points
  },
  bullet: {
    fontSize: 18,
    color: Colors.text,
    marginRight: 8, // Space between bullet and text
    marginTop: 0,// Slight optical adjustment to center bullet with text
  },
  watermarkContainerEPC: {
    position: 'absolute',
    right: -34,
    bottom: -116,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerAPOGEE: {
    position: 'absolute',
    right: -12,
    bottom: -38,
    width: 138,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerBOSM: {
    position: 'absolute',
    right: -17,
    bottom: -50,
    width: 142,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerOasis: {
    position: 'absolute',
    right: -13,
    bottom: -36,
    width: 138,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerCF: {
    position: 'absolute',
    right: -22,
    bottom: -124,
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'none', // Prevent dots from blocking swipes
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  activeDot: {
    backgroundColor: '#FFC165',
  },
  archiveGraphic: {
    width: 240,
    height: 101,
    position: 'absolute',
    bottom: -102,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 4,
    paddingHorizontal: 2,
    borderRadius: 14,
    minWidth: 40, // All chips same base width, scope for expanding
  },
  chipText: {
    fontFamily: 'LatoSemibold',
    fontSize: 13,
    color: Colors.text,
    includeFontPadding: false,
    lineHeight: 13,
  },
});