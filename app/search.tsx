import { useState, useEffect, useMemo } from 'react';
import { View, TextInput, StyleSheet, FlatList, ActivityIndicator, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { decode } from 'html-entities';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import SearchIcon from '@/components/icons/SearchIcon';
import SearchClearIcon from '@/components/icons/SearchClearIcon';
import HistoryIcon from '@/components/icons/HistoryIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import { wpApi, EPCArticle } from '@/services/api';
import PressableRipple from '@/components/PressableRipple';
import IconFadeAnimation from '@/components/IconFadeAnimation';
import { 
  TFP_CATALOG, 
  AEP_CATALOG, 
  BEP_CATALOG, 
  OEP_CATALOG,
  CF_ISSUES,
  CFIssue
} from '@/constants/Publications';

export const CF_COVERS: Record<string, any> = {
  '2020 Issue Two': require('@/assets/images/cf/2020 Issue Two.png'),
  '2020 Issue One': require('@/assets/images/cf/2020 Issue One.png'),
  '2019': require('@/assets/images/cf/2019.png'),
  '2017': require('@/assets/images/cf/2017.png'),
  '2014': require('@/assets/images/cf/2014.png'),
  '2012': require('@/assets/images/cf/2012.png'),
  '2011': require('@/assets/images/cf/2011.png'),
  '2006': require('@/assets/images/cf/2006.png'),
  '2005': require('@/assets/images/cf/2005.png'),
  '1998': require('@/assets/images/cf/1998.png'),
  '1997': require('@/assets/images/cf/1997.png'),
  '1996': require('@/assets/images/cf/1996.png'),
  '1995': require('@/assets/images/cf/1995.png'),
  '1992': require('@/assets/images/cf/1992.png'),
  '1991': require('@/assets/images/cf/1991.png'),
  '1989': require('@/assets/images/cf/1989.png'),
  '1984': require('@/assets/images/cf/1984.png'),
  '1983': require('@/assets/images/cf/1983.png'),
};

// Map publication catalogs to WP Category IDs
function getCategoryIdsForFilters(activeFilters: string[]): number[] {
  const ids: number[] = [];
  const catalogMap: Record<string, Record<string, any>> = {
    TFP: TFP_CATALOG,
    AEP: AEP_CATALOG,
    BEP: BEP_CATALOG,
    OEP: OEP_CATALOG,
  };

  activeFilters.forEach((filterKey) => {
    // Include AEP categories not invoked in Publications.ts content
    if (filterKey === 'AEP') {
      ids.push(178, 179, 180, 181);
    }

    const catalog = catalogMap[filterKey];
    if (!catalog) return;

    Object.values(catalog).forEach((yearData: any) => {
      yearData.issues?.forEach((issue: any) => {
        if ('children' in issue) {
          issue.children.forEach((child: any) => {
            if (child.categoryId && child.categoryId !== 0) ids.push(child.categoryId);
          });
        } else if (issue.categoryId && issue.categoryId !== 0) {
          ids.push(issue.categoryId);
        }
      });
    });
  });

  // Array.from(new Set(ids)) automatically prevents duplicates if forcefully included categories were already in catalog
  return Array.from(new Set(ids));
}

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

// Accepts 'page' parameter, hardcoded per_page=20
const searchArticles = async (
  searchTerm: string,
  page: number,
  activeFilters: string[]
): Promise<{ items: EPCArticle[], total: number }> => {
    const wpFilters = activeFilters.filter(f => f !== 'CF');
    // If only CF filter is selected, skip querying WordPress API
    if (activeFilters.includes('CF') && wpFilters.length === 0) {
      return { items: [], total: 0 };
    }
  // Wrap 2-letter queries in parentheses instead of appending a space because eg. likely searches are SU or EC which will be declared in parentheses in article
  const apiTerm = searchTerm.length === 2 ? `(${searchTerm})` : searchTerm;
  // Convert eg. "(ab)" to "%28ab%29"
  const encodedSearch = encodeURIComponent(apiTerm);

  let categoryParam = '';
  if (wpFilters.length > 0) {
    const catIds = getCategoryIdsForFilters(wpFilters);
    if (catIds.length > 0) {
      categoryParam = `&categories=${catIds.join(',')}`;
    }
  }

  const response = await wpApi.get(`/posts?_embed&search=${encodedSearch}&page=${page}&per_page=20${categoryParam}`);
  return {
    items: response.data,
    total: parseInt(response.headers['x-wp-total'] || '0', 10)
  };

};

const FILTER_OPTIONS = [
  { id: 'TFP', label: 'TFP', color: Colors.lightTint, borderColor: Colors.tint },
  { id: 'AEP', label: 'AEP', color: Colors.lightYellow, borderColor: Colors.yellow },
  { id: 'BEP', label: 'BEP', color: Colors.lightYellow, borderColor: Colors.yellow },
  { id: 'OEP', label: 'OEP', color: Colors.lightYellow, borderColor: Colors.yellow },
  { id: 'CF', label: 'CF', color: Colors.lightBlue, borderColor: Colors.blue },
];

// Force the Jetpack CDN to resize images on the edge server
const optimiseJetpackUrl = (url: string | undefined, size: number) => {
  if (!url) return null;
  
  // If it goes through the WP global CDN (i0.wp.com, i1.wp.com, etc.)
  if (url.includes('.wp.com')) {
    const baseUrl = url.split('?')[0]; // Strip the unnecessarily large ?fit params
    // Use URL-encoded comma "%2C"
    return `${baseUrl}?resize=${size}%2C${size}&ssl=1`;
  }
  
  return url;
};

export default function SearchExpandedScreen() {
  const router = useRouter();
  const { filters: initialFilters } = useLocalSearchParams<{ filters?: string }>();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Parse initial comma-separated filters from URL
  const [activeFilters, setActiveFilters] = useState<string[]>(() => {
    if (initialFilters) {
      return initialFilters.split(',').map(f => f.trim()).filter(Boolean);
    }
    return [];
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('epc_search_history');
        if (saved) setSearchHistory(JSON.parse(saved));
      } catch (e) { console.log('Failed to load history'); }
    };
    loadHistory();
  }, []);

  const saveSearchToHistory = async (term: string) => {
    try {
      const cleanTerm = term.trim();
      const filtered = searchHistory.filter(item => item.toLowerCase() !== cleanTerm.toLowerCase());
      filtered.unshift(cleanTerm);
      
      if (filtered.length > 10) filtered.pop();
      
      setSearchHistory(filtered);
      await AsyncStorage.setItem('epc_search_history', JSON.stringify(filtered));
    } catch (e) { console.log('Failed to save history'); }
  };

  const deleteHistoryItem = async (term: string) => {
    try {
      const filtered = searchHistory.filter(item => item !== term);
      setSearchHistory(filtered);
      await AsyncStorage.setItem('epc_search_history', JSON.stringify(filtered));
    } catch (e) {}
  };

  const clearAllHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('epc_search_history');
    } catch (e) {}
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId) 
        : [...prev, filterId]
    );
  };

  const handleSearchSubmit = () => {
    const cleanInput = inputText.trim();
    
    if (cleanInput.length > 1) {
      setSearchQuery(cleanInput);
      saveSearchToHistory(cleanInput);
    }
  };

  // If input perfectly matches active search, user has not started retyping yet
  const isShowingClearIcon = searchQuery.length > 1 && inputText.trim() === searchQuery;

  // Handler for the right-side search bar button
  const handleRightIconPress = () => {
    if (isShowingClearIcon) {
      // If clear icon, clear text box and results
      setInputText('');
      setSearchQuery('');
      setActiveFilters([]);
    } else {
      // If search icon, submit search
      handleSearchSubmit();
    }
  };

  // Match search query against CF issues when CF filter is selected
  const matchedCFIssues = useMemo(() => {
    // If filters are active, but CF is not one of them, hide CF results
    if (activeFilters.length > 0 && !activeFilters.includes('CF')) {
      return [];
    }

    if (searchQuery.trim().length < 2) {
      return [];
    }
    const queryLower = searchQuery.trim().toLowerCase();
    const queryWords = queryLower.split(/\s+/); // Split the search query into individual words
    
    return CF_ISSUES.filter(issue => {
      // Build a all-encompassing searchable string for each issue
      const targetString = `cf cactus flower ${issue.year.toLowerCase()}`;
      
      // Return true only if every word typed by user is found in the target string, eg. "CF 2018" or "CF Cactus Flower"
      return queryWords.every(word => targetString.includes(word));
    });
  }, [activeFilters, searchQuery]);

  
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,   
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['epc_search', searchQuery, activeFilters],
    // Tell TS pageParam is a number here
    queryFn: ({ pageParam }) => searchArticles(searchQuery, pageParam as number, activeFilters),
    
    // Explicitly set starting page
    initialPageParam: 1, 
    
    getNextPageParam: (lastPage, allPages) => {
      // Calculate true total pages using the API header
      const totalPages = Math.ceil(lastPage.total / 20);
      
      // Only ask for a new page if limit not reached
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    enabled: searchQuery.length > 1, 
  });

  // as EPCArticle[]: Tell TS what array holds
  const searchResults = (data?.pages.flatMap(page => page.items) as EPCArticle[]) || [];
  const totalWpResults = data?.pages[0]?.total || 0;
  const totalCombinedResults = totalWpResults + matchedCFIssues.length;

  // Check if WordPress being queried
  const isWPSearchActive = activeFilters.length === 0 || activeFilters.some(f => f !== 'CF');
  // Only show search results Activity Indicator if React Query is loading and WP is being queried
  const showMainSpinner = isLoading && isWPSearchActive;

  const renderCFSpecialCard = (issue: CFIssue) => {
    const coverSource = CF_COVERS[issue.year];

    return (
      <PressableRipple
        key={issue.year}
        style={styles.resultCard}
        onPress={() => router.push({ pathname: '/cf/[year]', params: { year: issue.year, url: issue.driveUrl } })}
      >
        <Image 
          source={coverSource || require('@/assets/images/CFBackground.png')} 
          style={styles.resultImage} 
          contentFit="cover" 
        />
        <View style={styles.resultTextContainer}>
          <Text style={styles.metaText}>CF / {issue.year.toUpperCase()}</Text>
          <Text style={styles.resultTitle}>Cactus Flower {issue.year}</Text>
        </View>
      </PressableRipple>
    );
  };

  const renderSearchResult = ({ item }: { item: EPCArticle }) => {
    /* Previous (slow) logic: full size thumbnails
    // Extract article image
    const thumbnailUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    // Conditionally use URL image or local fallback
    const headerImageSource = thumbnailUrl 
      ? { uri: thumbnailUrl } 
      : require('@/assets/images/Fallback.png');
    */

    // Intercept Jetpack media URL and shrink to 200x200 for the 100x100 result card thumbnail
    const thumbnailUrl = optimiseJetpackUrl(item.jetpack_featured_media_url, 200)
      || item._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.thumbnail?.source_url
      || item._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // Conditionally use URL image or local fallback
    const headerImageSource = thumbnailUrl 
      ? { uri: thumbnailUrl } 
      : require('@/assets/images/Fallback.png');
    
    // Calculate the classification
    const categoryIds = item.categories || [];
    const classification = findArticleClassification(categoryIds, item.id);
    
    // Strip special fest names (eg. "2026 - The Skeumorph" to "2026")
    const cleanYear = classification?.year.split(' –')[0] || '';

    let classificationText = 'Article';
    if (classification) {
      // Split the string by spaces/hyphens
      const words = classification.issueName.split(/([\s\-]+)/); // Instead of split(/[\s\-]+/), as now "Pre-fest" becomes ["Pre","-","fest"], so hyphen shows up in seearch result card classification
      
      // Output first two words and append '...' if third word exists
      const shortIssueName = words.slice(0, 3).join('') + (words.length > 3 ? '...' : '');
      classificationText = `${classification.press} ${cleanYear} / ${shortIssueName}`;
    }

    // Format date as eg. "Aug 29"
    const publishDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric'
    });

    // Combine classification and date, make uppercase
    const metaString = `${classificationText}  ·  ${publishDate}`.toUpperCase();

    return (
      <PressableRipple style={styles.resultCard} onPress={() => router.push(`/article/${item.id}`)}>
        
        <Image 
          source={headerImageSource} 
          style={styles.resultImage}
          contentFit="cover"
        />
        
        <View style={styles.resultTextContainer}>
          {/* Metadata string: category and date */}
          <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
            {metaString}
          </Text>
          
          <Text style={styles.resultTitle} numberOfLines={2}>
            {decode(item.title.rendered)}
          </Text>
        </View>

      </PressableRipple>
    );
  };

  return (
    <SafeAreaView style={styles.container} >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View style={styles.searchBar}>
        <BackButton onPress={() => router.back()} color={Colors.grey} absolute={false}/>
        
        <View style={styles.inputWrapper}>
          {/* Custom text prompt placeholder to guarantee Lora font, not working if style applied to TextInput directly */}
          {!inputText && (
            <Text style={styles.placeholderText} pointerEvents="none">{/* pointerEvents=none means placeholder text is not pressable, passed to TextInput */}
              Search...
            </Text>
          )}

          <TextInput
            style={styles.searchInput}
            value={inputText}
            onChangeText={setInputText}
            autoFocus 
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit} 
          />
        </View>

        <IconFadeAnimation
          onPress={handleRightIconPress} 
          style={[styles.searchButton, { top: 0 }]}
        >
          {/* Swap right-side search bar icon based on state */}
          {isShowingClearIcon ? <SearchClearIcon /> : <SearchIcon />}
        </IconFadeAnimation>

      </View>

      {/* Multi-Select Filters Row */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>FILTERS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_OPTIONS.map(opt => {
            const isActive = activeFilters.includes(opt.id);
            return (
              <PressableRipple 
                key={opt.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: opt.color },
                  { borderColor: opt.borderColor },
                  isActive && { paddingHorizontal: 6 }, // inactivePadding=2px, adding 16px delete icon, so increasing activePadding
                  isActive && { backgroundColor: opt.borderColor }
                ]}
                onPress={() => toggleFilter(opt.id)}
              >
                <Text style={styles.filterChipText}>{opt.label}</Text>
                {isActive && <DeleteIcon color={Colors.text} height={16} width={16} style={{ marginRight: -1 }} />}
              </PressableRipple>
            );
          })}
        </ScrollView>
      </View>

      {/* Dynamic Header */}
      <View style={styles.sectionHeaderRow}>
        {searchQuery ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>RESULTS </Text>
            {showMainSpinner ? (
              <ActivityIndicator size="small" color={Colors.grey} style={{ marginLeft: 4, transform: [{ scale: 0.75 }] }} /> // CSS transform as ActivityIndicator has only large and small
            ) : (
              <Text style={styles.sectionTitle}>({totalCombinedResults})</Text>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
            {searchHistory.length > 0 && (
              <PressableRipple onPress={clearAllHistory} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>CLEAR ALL</Text>
              </PressableRipple>
            )}
          </>
        )}
      </View>

      {/* Empty state */}
      {!showMainSpinner && searchQuery.length > 1 && totalCombinedResults === 0 && (
        <Text style={styles.emptyText}>
          {isWPSearchActive 
            ? `No articles found for "${searchQuery}".` 
            : `No Cactus Flower archives found for "${searchQuery}".`}
        </Text>
      )}

      {/* Conditional Rendering: History vs Results */}
      {!searchQuery ? (
        <View style={styles.historyList}>
          {searchHistory.map(term => (
            <PressableRipple 
              key={term} 
              style={styles.historyItem} 
              onPress={() => {
                setInputText(term);
                setSearchQuery(term);
                saveSearchToHistory(term);
              }}
            >
              <HistoryIcon />
              <Text style={styles.historyItemText}>{term}</Text>
              
              <IconFadeAnimation onPress={() => deleteHistoryItem(term)} style={styles.historyDeleteButton}>
                <DeleteIcon />
              </IconFadeAnimation>
            </PressableRipple>
          ))}
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSearchResult}
          
          // Prepend Cactus Flower special result cards to top, followed by the WP loader
          ListHeaderComponent={
            <View>
              {matchedCFIssues.length > 0 && matchedCFIssues.map(renderCFSpecialCard)}
              {showMainSpinner && (
                <ActivityIndicator style={{ marginTop: 40, marginBottom: 20 }} size="large" color={Colors.tint} />
              )}
            </View>
          }
          
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5} 
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ paddingVertical: 20 }} size="large" color={Colors.tint} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    height: 64,
    backgroundColor: Colors.darkwhite, 
    borderRadius: 25,
    paddingHorizontal: 13,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.grey,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  placeholderText: {
    position: 'absolute',
    fontFamily: 'Lora',
    fontSize: 20,
    color: Colors.grey,
    left: 4, // Align with where input text starts
  },
  searchInput: {
    flex: 1, // Push button to right side of search bar
    height: '100%',
    fontSize: 20,
    fontFamily: 'Lora',
    color: Colors.text,
  },
  submitButtonText: {
    fontFamily: 'LatoSemibold',
    fontSize: 16,
    color: Colors.tint, 
    paddingRight: 8,
  },
  searchButton: {
    marginRight: 0,
  },
  listContainer: {
    gap: 16, 
    marginBottom: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
    paddingTop: 8,      
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Lato',
    fontSize: 16,
    color: Colors.grey,
    marginTop: 60,
    paddingHorizontal: 32, 
  },
  resultCard: {
    backgroundColor: Colors.darkwhite,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    borderRadius: 20, 
    justifyContent: 'center',
    height: 100,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  resultImage: {
    height: 100,
    width: 100,
    backgroundColor: Colors.lightGrey, // Placeholder color while loading
  },
  resultTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingLeft: 18,
  },
  metaText: {
    fontFamily: 'LatoSemibold',
    fontSize: 13,
    color: Colors.grey,
    marginBottom: 8,
    includeFontPadding: false, // Disable extra Android vertical spacing
    textAlignVertical: 'center', // Align text to container
  },
  resultTitle: {
    fontFamily: 'LatoSemibold',
    fontSize: 18,
    color: Colors.text,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  filterLabel: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.grey,
    marginHorizontal: 16,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
    paddingBottom: 2,
    paddingHorizontal: 2,
    borderRadius: 16,
    minWidth: 46, // All chips same base width, scope for expanding
    borderWidth: 2,
  },
  filterChipText: {
    fontFamily: 'LatoSemibold',
    fontSize: 14,
    color: Colors.text,
    marginRight: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 8, // Gap between ('Recent Searches' and history items) and ('Results' and result cards)
    minHeight: 28, // To prevent 'RECENT SEARCHES' from jumping up when 'CLEAR ALL' button disappears
  },
  sectionTitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.grey,
  },
  clearAllButton: {
    backgroundColor: Colors.darkwhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  clearAllText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.text,
  },
  historyList: {
    paddingBottom: 20,
    marginHorizontal: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 14,
    borderRadius: 12,
  },
  historyItemText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
    marginRight: 6,
  },
  historyDeleteButton: {
    padding: 4,
  },
});