import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
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

  // Calculate IDs before query so React Query can track them
  const catIds = useMemo(() => {
    if (!selectedIssue) return '';
    return 'children' in selectedIssue
      ? selectedIssue.children.map(c => c.categoryId).join(',')
      : selectedIssue.categoryId.toString();
  }, [selectedIssue]);

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


  const headerDate = articles?.[0]?.date 
    ? new Date(articles[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : `Loading...`;

  const cleanExcerpt = (htmlString: string) => {
    const stripped = htmlString.replace(/(<([^>]+)>)/gi, "");
    return decode(stripped).trim();
  };

  const renderArticleCard = ({ item }: { item: any }) => {
    const thumbnailUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    // Conditionally use URL image or local fallback
    const headerImageSource = thumbnailUrl 
      ? { uri: thumbnailUrl } 
      : require('@/assets/images/Fallback.png');

    // Clean excerpt first to know if it is empty
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
              // Remove 4px bottom margin if there is no excerpt to vertically centre title
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
  };

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
          keyExtractor={(item) => item.id.toString()}
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