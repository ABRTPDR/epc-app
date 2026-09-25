import AsyncStorage from '@react-native-async-storage/async-storage';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { decode } from 'html-entities';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackButton from '@/components/BackButton';
import IconFadeAnimation from '@/components/IconFadeAnimation';
import DeleteIcon from '@/components/icons/DeleteIcon';
import HistoryIcon from '@/components/icons/HistoryIcon';
import SearchClearIcon from '@/components/icons/SearchClearIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import PressableRipple from '@/components/PressableRipple';
import Colors from '@/constants/Colors';
import {
  CF_ISSUES,
  CFIssue
} from '@/constants/Publications';
import { useCatalog } from '@/hooks/useCatalog';
import { EPCArticle, wpApi } from '@/services/api';

export const CF_COVERS: Record<string, any> = {
  '2020 Issue Two': require('@/assets/images/cf/2020 Issue Two.png'),
  '2020 Issue One': require('@/assets/images/cf/2020 Issue One.png'),
  '2019': require('@/assets/images/cf/2019.png'),
  '2017': require('@/assets/images/cf/2017.png'),
  '2014': require('@/assets/images/cf/2014.png'),
  '2013': require('@/assets/images/cf/2013.png'),
  '2012': require('@/assets/images/cf/2012.png'),
  '2011': require('@/assets/images/cf/2011.png'),
  '2010': require('@/assets/images/cf/2010.png'),
  '2008': require('@/assets/images/cf/2008.png'),
  '2007': require('@/assets/images/cf/2007.png'),
  '2006': require('@/assets/images/cf/2006.png'),
  '2005': require('@/assets/images/cf/2005.png'),
  '2003': require('@/assets/images/cf/2003.png'),
  '2000': require('@/assets/images/cf/2000.png'),
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
function getCategoryIdsForFilters(activeFilters: string[], catalogData?: any): number[] {
  if (!catalogData) return [];

  const ids: number[] = [];
  const catalogMap: Record<string, Record<string, any>> = {
    TFP: catalogData.TFP_CATALOG,
    AEP: catalogData.AEP_CATALOG,
    BEP: catalogData.BEP_CATALOG,
    OEP: catalogData.OEP_CATALOG,
  };

  activeFilters.forEach((filterKey) => {
    const catalog = catalogMap[filterKey];
    if (!catalog) return null; // 'return []' throws errors because then if(...)s evaluate to true

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
function findArticleClassification(categoryIds: number[], articleId: number, catalogData?: any) {
  if (!catalogData) return null;

  const catalogs = [
    { press: 'TFP', data: catalogData.TFP_CATALOG },
    { press: 'AEP', data: catalogData.AEP_CATALOG },
    { press: 'BEP', data: catalogData.BEP_CATALOG },
    { press: 'OEP', data: catalogData.OEP_CATALOG },
  ];

  // Helper to gracefully handle string/number mismatches from remote JSON
  const checkIncludes = (arr: any[] | undefined, id: number) => 
    (arr || []).some(val => Number(val) === id);

  for (const { press, data } of catalogs) {
    if (!data) continue; 
    for (const [year, rawYearCatalog] of Object.entries(data)) {
      const yearCatalog = rawYearCatalog as any; 
      if (!yearCatalog.issues) continue; 
      
      for (const issue of yearCatalog.issues) {
        // 1. ALWAYS check the parent folder first, even if it has children!
        if (checkIncludes(issue.includedArticles, articleId)) {
          return { press, year, issueName: issue.name };
        }
        if (issue.categoryId && categoryIds.includes(issue.categoryId) && !checkIncludes(issue.excludedArticles, articleId)) {
          return { press, year, issueName: issue.name };
        }

        // 2. Then check the children array if it exists
        if ('children' in issue) {
          for (const child of issue.children) {
            if (checkIncludes(child.includedArticles, articleId)) {
              return { press, year, issueName: issue.name };
            }
            if (child.categoryId && categoryIds.includes(child.categoryId) && !checkIncludes(child.excludedArticles, articleId)) {
              return { press, year, issueName: issue.name };
            }
          }
        }
      }
    }
  }
  return null;
}
/*
function findArticleClassification(categoryIds: number[], articleId: number, catalogData?: any) {
  if (!catalogData) return null;

  const catalogs = [
    { press: 'TFP', data: catalogData.TFP_CATALOG },
    { press: 'AEP', data: catalogData.AEP_CATALOG },
    { press: 'BEP', data: catalogData.BEP_CATALOG },
    { press: 'OEP', data: catalogData.OEP_CATALOG },
  ];

  for (const { press, data } of catalogs) {
    if (!data) continue; // Safeguard in case press catalog failed to load
    for (const [year, rawYearCatalog] of Object.entries(data)) {
      const yearCatalog = rawYearCatalog as any; // Forces TypeScript to accept dynamic JSON structure
      if (!yearCatalog.issues) continue; // Safeguard against malformed JSON
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
*/

// Blocklist of post/page IDs that should not appear in search results
const SEARCH_BLOCKLIST = [
  2, // Sample Page
  24, // Welcome
  25, // Blog
  532, // BOSM
  534, // Oasis
  576, // Archives
  644, // Contact Us
  645, // Our Articles
  681, // Home
  723, // Issue 0
  2607, // The Far Out Fest
  2609, // Behind The Scenes
  5236, // The Team
  5271, // About
  5272, // Contact Us
  5503, // BITS Online
  7020, // Forum
];

// Hardcoded IDs that belong to particular press but lack the proper categorisation in WordPress
const TFP_INCLUSIONS = [5349, 5376, 5382, 5386];
const AEP_INCLUSIONS: number[] = []; // Spell out numbers type for empty list
const BEP_INCLUSIONS: number[] = [];
const OEP_INCLUSIONS = [10344];

// Accepts 'page' parameter, hardcoded per_page=20
const searchArticles = async (
  searchTerm: string,
  page: number,
  activeFilters: string[],
  catalogData?: any
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
    const catIds = getCategoryIdsForFilters(wpFilters, catalogData);
    if (catIds.length > 0) {
      categoryParam = `&categories=${catIds.join(',')}`;
    }
  }

  // Fetch posts (with category filters if applicable)
  const postsPromise = wpApi.get(`/posts?_embed&search=${encodedSearch}&orderby=date&page=${page}&per_page=20${categoryParam}`)
    .catch(() => ({ data: [], headers: { 'x-wp-total': '0' } }));
    
  // Fetch pages (categories cannot be passed to /pages, so fetch all matching text first)
  const pagesPromise = wpApi.get(`/pages?_embed&search=${encodedSearch}&orderby=date&page=${page}&per_page=20`)
    .catch(() => ({ data: [], headers: { 'x-wp-total': '0' } }));

  // Aggregate all active hardcoded inclusions
  let activeInclusions: number[] = [];
  if (wpFilters.includes('TFP')) activeInclusions.push(...TFP_INCLUSIONS);
  if (wpFilters.includes('AEP')) activeInclusions.push(...AEP_INCLUSIONS);
  if (wpFilters.includes('BEP')) activeInclusions.push(...BEP_INCLUSIONS);
  if (wpFilters.includes('OEP')) activeInclusions.push(...OEP_INCLUSIONS);

  // Fire the bypass query if we have any active inclusions
  const includedPromise = activeInclusions.length > 0
    ? wpApi.get(`/posts?_embed&search=${encodedSearch}&include=${activeInclusions.join(',')}&orderby=date&page=${page}&per_page=20`)
        .catch(() => ({ data: [], headers: { 'x-wp-total': '0' } }))
    : Promise.resolve({ data: [], headers: { 'x-wp-total': '0' } });

  const [postsResponse, pagesResponse, includedResponse] = await Promise.all([postsPromise, pagesPromise, includedPromise]);

  // Merge the hardcoded posts and count exactly how many genuinely new ones were added
  let combinedPosts = [...postsResponse.data];
  let trueInclusionsAdded = 0;
  
  includedResponse.data.forEach((incItem: EPCArticle) => {
    if (!combinedPosts.some(p => p.id === incItem.id)) {
      combinedPosts.push(incItem);
      trueInclusionsAdded++; // Only count it if it wasn't a duplicate!
    }
  });

  // Remove blocklist articles and adjust result count
  const initialPostsCount = combinedPosts.length;
  combinedPosts = combinedPosts.filter((item: EPCArticle) => !SEARCH_BLOCKLIST.includes(item.id));
  const blockedPostsCount = initialPostsCount - combinedPosts.length;

  const initialPagesCount = pagesResponse.data.length;
  pagesResponse.data = pagesResponse.data.filter((item: EPCArticle) => !SEARCH_BLOCKLIST.includes(item.id));
  const blockedPagesCount = initialPagesCount - pagesResponse.data.length;

  // Calculate the final totals using the trueInclusionsAdded variable
  let postsTotal = parseInt(postsResponse.headers['x-wp-total'] || '0', 10) + trueInclusionsAdded - blockedPostsCount;
  let pagesTotal = parseInt(pagesResponse.headers['x-wp-total'] || '0', 10) - blockedPagesCount;
  
  let combinedItems = [...pagesResponse.data, ...combinedPosts];
  let combinedTotal = postsTotal + pagesTotal;

  // If WP filters active, manually filter returned pages to ensure they belong to the selected fest presses
  if (wpFilters.length > 0 && pagesResponse.data.length > 0) {
      const activePageItems = pagesResponse.data.filter((pageItem: EPCArticle) => {
        const classification = findArticleClassification(pageItem.categories || [], pageItem.id, catalogData);
        return classification && wpFilters.includes(classification.press);
      });
      
      const droppedPagesCount = pagesResponse.data.length - activePageItems.length;
      combinedTotal -= droppedPagesCount;

      combinedItems = [...activePageItems, ...combinedPosts];
  }

  combinedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    items: combinedItems,
    total: combinedTotal
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

// Memoised card component
const SearchResultCard = memo(({ item, catalogData }: { item: EPCArticle; catalogData?: any }) => {
  const router = useRouter(); // Grab router locally for the pressable

  const thumbnailUrl = optimiseJetpackUrl(item.jetpack_featured_media_url, 200)
    || item._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.thumbnail?.source_url
    || item._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  const headerImageSource = thumbnailUrl 
    ? { uri: thumbnailUrl } 
    : require('@/assets/images/Fallback.png');
  
  const categoryIds = item.categories || [];
  const classification = findArticleClassification(categoryIds, item.id, catalogData);
  
  const cleanYear = classification?.year.split(' –')[0] || '';

  let classificationText = 'Article';
  if (classification) {
    const words = classification.issueName.split(/([\s\-]+)/); 
    const shortIssueName = words.slice(0, 3).join('') + (words.length > 3 ? '...' : '');
    classificationText = `${classification.press} ${cleanYear} / ${shortIssueName}`;
  }

  const publishDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric'
  });

  const metaString = `${classificationText}  ·  ${publishDate}`.toUpperCase();

  return (
    <PressableRipple style={styles.resultCard} onPress={() => router.push(`/article/${item.id}`)}>
      <Image 
        source={headerImageSource} 
        style={styles.resultImage}
        contentFit="cover"
      />
      <View style={styles.resultTextContainer}>
        <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
          {metaString}
        </Text>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {decode(item.title.rendered)}
        </Text>
      </View>
    </PressableRipple>
  );
});

export default function SearchExpandedScreen() {
  const router = useRouter();
  const { filters: initialFilters } = useLocalSearchParams<{ filters?: string }>();

  const { data: catalogData } = useCatalog();

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
      // Build an all-encompassing searchable string for each issue
      const targetString = `cf cactus flower ${issue.year.toLowerCase()}`;
      
      // Return true only if every word typed by user is found in the target string, eg. "CF 2018" or "CF Cactus Flower"
      return queryWords.every(word => targetString.includes(word));
    });
  }, [activeFilters, searchQuery, catalogData]);

  
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,   
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['epc_search', searchQuery, activeFilters, catalogData],
    queryFn: ({ pageParam }) => searchArticles(searchQuery, pageParam as number, activeFilters, catalogData),
    
    initialPageParam: 1, 
    
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / 20);
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    // Stop search from firing till JSON loads
    enabled: searchQuery.length > 1 && !!catalogData, 
  });

  // as EPCArticle[]: Tell TS what array holds
  const searchResults = useMemo(() => {
    const allItems = (data?.pages.flatMap(page => page.items) as EPCArticle[]) || [];
    // Re-sort the entire aggregated list globally to destroy chunk boundaries!
    return allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data?.pages]);

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

  // Cached render function
  const renderSearchResult = useCallback(({ item }: { item: EPCArticle }) => {
    return <SearchResultCard item={item} catalogData={catalogData} />;
  }, [catalogData]); // Empty dependency array to ensure function never recreated

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
          extraData={catalogData} // To prevent caching of article classification labels
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