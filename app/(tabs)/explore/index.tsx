import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import PressableRipple from '@/components/PressableRipple';
import StylisedSearch from '@/components/icons/StylisedSearch';
import EPCGraphic from '@/components/icons/EPCGraphic';
import APOGEEGraphic from '@/components/icons/APOGEEGraphic';
import BOSMGraphic from '@/components/icons/BOSMGraphic';
import OasisGraphic from '@/components/icons/OasisGraphic';
import CFGraphic from '@/components/icons/CFGraphic';
import { AEP_YEARS_ORDER, BEP_YEARS_ORDER, OEP_YEARS_ORDER } from '@/constants/Publications';

const BulletPoint = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.cardBodyText, { paddingTop: 1, paddingRight: 120 }]}>{children}</Text>
    </View>
  );
}; 

const BulletList = ({ items }: { items: string[] }) => {
  return (
    <View>
      {items.map((item, index) => (
        <BulletPoint key={index}>{item}</BulletPoint>
      ))}
    </View>
  );
};

export default function ExploreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Total screen width minus 20px side margins
  const cardWidth = width - 40; 

  // Track active carousel dot
  const [activeFestPress, setActiveFestPress] = useState(0);

  const onFestPressScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeFestPress) {
      setActiveFestPress(roundIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.searchBarMask, { marginBottom: 16 }]}>
          <PressableRipple style={styles.searchBar} onPress={() => router.push('/search')}>
            <StylisedSearch width={53} height={55} style={styles.stylisedSearch} />
            <Text style={styles.searchInactiveText}>Search for an article...</Text>
          </PressableRipple>
        </View>

      <ScrollView style={{ flex: 1  }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.cardMask}>
          <PressableRipple style={styles.tfpCard} onPress={() => router.push('/tfp')}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardHeaderText, { paddingLeft: 20, paddingTop: 10 }]}>THE FINE PRINT</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardBody}>
              <Text style={[styles.cardBodyText, { paddingTop: 12, paddingRight: 140 }]}>The campus newsletter. New issues every other month.</Text>
              <View style={styles.watermarkContainerEPC}>
                <EPCGraphic width={220} />
              </View>
            </View>
          </PressableRipple>
        </View>

        <View style={styles.cardMask}>
          <View style={styles.festPressCard}>
            
            {/* Stationary header (routes to /festPresses/index.tsx) */}
            <PressableRipple onPress={() => router.push('/festPresses')}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardHeaderText, { paddingLeft: 20, paddingTop: 10 }]}>FEST PRESSES</Text>
              </View>
            </PressableRipple>
            
            <View style={styles.divider} />
            
            {/* 2. Swipable carousel body (routes to particular fest press) */}
            <View style={{ flex: 1 }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onFestPressScroll}
                scrollEventThrottle={16}
              >
                {/* APOGEE Card */}
                <PressableRipple 
                  style={{ width: cardWidth, flex: 1 }} 
                  onPress={() => router.push({ pathname: '/festPresses/[year]', params: { press: 'AEP', year: AEP_YEARS_ORDER[0] } })}
                >
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardSubheaderText, { paddingTop: 8, paddingRight: 128 }]}>APOGEE ENGLISH PRESS</Text>
                    <BulletList 
                      items={[
                        'Pre-fest interviews — club coords and the CoStAA.', 
                        'Digital archives of fest issues.'
                      ]} 
                    />
                    <View style={styles.watermarkContainerAPOGEE}>
                      <APOGEEGraphic width={138} height={138} />
                    </View>
                  </View>
                </PressableRipple>

                {/* BOSM Card */}
                <PressableRipple 
                  style={{ width: cardWidth, flex: 1 }} 
                  onPress={() => router.push({ pathname: '/festPresses/[year]', params: { press: 'BEP', year: BEP_YEARS_ORDER[0] } })}
                >
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardSubheaderText, { paddingTop: 8, paddingRight: 128 }]}>BOSM ENGLISH PRESS</Text>
                    <BulletList 
                      items={[
                        'Pre-fest interviews — team captains and the CoSSAc.', 
                        'Digital archives of fest issues.'
                      ]} 
                    />
                    <View style={styles.watermarkContainerBOSM}>
                      <BOSMGraphic width={138} height={138} />
                    </View>
                  </View>
                </PressableRipple>

                {/* OASIS Card */}
                <PressableRipple 
                  style={{ width: cardWidth, flex: 1 }} 
                  onPress={() => router.push({ pathname: '/festPresses/[year]', params: { press: 'OEP', year: OEP_YEARS_ORDER[0] } })}
                >
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardSubheaderText, { paddingTop: 8, paddingRight: 128 }]}>OASIS ENGLISH PRESS</Text>
                    <BulletList
                      items={[
                        'Pre-fest interviews — club coords and the StuCCA.', 
                        'Digital archives of fest issues.'
                      ]} 
                    />
                    <View style={styles.watermarkContainerOasis}>
                      <OasisGraphic width={138} height={138} />
                    </View>
                  </View>
                </PressableRipple>
              </ScrollView>

              {/* Carousel dot indicator */}
              <View style={styles.dotsContainer}>
                <View style={[styles.dot, activeFestPress === 0 && styles.activeDot]} />
                <View style={[styles.dot, activeFestPress === 1 && styles.activeDot]} />
                <View style={[styles.dot, activeFestPress === 2 && styles.activeDot]} />
              </View>
            </View>

          </View>
        </View>

        <View style={styles.cardMask}>
          <PressableRipple style={styles.cfCard} onPress={() => router.push('/cf')}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardHeaderText, { paddingLeft: 20, paddingTop: 10 }]}>CACTUS FLOWER</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardBody}>
              <Text style={[styles.cardBodyText, { paddingTop: 12 }]}>Campus literary magazine; for writers, poets, artists. Currently archived, CF returns soon.</Text>
              <Image
                source={require('@/assets/images/ArchiveGraphic.png')} 
                style={styles.archiveGraphic}
                contentFit="contain"
              />
              <View style={styles.watermarkContainerCF}>
                <CFGraphic width={130} height={130} />
              </View>
            </View>
          </PressableRipple>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    gap: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    height: 64,
    backgroundColor: Colors.lightgrey,
    borderRadius: 25,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  stylisedSearch: {
  bottom: -8,
  zIndex: 1,
  },
  searchInactiveText: {
    fontSize: 20,
    fontFamily: 'Lora',
    color: Colors.grey,
  },
  searchBarMask: {
    marginTop: 8,
    borderRadius: 25,
    overflow: 'hidden',
    margin: 20,
  },
  menuContainer: {
    gap: 16,
    marginBottom: 24,
  },
  tfpCard: {
    height: 222,
    backgroundColor: Colors.tint,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  festPressCard: {
    height: 176,
    backgroundColor: Colors.yellow,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  cfCard: {
    height: 212,
    backgroundColor: Colors.blue,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  cardMask: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingBottom: 12,
  },
  cardBody: {
    paddingBottom: 12,
    paddingLeft: 20,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.background,
  },
  cardHeaderText: {
    fontSize: 20,
    fontFamily: 'Lora',
    color: Colors.text,
    zIndex: 2, // Keep text above the watermark
  },
  cardSubheaderText: {
    fontSize: 17.5,
    fontFamily: 'Lora',
    color: Colors.text,
    zIndex: 2,
  },
  cardBodyText: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: Colors.text,
    zIndex: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Keep bullet aligned to the top line of text
    marginBottom: -2, // Space between bullet points
  },
  bullet: {
    fontSize: 18,
    color: Colors.text,
    marginRight: 8, // Space between bullet and text
    marginTop: 0,// Slight optical adjustment to center bullet with text
  },
  watermarkContainerEPC: {
    position: 'absolute',
    right: -49,
    bottom: -116,
    width: 220,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerAPOGEE: {
    position: 'absolute',
    right: -12,
    bottom: -38,
    width: 138,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerBOSM: {
    position: 'absolute',
    right: -18,
    bottom: -46,
    width: 138,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerOasis: {
    position: 'absolute',
    right: -13,
    bottom: -41,
    width: 138,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerCF: {
    position: 'absolute',
    right: -22,
    bottom: -124,
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'none', // Prevent dots from blocking swipes
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  activeDot: {
    backgroundColor: '#FFC165',
  },
  archiveGraphic: {
    width: 240,
    height: 101,
    position: 'absolute',
    bottom: -102,
  },
});