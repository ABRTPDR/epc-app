import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Image } from 'expo-image';
import { decode } from 'html-entities';

import { TFP_CATALOG, TFP_YEARS_ORDER, IssueItem } from '@/constants/Publications';
import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import DropDownPicker, { DropDownOption } from '@/components/DropDownPicker';
import PressableRipple from '@/components/PressableRipple';
import CalendarIcon from '@/components/icons/CalendarIcon';
import EPCGraphic from '@/components/icons/EPCGraphic';

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

const cleanExcerpt = (htmlString?: string) => {
  if (!htmlString) return '';
  // Strip HTML tags
  const stripped = htmlString.replace(/(<([^>]+)>)/gi, "");
  // Decode entities (turns &nbsp; into actual spaces)
  const decoded = decode(stripped);
  // Deal with invisible characters eg. non-breaking spaces that escape trim()
  // Strip all spaces, tabs, newlines, and zero-width characters to test if truly empty
  const pureText = decoded.replace(/[\s\u00A0\u200B\u200C\u200D\uFEFF]/g, '');
  
  // Catch the artifacts
  if (pureText === '' || pureText === '[&hellip;]' || pureText === '[...]') {
    return '';
  }
  // If it has real letters/text, return the normally trimmed version
  return decoded.trim();
};

// Memoised card component
const ArticleCard = memo(({ item }: { item: any }) => {
  const router = useRouter(); // Grab router locally

  const thumbnailUrl = optimiseJetpackUrl(item.jetpack_featured_media_url, 200)
    || item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    
  const headerImageSource = thumbnailUrl 
    ? { uri: thumbnailUrl } 
    : require('@/assets/images/Fallback.png');

  const cleanedExcerpt = cleanExcerpt(item.excerpt.rendered);

  return (
    <PressableRipple style={styles.card} onPress={() => router.push(`/article/${item.id}`)}>
      <Image 
          source={headerImageSource} 
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      <View style={styles.cardContent}>
        <Text
          style={[
            styles.cardTitle, 
            !cleanedExcerpt ? { marginBottom: 0 } : null
          ]}
          numberOfLines={2}
        >
          {decode(item.title.rendered)}
        </Text>
        {cleanedExcerpt ? (
          <Text style={styles.cardExcerpt} numberOfLines={2}>
            {cleanedExcerpt}
          </Text>
        ) : null}
      </View>
    </PressableRipple>
  );
});

