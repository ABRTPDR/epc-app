import { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query'; // SWAPPED: Now supports pagination
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter, Stack } from 'expo-router';
import { decode } from 'html-entities';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import SearchIcon from '@/components/icons/SearchIcon';
import SearchClearIcon from '@/components/icons/SearchClearIcon';
import { wpApi, EPCArticle } from '@/services/api';
import PressableRipple from '@/components/PressableRipple';
import IconFadeAnimation from '@/components/IconFadeAnimation';

// 1. Updated to accept 'page' parameter and hardcode per_page=10
const searchArticles = async (searchTerm: string, page: number): Promise<EPCArticle[]> => {
  // Wrap 2-letter queries in parentheses instead of appending a space because most likely searches are SU or EC which will be declared in parentheses in article
  const apiTerm = searchTerm.length === 2 ? `(${searchTerm})` : searchTerm;
  
  // This will now reliably convert "(ab)" to "%28ab%29"
  const encodedSearch = encodeURIComponent(apiTerm); 
  
  const response = await wpApi.get(`/posts?_embed&search=${encodedSearch}&page=${page}&per_page=10`);
  return response.data;
};

export default function SearchExpandedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    const cleanInput = inputText.trim();
    
    if (cleanInput.length > 1) {
      setSearchQuery(cleanInput);
    }
  };

  // 1. If the input perfectly matches the active search, they haven't started retyping yet!
  const isShowingClearIcon = searchQuery.length > 1 && inputText.trim() === searchQuery;

  // 2. A dual-purpose handler for the right-side button
  const handleRightIconPress = () => {
    if (isShowingClearIcon) {
      // If it's an X, clear the text box AND the results
      setInputText('');
      setSearchQuery('');
    } else {
      // If it's a magnifying glass, submit the search
      handleSearchSubmit();
    }
  };

  // 2. Swapped to useInfiniteQuery
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage,   
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['epc_search', searchQuery],
    // 1. Tell TypeScript pageParam is a number here
    queryFn: ({ pageParam }) => searchArticles(searchQuery, pageParam as number),
    
    // 2. ADD THIS LINE: Explicitly set the starting page for v5
    initialPageParam: 1, 
    
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: searchQuery.length > 1, 
  });

  // 3. ADD 'as EPCArticle[]': Explicitly tell TypeScript what this array holds!
  const searchResults = (data?.pages.flat() as EPCArticle[]) || [];

  /*
  const renderSearchResult = ({ item }: { item: EPCArticle }) => (
    <Link href={{ pathname: '/article/[id]', params: { id: item.id } }} asChild>
      <View style={styles.resultCardMask}>
        <PressableRipple style={styles.resultCard}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {decode(item.title.rendered)}
          </Text>
        </PressableRipple>
      </View>
    </Link>
  );
  */
 const renderSearchResult = ({ item }: { item: EPCArticle }) => {
    // 1. Extract the meta-data
    const thumbnailUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const wpCategories = item._embedded?.['wp:term']?.[0];
    const rawCategory = wpCategories && wpCategories.length > 0 ? wpCategories[0].name : 'Article';
    const categoryName = decode(rawCategory); //to convert stuff like '&amp' to '&'
    const publishDate = new Date(item.date).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric'
    });

    return (
      <View style={styles.resultCardMask}>
        <PressableRipple style={styles.resultCard} onPress={() => router.push(`/article/${item.id}`)}>
          
          {/* The image is now a child of resultCard, no longer pushed by padding */}
          {thumbnailUrl && (
            <Image source={{ uri: thumbnailUrl }} style={styles.resultImage} />
          )}
          
          <View style={styles.resultTextContainer}>
            <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
              {categoryName.toUpperCase()} • {publishDate}
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <View style={styles.searchBarMask}>
        <View style={styles.searchBar}>
          <BackButton onPress={() => router.back()} color={Colors.grey} absolute={false}/>
          
          <TextInput
            style={[styles.searchInput, { fontFamily: 'Lora' }]}
            placeholder="Search..."
            placeholderTextColor={Colors.grey}
            value={inputText}
            onChangeText={setInputText}
            autoFocus 
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit} 
          />

          <IconFadeAnimation
            onPress={handleRightIconPress} 
            style={[styles.searchButton, { top: 0 }]}
          >
            {/* 3. Instantly swap the SVG based on the typing state */}
            {isShowingClearIcon ? <SearchClearIcon /> : <SearchIcon />}
          </IconFadeAnimation>

        </View>
      </View>

      {/* Main loading state for the very first search */}
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
        
        // 4. Infinite Scroll Triggers
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5} 
        
        // 5. The bottom spinner for subsequent pages
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ paddingVertical: 20 }} size="large" color={Colors.tint} />
          ) : null
        }
      />
    </View>
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
  searchInput: {
    flex: 1, // Added flex: 1 so it pushes the Enter button to the right
    height: '100%', 
    fontSize: 20,
    fontFamily: 'Lora',
    color: Colors.text, // Changed to Colors.text so user input is dark and readable
    // Need to add below lines to make 'Search...' prompt also be Lora [BT HERE IT ALTERNATES BETWEEN LORA AND DEFAULT FOR SOME REASON ON SEARCH LAUNCH]
    fontWeight: 'normal', 
    fontStyle: 'normal',
  },
  searchBarMask: {
    marginHorizontal: 24,
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
    paddingHorizontal: 24,
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
    //paddingVertical: 20,
    paddingRight: 24,
    borderRadius: 20, 
    justifyContent: 'center',
  },
  resultImage: {
    height: 100,
    width: 100,
    backgroundColor: Colors.lightgrey, // Placeholder color while loading
  },
  resultTextContainer: {
    flex: 1, // Ensures text takes up remaining space
    justifyContent: 'center',
    paddingVertical: 20,
    paddingLeft: 20,
  },
  metaText: {
    fontFamily: 'LatoSemibold',
    fontSize: 12,
    color: Colors.url,
    marginBottom: 4,
    includeFontPadding: false, // Disables extra Android vertical spacing
    textAlignVertical: 'center', // Aligns text strictly to the container
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