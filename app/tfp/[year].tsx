import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
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

 // Calculate IDs before the query so React Query can track them
  const catIds = useMemo(() => {
    if (!selectedIssue) return '';
    return 'children' in selectedIssue 
      ? selectedIssue.children.map(c => c.categoryId).join(',')
      : selectedIssue.categoryId.toString();
  }, [selectedIssue]);

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

  // To handle 2017 'Letters to the Editor', the two child articles have different publishing dates in 2017
  const headerDate = articles?.[0]?.date 
    ? (year === '2017' && selectedIssue.name === 'Letters to the Editor')
      ? '2017' // Hardcoded override specific case
      : new Date(articles[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : `Loading...`;

  // Helper to strip <p> tags WordPress wraps around excerpts
  const cleanExcerpt = (htmlString: string) => {
    const stripped = htmlString.replace(/(<([^>]+)>)/gi, "");
    return decode(stripped).trim();
  };

  const renderArticleCard = ({ item }: { item: any }) => {
    // Going into the _embedded object to find image URL
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
              // Remove 4px bottom margin if no excerpt, to vertically centre title
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