import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Image } from 'expo-image';
import { decode } from 'html-entities';

import { 
  AEP_CATALOG,
  AEP_YEARS_ORDER,
  BEP_CATALOG,
  BEP_YEARS_ORDER,
  OEP_CATALOG,
  OEP_YEARS_ORDER,
  IssueItem
} from '@/constants/Publications';
import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import DropDownPicker, { DropDownOption } from '@/components/DropDownPicker';
import PressableRipple from '@/components/PressableRipple';
import CalendarIcon from '@/components/icons/CalendarIcon';
import APOGEEGraphic from '@/components/icons/APOGEEGraphic';
import BOSMGraphic from '@/components/icons/BOSMGraphic';
import OasisGraphic from '@/components/icons/OasisGraphic';

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

export default function FestPressYearScreen() {
  // Destructure 'issue' from params for article metadata onclick linking
  const { year, press, issue } = useLocalSearchParams<{ year: string; press: 'AEP' | 'BEP' | 'OEP'; issue?: string }>();

  const listRef = useRef<SectionList>(null);
  
  // Dynamically select correct dictionary
  const catalog = press === 'AEP' ? AEP_CATALOG : press === 'BEP' ? BEP_CATALOG : OEP_CATALOG;
  const yearData = catalog[year];
  const availableIssues = yearData?.issues || [];

  const [selectedIssue, setSelectedIssue] = useState<IssueItem>(availableIssues[0]);

  // Force issue to reset whenever user changes year or arrives via a link
  useEffect(() => {
    if (availableIssues.length > 0) {
      // If an issue param was passed, find it, else default to first one
      const preSelected = issue ? availableIssues.find(i => i.name === issue) : null;
      setSelectedIssue(preSelected || availableIssues[0]);
    }
  }, [year, press, issue]);

  // Extract 4-digit year for the dropdown display (eg. "2026" from "2026 - The Skeumorph")
  const shortYear = year?.substring(0, 4);

  // Split year string to check if it has a custom fest name
  const splitYear = year ? year.split('–') : [];
  const baseYear = splitYear[0]?.trim();
  const festName = splitYear.length > 1 ? splitYear[1]?.trim() : null;

  // Get array of years based on the active press
  const yearsOrder = press === 'AEP' ? AEP_YEARS_ORDER : press === 'BEP' ? BEP_YEARS_ORDER : OEP_YEARS_ORDER;
  
  // Format into { label, value } pairs for the DropDownPicker
  const yearOptions: DropDownOption[] = yearsOrder.map((y) => ({
    label: y.substring(0, 4), // Dropdown UI displays "2026"
    value: y // Background logic uses "2026 - The Skeumorph"
  }));

  const issueOptions: DropDownOption[] = availableIssues.map((issue) => ({
    label: issue.name,
    value: issue.name // Using name as unique value since GroupedIssues lack categoryIds
  }));

  /*
  // Commented out: Logic without article inclusion/exclusion
  const { data: articles, isLoading, isError } = useQuery({
    // Inject catIds directly into key so cache is strictly separated
    queryKey: ['fest_articles', press, year, selectedIssue?.name, catIds],
    
    queryFn: async () => {
      // Inject tracked variable into string
      const response = await axios.get(
        `https://epcbits.com/wp-json/wp/v2/posts?categories=${catIds}&_embed&per_page=100`
      );
      return response.data;
    },
    // Ensure blank request not fired
    enabled: !!catIds,
  });

  // Automatically group fetched articles under their child subheadings
  const sections = useMemo(() => {
    if (!articles) return [];

    if ('children' in selectedIssue) {
      return selectedIssue.children.map(child => ({
        title: child.name,
        // Filter bulk response so only articles matching this specific child category show up
        data: articles.filter((a: any) => a.categories.includes(child.categoryId))
      })).filter(section => section.data.length > 0); // Hide subheadings that have 0 articles
    } 
    
    // Fallback for standard, non-grouped issues
    return [{ title: '', data: articles }];
  }, [articles, selectedIssue]);
  */
  
  // Calculate IDs and overrides before the query so React Query can track them
  const { catIds, includedStr, excludedStr } = useMemo(() => {
    if (!selectedIssue) return { catIds: '', includedStr: '', excludedStr: '' };

    let cats: number[] = [];
    let inc: number[] = [];
    let exc: number[] = [];

    if ('children' in selectedIssue) {
      selectedIssue.children.forEach(c => {
        // Only push actual category IDs to the network request
        if (c.categoryId !== 0) cats.push(c.categoryId);
        
        if (c.includedArticles) inc.push(...c.includedArticles);
        if (c.excludedArticles) exc.push(...c.excludedArticles);
      });
    } else {
      if (selectedIssue.categoryId !== 0) cats.push(selectedIssue.categoryId);
      if (selectedIssue.includedArticles) inc.push(...selectedIssue.includedArticles);
      if (selectedIssue.excludedArticles) exc.push(...selectedIssue.excludedArticles);
    }

    return {
      // If the array is empty (all children were dummy 0s), return '0' to trigger the skip logic
      catIds: cats.length > 0 ? cats.join(',') : '0', 
      includedStr: inc.join(','),
      excludedStr: exc.join(','),
    };
  }, [selectedIssue]);

  // TanStack query: automatically refetch and separate caches
  const { data: articles, isLoading, isError } = useQuery({
    // Extracted strings injected directly into the key so cache updates instantly
    queryKey: ['fest_articles', press, year, selectedIssue?.name, catIds, includedStr, excludedStr],
    
    queryFn: async () => {
      let allArticles: any[] = [];

      // Main fetch
      if (catIds !== '0') {
        const catResponse = await axios.get(
          `https://epcbits.com/wp-json/wp/v2/posts?categories=${catIds}&_embed&per_page=100`
        );
        allArticles = catResponse.data;
      }

      // Exclusion filter
      if (excludedStr) {
        const excludedIds = excludedStr.split(',').map(Number);
        allArticles = allArticles.filter((article: any) => !excludedIds.includes(article.id));
      }

      // Addition fetch
      if (includedStr) {
        // Send both posts and pages requests simultaneously. Catch errors so 404 from one doesn't crash other
        const [extraPostsRes, extraPagesRes] = await Promise.all([
          axios.get(`https://epcbits.com/wp-json/wp/v2/posts?include=${includedStr}&_embed&per_page=100`).catch(() => ({ data: [] })),
          axios.get(`https://epcbits.com/wp-json/wp/v2/pages?include=${includedStr}&_embed&per_page=100`).catch(() => ({ data: [] }))
        ]);
        
        // Merge them together
        const combinedExtra = [...extraPostsRes.data, ...extraPagesRes.data];

        // Prevent crashes by filtering out potential duplicate IDs
        const newArticles = combinedExtra.filter(
          (newArt: any) => !allArticles.some((existingArt: any) => existingArt.id === newArt.id)
        );

        allArticles = [...allArticles, ...newArticles];
      }

      // Sort by date
      allArticles.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return allArticles;
    },
    enabled: catIds !== undefined && catIds !== null && catIds !== '', 
  });

  // Group the fetched articles under their child subheadings
  const sections = useMemo(() => {
    if (!articles) return [];

    if ('children' in selectedIssue) {
      return selectedIssue.children.map(child => ({
        title: child.name,
        data: articles.filter((a: any) => {
          // If in excludedArticles, drop it
          if (child.excludedArticles && child.excludedArticles.includes(a.id)) {
            return false;
          }
          
          // Else, check if it matches the category ID or is in includedArticles
          return a.categories.includes(child.categoryId) || 
                 (child.includedArticles && child.includedArticles.includes(a.id));
        })
      })).filter(section => section.data.length > 0); // Hide subheadings that have 0 articles
    } 
    
    // Fallback for standard, non-grouped issues (catches categoryId: 0 dummy issues)
    return [{ title: '', data: articles }];
  }, [articles, selectedIssue]);


  const headerDate = articles?.[0]?.date 
    ? new Date(articles[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
        <Text style={styles.headerTitle}>
          {press} {baseYear}
          {festName && (
            <Text>
              {' – '}<Text style={styles.italicText}>{festName}</Text>
            </Text>
          )}
        </Text>
        <View style={styles.dateBar}>
          <CalendarIcon color={Colors.text} />
          <Text style={styles.headerDate}>{headerDate}</Text>
        </View>
        <View style={styles.watermarkContainer}>
          {press === 'AEP' && <APOGEEGraphic />}
          {press === 'BEP' && <BOSMGraphic />}
          {press === 'OEP' && <OasisGraphic />}
        </View>
      </View>

      <View style={styles.filterRow}>
        <DropDownPicker 
          value={shortYear} 
          options={yearOptions}
          style = {{ flex: 0.4 }}
          outlineColour={Colors.yellow}
          onSelect={(option) => {
            // setParams updates current URL parameter without pushing a new screen
            router.setParams({ year: option.value.toString() });
            // Force list to snap back to the top, to prevent scroll position sustaining for cached year/issue
            listRef.current?.getScrollResponder()?.scrollTo({ y: 0, animated: false });
          }}
        />

        <DropDownPicker 
          value={selectedIssue.name}
          options={issueOptions}
          style={{ flex: 0.6 }}
          outlineColour={Colors.yellow}
          onSelect={(option) => {
            const targetIssue = availableIssues.find(i => i.name === option.value);
            if (targetIssue) {
              setSelectedIssue(targetIssue);
              // Force list to snap back to the top, to prevent scroll position sustaining for cached year/issue
              listRef.current?.getScrollResponder()?.scrollTo({ y: 0, animated: false });
            }
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.tint} /></View>
      ) : isError ? (
        <View style={styles.center}><Text>Failed to load articles.</Text></View>
      ) : (
        <SectionList
          ref={listRef}
          sections={sections}
          // keyExtractor={(item) => item.id.toString()}
          // Appending the index guarantees unique keys across entire list
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderArticleCard}
          renderSectionHeader={({ section: { title } }) => (
            title ? (
              <View style={styles.subheadingContainer}>
                <View style={styles.subheadingLine} />
                <Text style={styles.subheading}>{title}</Text>
                <View style={styles.subheadingLine} />
              </View>
            ) : null
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false} // Prevent subheadings from snapping to the top
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    backgroundColor: Colors.yellow, 
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: 'Lora',
    fontSize: 25,
    color: Colors.text,
    marginTop: 60,
    zIndex: 2,
  },
  headerDate: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: Colors.text,
  },
  italicText: {
    fontFamily: 'LoraItalic',
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    zIndex: 2,
  },
  watermarkContainer: {
    position: 'absolute',
    right: -18,
    bottom: -22,
    width: 138,
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

  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  subheadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  subheadingLine: {
    flex: 1, // Stretch the line divider to fill available space
    height: 1, // Thickness of line divider
    backgroundColor: Colors.grey,
  },
  subheading: {
    fontFamily: 'Lato',
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    paddingHorizontal: 16, // Gap between divider lines and subheading text
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
    marginBottom: 16, // SectionList requires margin on the item instead of gap
  },
  cardImage: { width: 120, height: '100%', backgroundColor: '#E0E0E0' },
  cardContent: { flex: 1, padding: 18, justifyContent: 'center' },
  cardTitle: { fontFamily: 'LatoSemibold', fontSize: 18, color: Colors.text, marginBottom: 4 },
  cardExcerpt: { fontFamily: 'Lato', fontSize: 14, color: Colors.text, marginRight: 8 },
});