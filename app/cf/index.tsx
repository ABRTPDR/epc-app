import { View, Text, StyleSheet, ScrollView, Linking, Dimensions, ImageBackground } from 'react-native';
import { router, Stack } from 'expo-router';
import { Image } from 'expo-image';

// Import the newly separated array
import { CF_ISSUES } from '@/constants/Publications';
import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import SearchButton from '@/components/SearchButton';
import CFGraphic from '@/components/icons/CFGraphic';
import CFGraphicBackground from '@/components/icons/CFGraphicBackground';
import PressableRipple from '@/components/PressableRipple';

// Calculate exact card dimensions for a 2-column grid
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE_PADDING = 20;
const COLUMN_GAP = 16;
// Screen Width - Left/Right Padding - Center Gap, divided by 2 columns
const CARD_WIDTH = (SCREEN_WIDTH - (SIDE_PADDING * 2) - COLUMN_GAP) / 2; 

// Hardcoded asset map
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

export default function CFIndexScreen() {
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} color={Colors.grey} />
        <SearchButton onPress={() => router.push({ pathname: '/search', params: { filters: 'CF' } })} color={Colors.grey} />
        <Text style={styles.headerTitle}>CACTUS FLOWER</Text>
        <Text style={styles.headerDescription}>
          The campus literary magazine,{'\n'}established in 1983. Currently{'\n'}archived, CF returns soon, and{'\n'}is{' '}
          <Text 
            style={styles.linkText}
            onPress={() => Linking.openURL('mailto:epc.bitsp@gmail.com?subject=Contribution%20to%20Cactus%20Flower')}
          >
            accepting reader submissions
          </Text>
          !
        </Text>
        <View style={styles.watermarkContainerCFBackground}>
          <CFGraphicBackground width={144} />
        </View>
        <View style={styles.watermarkContainerCF}>
          <CFGraphic width={120} height={120} color={Colors.blue} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {CF_ISSUES.map((issue, index) => {
            // Check if image mapped for this specific year
            const coverSource = CF_COVERS[issue.year];

            return (
              <PressableRipple 
                key={index}
                style={styles.bookCard}
                onPress={() => router.push({ pathname: '/cf/[year]', params: { year: issue.year, url: issue.driveUrl } })}
              >
                <ImageBackground 
                  source={require('@/assets/images/CFBackground.png')} 
                  style={styles.bookBackground}
                  resizeMode="cover"
                >
                  
                  {/* Show image if it exists in map, else grey box */}
                  {coverSource ? (
                    <Image 
                      source={coverSource} 
                      style={styles.coverImage} 
                      contentFit="cover" 
                    />
                  ) : (
                    <View style={styles.coverPlaceholder} />
                  )}
                  
                  <Text style={styles.bookYear}>{issue.year}</Text>
                </ImageBackground>
              </PressableRipple>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.blue,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: SIDE_PADDING,
    height: 260,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Lora',
    fontSize: 28, 
    color: Colors.text,
    marginTop: 58,
    marginBottom: 12,
    zIndex: 2,
  },
  headerDescription: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.text,
    paddingRight: 140,
    zIndex: 2,
  },
  linkText: {
    color: Colors.url,
    textDecorationLine: 'underline',
  },
  watermarkContainerCF: {
    position: 'absolute',
    right: 1,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerCFBackground: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 144,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  listContainer: {
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24, 
  },
  bookCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.72, 
    borderRadius: 8, 
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  bookBackground: {
    flex: 1,
    width: '106%',
    height: '106%',
    paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coverPlaceholder: {
    width: 150,
    height: 190,
    flex: 1, 
    backgroundColor: '#D9D9D9',
    marginBottom: 6,
    borderRadius: 4,
    marginLeft: -2,
  },
  coverImage: {
    width: 150,
    height: 190,
    flex: 1,
    marginBottom: 6,
    borderRadius: 4,
    marginLeft: -2,
  },
  bookYear: {
    fontFamily: 'Lora',
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
});