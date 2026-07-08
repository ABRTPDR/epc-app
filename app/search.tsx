import { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { decode } from 'html-entities';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import SearchIcon from '@/components/icons/SearchIcon';
import SearchClearIcon from '@/components/icons/SearchClearIcon';
import { wpApi, EPCArticle } from '@/services/api';
import PressableRipple from '@/components/PressableRipple';
import IconFadeAnimation from '@/components/IconFadeAnimation';
import { 
  TFP_CATALOG, 
  AEP_CATALOG, 
  BEP_CATALOG, 
  OEP_CATALOG 
} from '@/constants/Publications';

// Helper function to map WP category IDs back to Press/Year/Issue structure
function findArticleClassification(categoryIds: number[]) {
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
            if (categoryIds.includes(child.categoryId)) {
              return { press, year, issueName: issue.name };
            }
          }
        } else if (categoryIds.includes(issue.categoryId)) {
          return { press, year, issueName: issue.name };
        }
      }
    }
  }
  return null;
}

// Accepts 'page' parameter, hardcoded per_page=10
const searchArticles = async (searchTerm: string, page: number): Promise<EPCArticle[]> => {
  // Wrap 2-letter queries in parentheses instead of appending a space because eg. likely searches are SU or EC which will be declared in parentheses in article
  const apiTerm = searchTerm.length === 2 ? `(${searchTerm})` : searchTerm;
  
  // Convert eg. "(ab)" to "%28ab%29"
  const encodedSearch = encodeURIComponent(apiTerm); 
  
  const response = await wpApi.get(`/posts?_embed&search=${encodedSearch}&page=${page}&per_page=10`);
  return response.data;
};

export default function SearchExpandedScreen() {
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    const cleanInput = inputText.trim();
    
    if (cleanInput.length > 1) {
      setSearchQuery(cleanInput);
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
    } else {
      // If search icon, submit search
      handleSearchSubmit();
    }
  };

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,   
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['epc_search', searchQuery],
    // Tell TS pageParam is a number here
    queryFn: ({ pageParam }) => searchArticles(searchQuery, pageParam as number),
    
    // Explicitly set starting page
    initialPageParam: 1, 
    
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: searchQuery.length > 1, 
  });

  // as EPCArticle[]: Tell TS what array holds
  const searchResults = (data?.pages.flat() as EPCArticle[]) || [];

 const renderSearchResult = ({ item }: { item: EPCArticle }) => {
    // Extract article image
    const thumbnailUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    // Conditionally use URL image or local fallback
    const headerImageSource = thumbnailUrl 
      ? { uri: thumbnailUrl } 
      : require('@/assets/images/Fallback.png');
    
    // Calculate the classification
    const categoryIds = item.categories || [];
    const classification = findArticleClassification(categoryIds);
    
    // Strip special fest names (eg. "2026 - The Skeumorph" -> "2026")
    const cleanYear = classification?.year.split(' –')[0] || '';

    let classificationText = 'Article';
    if (classification) {
      // Split the string by spaces/hyphens
      const words = classification.issueName.split(/[\s\-]+/);
      
      // Output first two words and append '...' if third word exists
      const shortIssueName = words.slice(0, 2).join(' ') + (words.length > 2 ? '...' : '');
      classificationText = `${classification.press} ${cleanYear} / ${shortIssueName}`;
    }

    // Format date as eg. "Aug 29"
    const publishDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric'
    });

    // Combine classification and date, make uppercase
    const metaString = `${classificationText}  ·  ${publishDate}`.toUpperCase();

    return (
      <View style={styles.resultCardMask}>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View style={styles.searchBarMask}>
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
      </View>

      {/* Main loading state for first search */}
      {isLoading && searchQuery.length > 1 && (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.tint} />
      )}

      {!isLoading && searchQuery.length > 1 && searchResults.length === 0 && (
        <Text style={styles.emptyText}>No articles found for "{searchQuery}".</Text>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSearchResult}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // Infinite scroll triggers
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5} 
        
        // Bottom spinner for subsequent pages
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ paddingVertical: 20 }} size="large" color={Colors.tint} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    gap: 16,
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
  searchBarMask: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 25,
    overflow: 'hidden',
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
    paddingRight: 24,
    borderRadius: 20, 
    justifyContent: 'center',
    height: 100,
  },
  resultImage: {
    height: 100,
    width: 100,
    backgroundColor: Colors.lightgrey, // Placeholder color while loading
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
  resultCardMask: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
});