export default function TfpYearScreen() {
  const { year, issue } = useLocalSearchParams<{ year: string; issue?: string }>();

  const listRef = useRef<FlatList>(null);
  
  // Fallback if year somehow doesn't exist in catalog
  const yearData = TFP_CATALOG[year];
  const availableIssues = yearData?.issues || [];

  // Initialize state with newest issue (first in array)
  const [selectedIssue, setSelectedIssue] = useState<IssueItem>(availableIssues[0]);

  // Force issue to reset whenever user changes year or arrives via a link
    useEffect(() => {
      if (availableIssues.length > 0) {
        // If an issue param was passed, find it, else default to the first one
        const preSelected = issue ? availableIssues.find(i => i.name === issue) : null;
        setSelectedIssue(preSelected || availableIssues[0]);
      }
    }, [year, issue]);

  // Map specific Issue objects into options for Dropdown component
  const yearOptions: DropDownOption[] = TFP_YEARS_ORDER.map((y) => ({
    label: y, 
    value: y  
  }));
  const issueOptions: DropDownOption[] = availableIssues.map((issue) => ({
    label: issue.name,
    value: issue.name 
  }));

  /*
  // Commented out: Logic without article inclusion/exclusion
  // TanStack query: automatically refetch and separate caches based on catIds
  const { data: articles, isLoading, isError } = useQuery({
    // CRITICAL: catIds is now in the key to prevent cache poisoning
    queryKey: ['epc_articles', year, selectedIssue?.name, catIds],
    queryFn: async () => {
      const response = await axios.get(
        `https://epcbits.com/wp-json/wp/v2/posts?categories=${catIds}&_embed&per_page=30`
      );
      return response.data;
    },
    enabled: !!catIds, 
  });
  */

 // Calculate IDs and overrides before the query so React Query can track them
  const { catIds, includedStr, excludedStr } = useMemo(() => {
    if (!selectedIssue) return { catIds: '', includedStr: '', excludedStr: '' };

    let cats: number[] = [];
    let inc: number[] = [];
    let exc: number[] = [];

    // Check for children in case TFP ever uses GroupedIssues
    if ('children' in selectedIssue) {
      selectedIssue.children.forEach(c => {
        cats.push(c.categoryId);
        if (c.includedArticles) inc.push(...c.includedArticles);
        if (c.excludedArticles) exc.push(...c.excludedArticles);
      });
    } else {
      cats.push(selectedIssue.categoryId);
      if (selectedIssue.includedArticles) inc.push(...selectedIssue.includedArticles);
      if (selectedIssue.excludedArticles) exc.push(...selectedIssue.excludedArticles);
    }

    return {
      catIds: cats.join(','),
      includedStr: inc.join(','),
      excludedStr: exc.join(','),
    };
  }, [selectedIssue]);

  // TanStack query: automatically refetch and separate caches
  const { data: articles, isLoading, isError } = useQuery({
    // Included and excluded strings are in the key
    // If inclusion/exclusion changed in Publications.ts, overrides cache
    queryKey: ['epc_articles', year, selectedIssue?.name, catIds, includedStr, excludedStr],
    
    queryFn: async () => {
      let allArticles: any[] = [];

      // Main fetch: only fetch standard categories if ID is not '0' placeholder
      if (catIds !== '0') {
        const catResponse = await axios.get(
          `https://epcbits.com/wp-json/wp/v2/posts?categories=${catIds}&_embed&per_page=30`
        );
        allArticles = catResponse.data;
      }

      // Excluded articles
      if (excludedStr) {
        const excludedIds = excludedStr.split(',').map(Number);
        allArticles = allArticles.filter(article => !excludedIds.includes(article.id));
      }

      // Included articles
      if (includedStr) {
        const extraResponse = await axios.get(
          `https://epcbits.com/wp-json/wp/v2/posts?include=${includedStr}&_embed&per_page=100` // Without &per_page=100, WordPress API only returns 10 items in included/excluded list
        );
        
        // Prevent FlatList crashes by filtering out potential duplicate IDs
        const newArticles = extraResponse.data.filter(
          (newArt: any) => !allArticles.some(existingArt => existingArt.id === newArt.id)
        );

        allArticles = [...allArticles, ...newArticles];
      }

      // Sort by date (newest first)
      allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return allArticles;
    },
    enabled: catIds !== undefined && catIds !== null && catIds !== '', 
  });

  // To handle 2017 'Letters to the Editor', the two child articles have different publishing dates in 2017
  const headerDate = articles?.[0]?.date 
    ? (year === '2017' && selectedIssue.name === 'Letters to the Editor')
      ? '2017' // Hardcoded override specific case
      : new Date(articles[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : `Loading...`;

  // Cached render function
  const renderArticleCard = useCallback(({ item }: { item: any }) => {
    return <ArticleCard item={item} />;
  }, []);

  if (!yearData) return <View style={styles.center}><Text>Year not found.</Text></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} color={Colors.grey} />
        <Text style={styles.headerTitle}>TFP {year}</Text>
        <View style={styles.dateBar}>
          <CalendarIcon color={Colors.text} />
          <Text style={styles.headerDate}>{headerDate}</Text>
        </View>
        <View style={styles.watermarkContainerTFP}>
          <EPCGraphic width={178} />
        </View>
      </View>

      <View style={styles.filterRow}>
        <DropDownPicker 
          value={year} 
          options={yearOptions}
          style={{flex: 4}}
          outlineColour={Colors.tint}
          onSelect={(option) => {
            router.setParams({ year: option.value.toString() });
            // Force list to snap back to the top, to prevent scroll position sustaining for cached year/issue
            listRef.current?.scrollToOffset({ offset: 0, animated: false });
          }}
        />

        {/* Issue dropdown matches by name */}
        <DropDownPicker 
          value={selectedIssue.name}
          options={issueOptions}
          style={{ flex: 6 }}
          outlineColour={Colors.tint}
          onSelect={(option) => {
            const targetIssue = availableIssues.find(i => i.name === option.value);
            if (targetIssue) {
              setSelectedIssue(targetIssue);
              // Force list to snap back to the top, to prevent scroll position sustaining for cached year/issue
              listRef.current?.scrollToOffset({ offset: 0, animated: false });
            }
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.tint} /></View>
      ) : isError ? (
        <View style={styles.center}><Text>Failed to load articles.</Text></View>
      ) : (
        <FlatList
          ref={listRef}
          data={articles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticleCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: Colors.tint,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: 'Lora',
    fontSize: 28,
    color: Colors.text,
    marginTop: 60,
    zIndex: 2,
  },
  headerDate: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.text,
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    zIndex: 2,
  },
  watermarkContainerTFP: {
    position: 'absolute',
    right: -40,
    bottom: -22,
    width: 178,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    zIndex: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
  },
  cardImage: { width: 120, height: '100%', backgroundColor: '#E0E0E0' },
  cardContent: { flex: 1, padding: 18, justifyContent: 'center' },
  cardTitle: { fontFamily: 'LatoSemibold', fontSize: 20, color: Colors.text, marginBottom: 4 },
  cardExcerpt: { fontFamily: 'Lato', fontSize: 14, color: Colors.text, marginRight: 8 },
});