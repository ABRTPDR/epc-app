import { Animated, StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import { useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { decode } from 'html-entities';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';

import PressableRipple from '@/components/PressableRipple';
import EpcLogo from '@/components/icons/EpcLogo';
import ExpanderIcon from '@/components/icons/ExpanderIcon';
import GamesWordleLogo from '@/components/icons/GamesWordleLogo';
import GamesSudokuLogo from '@/components/icons/GamesSudokuLogo';
import GamesConnectionsLogo from '@/components/icons/GamesConnectionsLogo';

import { useQuery } from '@tanstack/react-query';
import { wpApi, EPCArticle } from '@/services/api';

import Colors from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { 
  TFP_CATALOG, 
  AEP_CATALOG, 
  BEP_CATALOG, 
  OEP_CATALOG 
} from '@/constants/Publications';

// Keep the splash screen visible while fetching initial data
SplashScreen.preventAutoHideAsync();

// Calculate carousel central card width
const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Card itself takes up 78% of screen
const ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.78); 
// Gap between carousel cards
const ITEM_SPACING = 0; 
// Total space one item occupies (used for snapping and animation)
const FULL_ITEM_SIZE = ITEM_WIDTH + ITEM_SPACING;

const fetchTopArticles = async (): Promise<EPCArticle[]> => {
  const response = await wpApi.get(`/posts?_embed&per_page=8`); // Get 8 most recent posts
  return response.data;
};

const handleGamePress = () => {
  Toast.show({
    type: 'info',
    text1: 'Coming Soon!',
    text2: 'devs currently ghoting',
    position: 'bottom',
    visibilityTime: 1500, // Disappears after 1.5ms
  });
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
            // Check: is it explicitly included here?
            if (child.includedArticles?.includes(articleId)) {
              return { press, year, issueName: issue.name };
            }
            // Fallback check: does it match the category and is not excluded?
            if (categoryIds.includes(child.categoryId) && !child.excludedArticles?.includes(articleId)) {
              return { press, year, issueName: issue.name };
            }
          }
        } else {
          // Check: is it explicitly included here?
          if (issue.includedArticles?.includes(articleId)) {
            return { press, year, issueName: issue.name };
          }
          // Fallback check: does it match the category and is not excluded?
          if (categoryIds.includes(issue.categoryId) && !issue.excludedArticles?.includes(articleId)) {
            return { press, year, issueName: issue.name };
          }
        }
      }
    }
  }
  return null;
}

