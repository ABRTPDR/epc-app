import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/Colors';
import PressableRipple from '@/components/PressableRipple';
import StylisedSearch from '@/components/icons/StylisedSearch';

const BulletPoint = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.cardBodyText, { paddingTop: 1, paddingRight: 100 }]}>{children}</Text>
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
  const insets = useSafeAreaInsets();

  return (
    // style={[styles.container, { paddingTop: insets.top }]}
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <StatusBar style="dark" />

      <View style={[styles.searchBarMask, { marginBottom: 16 }]}>
        <PressableRipple style={styles.searchBar} onPress={() => router.push('/explore/search')}>
          <StylisedSearch width={53} height={55} style={styles.stylisedSearch} />
          <Text style={styles.searchInactiveText}>Search for an article...</Text>
        </PressableRipple>
      </View>

      <View style={styles.cardMask}>
        <PressableRipple style={styles.tfpCard} onPress={() => router.push('/tfp')}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardHeaderText, { paddingLeft: 20, paddingTop: 12 }]}>THE FINE PRINT</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardBodyText, { paddingTop: 12, paddingRight: 140 }]}>The campus newsletter. New issues every other month.</Text>
          </View>
        </PressableRipple>
      </View>

      <View style={styles.cardMask}>
        <PressableRipple style={styles.festPressCard} onPress={() => router.push('/festPresses')}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardHeaderText, { paddingLeft: 20, paddingTop: 12 }]}>FEST PRESSES</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardSubheaderText, { paddingTop: 8, paddingRight: 128 }]}>APOGEE ENGLISH PRESS</Text>
            <BulletList 
              items={[
                'Pre-fest interviews — club coords and the CoStAA.', 
                'Digital archives of our fest issues.'
              ]} 
            />
          </View>
        </PressableRipple>
      </View>

      <View style={styles.cardMask}>
        <PressableRipple style={styles.cfCard} onPress={() => router.push('/cf')}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardHeaderText, { paddingLeft: 20, paddingTop: 12 }]}>CACTUS FLOWER</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <Text style={[styles.cardBodyText, { paddingTop: 12 }]}>Campus literary magazine; for writers, poets, artists. Currently archived, CF returns soon.</Text>
          </View>
        </PressableRipple>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    gap: 16,
    // alignItems: 'center',
    // justifyContent: 'center',
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
    backgroundColor: Colors.lightgrey, // The light grey/off-white background
    borderRadius: 25,
    paddingHorizontal: 24,
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
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  menuContainer: {
    gap: 16, // Spaces the menu cards perfectly
    marginBottom: 24,
  },
  tfpCard: {
    height: 222,
    backgroundColor: Colors.tint,
    borderRadius: 24,
    justifyContent: 'flex-start',
    overflow: 'hidden', // Crucial: clips the watermark SVG so it doesn't bleed out
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
    marginHorizontal: 24,
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
    zIndex: 2, // Keeps text above the watermark
  },
  cardSubheaderText: {
    fontSize: 17.5,
    fontFamily: 'Lora',
    color: Colors.text,
    zIndex: 2, // Keeps text above the watermark
  },
  cardBodyText: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: Colors.text,
    zIndex: 2, // Keeps text above the watermark
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Keeps the bullet aligned to the top line of text
    marginBottom: -2,          // Space between bullet points
  },
  bullet: {
    fontSize: 18,
    color: Colors.text,
    marginRight: 10,          // Space between the bullet and the text
    marginTop: 0,            // Slight optical adjustment to center bullet with text
  },
  watermarkContainerTeam: {
    position: 'absolute',
    right: -19, // Pushes the SVG slightly off the right edge
    bottom: -14,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

/*
          <View style={styles.cardBody}>
            <Text style={[styles.cardSubheaderText, { paddingTop: 12, paddingRight: 128 }]}>BOSM ENGLISH PRESS</Text>
            <BulletList 
              items={[
                'Pre-fest interviews — team captains and the CoSSAc.', 
                'Digital archives of our fest issues.'
              ]} 
            />
          </View>
*/

/*
          <View style={styles.cardBody}>
            <Text style={[styles.cardSubheaderText, { paddingTop: 12, paddingRight: 128 }]}>OASIS ENGLISH PRESS</Text>
            <BulletList 
              items={[
                'Pre-fest interviews — club coords and the StuCCA.', 
                'Digital archives of our fest issues.'
              ]} 
            />
          </View>
*/