export default function HomeScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;

  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['epc_top_articles'],
    queryFn: fetchTopArticles,
  });

  // Watch loading state and hide splash screen when data ready
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Prevent FlatList from rendering an empty array and crashing its index
  if (isLoading || !articles) {
    // Returns a blank background that stays perfectly hidden behind your Splash Screen
    return <View style={styles.container} />; 
  }

  // Carousel loop setup
  const activeArticles = articles?.slice(0, 8) || [];
  const renderArticleCard = ({ item, index }: { item: EPCArticle; index: number }) => {
    const thumbnailUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    // Conditionally use URL image or local fallback
    const headerImageSource = thumbnailUrl 
      ? { uri: thumbnailUrl } 
      : require('@/assets/images/Fallback.png');

    const categoryIds = item.categories || [];
    const classification = findArticleClassification(categoryIds, item.id);
    
    const cleanYear = classification?.year.split(' –')[0] || '';

    let classificationText = 'ARTICLE';
    
    if (classification) {
      const issueName = classification.issueName;
      classificationText = `${classification.press} ${cleanYear} / ${issueName}`;
    }

    const inputRange = [
      (index - 1) * FULL_ITEM_SIZE,
      index * FULL_ITEM_SIZE,
      (index + 1) * FULL_ITEM_SIZE,
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85], 
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width: FULL_ITEM_SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          
          <Image 
            source={headerImageSource} 
            style={styles.thumbnail}
            contentFit="cover"
          />
          
          {/* Scrim */}
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
            locations={[0, 0.25, 0.75, 1]} 
            style={StyleSheet.absoluteFill} 
          />
          
          <Link href={{ pathname: '/article/[id]', params: { id: item.id } }} asChild>
            <PressableRipple style={StyleSheet.absoluteFill}>
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>{decode(item.title.rendered)}</Text>
                
                <View style={styles.bottomRow}>
                  <Text style={styles.category}>{classificationText}</Text>
                </View>

              </View>
            </PressableRipple>
          </Link>
          
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* TFP by EPC header */}
      <View style={styles.headerContainer}>
        <EpcLogo width={60} height={60} style={styles.logo} />
      
        <View style={styles.textColumn}>
          <Text style={styles.headerTitle}>THE FINE PRINT</Text>
          <Text style={styles.headerSubtitle}>ENGLISH PRESS CLUB, BITS PILANI</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1  }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View>
          <Animated.FlatList
            data={activeArticles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderArticleCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            
            snapToInterval={FULL_ITEM_SIZE}
            decelerationRate="fast"

            initialScrollIndex={1} // Begin carousel at card 2 for aesthetics
            
            contentContainerStyle={{
              paddingVertical: Spacing.large,
              paddingHorizontal: Math.floor((SCREEN_WIDTH - FULL_ITEM_SIZE) / 2),
            }}
            
            getItemLayout={(data, index) => ({
              length: FULL_ITEM_SIZE,
              offset: FULL_ITEM_SIZE * index,
              index,
            })}

            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />

          {/* Carousel indicator dots */}
          <View style={styles.indicatorContainer}>
            {activeArticles.map((_, index) => {
              const inputRange = [
                (index - 1) * FULL_ITEM_SIZE,
                index * FULL_ITEM_SIZE,
                (index + 1) * FULL_ITEM_SIZE,
              ];

              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 8, 8], 
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3], 
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index.toString()}
                  style={[styles.dot, { width: dotWidth, opacity }]}
                />
              );
            })}
          </View>
        </View>          

        {/* Dynamic 'From The Archives' card */}
        <View style={styles.cardMask}>
          <PressableRipple style={styles.archivesCard}>
            
            <View style={styles.archivesTagRow}>
              <Text style={styles.archivesTagText}>FROM THE ARCHIVES</Text>
              <ExpanderIcon size={10} color={Colors.grey} /> 
            </View>
            
            <Text style={styles.archivesQuote}>
              “...a souvenir of the year that was ’92 and of the perennial phenomenon that is BITS...”
            </Text>
          </PressableRipple>
        </View>

        {/* Games */}
        <View style={styles.cardMask}>
          <PressableRipple style={styles.gamesCard} onPress={handleGamePress}>
            <View style={styles.gamesHeaderContainer}>
              <Text style={styles.gamesTitle}>TOTALLY ORIGINAL GAMES</Text>
            </View>
            <View style={styles.gamesDivider} />
            <View style={styles.gamesRow}>
              {/* Game 1 - BITSian Words */}
              <View style={styles.gameItem}>
                <GamesWordleLogo size={60} style={styles.gamesIcon} />
                <Text style={styles.gameLabel}>BITSian{'\n'}Words</Text>
              </View>
              
              {/* Game 2 - Regular Sudoku */}
              <View style={styles.gameItem}>
                <GamesSudokuLogo size={60} style={styles.gamesIcon} />
                <Text style={styles.gameLabel}>Regular{'\n'}Sudoku</Text>
              </View>
              
              {/* Game 3 - BITSian Connect */}
              <View style={styles.gameItem}>
                <GamesConnectionsLogo size={60} style={styles.gamesIcon} />
                <Text style={styles.gameLabel}>BITSian{'\n'}Connect</Text>
              </View>
            </View>

          </PressableRipple>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 14,
    marginTop: 5,
  },
  textColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Lora',
    fontWeight: 400,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14.4,
    fontFamily: 'Lato',
    color: Colors.text,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  card: {
    width: ITEM_WIDTH,
    aspectRatio: 1, // Square
    borderRadius: 24,
    overflow: 'hidden',
  },
  thumbnail: {
    ...StyleSheet.absoluteFill, // Stretch image to fill card
    width: undefined,
    height: undefined,
    backgroundColor: Colors.lightgrey, 
  },
  cardContent: {
    flex: 1, // Fill remaining space over image
    justifyContent: 'space-between', // Pushes title to the top, date to the bottom
    paddingHorizontal: Spacing.xl,
    // Overriding top and bottom padding with smaller numbers
    paddingTop: 13,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    color: Colors.white,
    fontFamily: 'Lora',
  },
  bottomRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: Colors.lightgrey,
    fontFamily: 'Lato',
  },
  date: {
    fontSize: 14,
    color: '#E0E0E0',
    fontFamily: 'Lato',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -6, // Pull dots closer to the bottom of the cards
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey,
    marginHorizontal: 4,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  archivesCard: {
    backgroundColor: Colors.green,
    borderRadius: 20,
    paddingVertical: Spacing.med,
    paddingHorizontal: Spacing.large,
  },
  archivesTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4, // Space between 'From The Archives' and expander icon
  },
  archivesTagText: {
    fontFamily: 'LatoSemibold',
    fontSize: 14,
    color: Colors.grey,
  },
  archivesQuote: {
    fontFamily: 'Lora',
    fontSize: 17,
    fontWeight: 400,
    color: Colors.text,
    lineHeight: 22,
  },
  gamesCard: {
    backgroundColor: Colors.tint,
    borderRadius: 24,
    overflow: 'hidden', // Keep divider line inside the borders
  },
  cardMask: {
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: Spacing.large,
    marginVertical: Spacing.small,
  },
  gamesHeaderContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  gamesIcon: {
    marginBottom: 8,
  },
  gamesTitle: {
    fontFamily: 'LatoSemibold',
    fontSize: 16,
    color: Colors.text,
  },
  gamesDivider: {
    height: 2,
    backgroundColor: Colors.background,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  gameItem: {
    alignItems: 'center',
  },
  gameLabel: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});