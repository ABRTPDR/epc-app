import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import PressableRipple from '@/components/PressableRipple';

import EpcLogo from '@/components/icons/EpcLogo';
import MoreTeam from '@/components/icons/MoreTeam';
import MorePodcast from '@/components/icons/MorePodcast';
import MoreCF from '@/components/icons/MoreCF';
import MoreContactUs from '@/components/icons/MoreContactUs';
import MoreAppSettings from '@/components/icons/MoreAppSettings';
import MoreWebsite from '@/components/icons/MoreWebsite';

export default function MoreScreen() {
  const router = useRouter();

  const EPC_EMAIL = 'epc.bitsp@gmail.com';

  const openExternalLink = async (url: string) => {
  try {
    // Skip 'canOpenURL' because Android 11+ blocks it for undeclared schemes
    // Linking.openURL natively asks the OS to handle the routing
    // If the app is installed, OS opens it. If not, opens Chrome/Safari
    await Linking.openURL(url);
  }
  catch (error) {
    console.error(`Error opening URL ${url}: ${error}`);
    // Fallback: If it crashes (eg. malformed mailto link), handle here
  }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

       {/* TFP by EPC header */}
      <View style={styles.headerContainer}>
        <EpcLogo width={60} height={60} style={styles.logo} />
      
        <View style={styles.textColumn}>
          <Text style={styles.headerTitle}>THE FINE PRINT</Text>
          <Text style={styles.headerSubtitle}>ENGLISH PRESS CLUB, BITS PILANI</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1  }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Main menu cards */}
        <View style={styles.menuContainer}>
          
          {/* Internal link: The Team */}
          <PressableRipple style={styles.menuCard} onPress={() => router.push('/team')}>
            <Text style={styles.menuText}>The Team</Text>
            <View style={styles.watermarkContainerTeam}>
              <MoreTeam width={85} height={68} />
            </View>
          </PressableRipple>

          {/* Internal link: Interactive Campus Map */}
          <PressableRipple style={styles.menuCard} onPress={() => router.push('/map')}>
            <Text style={styles.menuText}>Interactive Campus Map</Text>
            <View style={styles.watermarkContainerMap}>
              <Image 
                source={require('@/assets/images/MoreMap.png')} 
                style={styles.mapPngWatermark}
                contentFit="contain"
              />
            </View>
          </PressableRipple>

          {/* External Spotify link: The EPC Podcast */}
          <PressableRipple style={[styles.menuCard, {marginBottom: 16}]} onPress={() => openExternalLink('https://open.spotify.com/show/3IQ07Nd2LWX9Qf0o40hnHS')}>
            <Text style={styles.menuText}>The EPC Podcast</Text>
            <View style={styles.watermarkContainerPodCF}>
              <MorePodcast width={68} height={68} />
            </View>
          </PressableRipple>

          {/* External Mailto link: Contribute to CF */}
          <PressableRipple style={styles.menuCard} onPress={() => openExternalLink(`mailto:${EPC_EMAIL}?subject=Contribution to Cactus Flower`)}>
            <Text style={styles.menuText}>Contribute to Cactus Flower</Text>
            <View style={styles.watermarkContainerPodCF}>
              <MoreCF width={68} height={68} />
            </View>
          </PressableRipple>

          {/* External Mailto link: Give Us Feedback */}
          <PressableRipple style={[styles.menuCard, {marginBottom: 16}]} onPress={() => openExternalLink(`mailto:${EPC_EMAIL}?subject=EPC App Feedback`)}>
            <Text style={styles.menuText}>Give Us Feedback</Text>
            <View style={styles.watermarkContainerContactUs}>
              <MoreContactUs width={42} height={60} />
            </View>
          </PressableRipple>

          {/* Internal link: App Settings */}
          <PressableRipple style={styles.menuCard} onPress={() => router.push('/settings')}>
            <Text style={styles.menuText}>App Settings</Text>
            <View style={styles.watermarkContainerAppSettings}>
              <MoreAppSettings width={84} height={84} />
            </View>
          </PressableRipple>

        </View>

        {/* Social links row */}
        <View style={styles.socialRow}>
          
          {/* Instagram */}
          <PressableRipple 
            style={styles.socialCardLeft} 
            onPress={() => openExternalLink('https://instagram.com/epc.bits')}
          >
            <Image 
                source={require('@/assets/images/InstagramIcon.png')} 
                style={styles.socialIcon}
                contentFit="contain"
              />
            <Text style={styles.socialText}>@epc.bits</Text>
          </PressableRipple>

          {/* X/Twitter */}
          <PressableRipple 
            style={styles.socialCardMiddle} 
            onPress={() => openExternalLink('https://x.com/epc_bitspilani')}
          >
            <Image 
                source={require('@/assets/images/TwitterXIcon.png')} 
                style={styles.socialIcon}
                contentFit="contain"
              />
            <Text style={styles.socialText}>@epc_bitspilani</Text>
          </PressableRipple>

          {/* EPC website */}
          <PressableRipple 
            style={styles.socialCardRight} 
            onPress={() => openExternalLink('https://epcbits.com')}
          >
            <MoreWebsite height={24} width={24} />
            <Text style={styles.socialText}>epcbits.com</Text>
          </PressableRipple>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 14,
    marginTop: 5,
  },
  textColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Lora',
    fontWeight: 400,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14.4,
    fontFamily: 'Lato',
    color: Colors.text,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  
  // Main menu card styles
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuCard: {
    height: 64,
    backgroundColor: Colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden', // Clip SVG graphic
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'LatoSemibold',
    color: Colors.text,
    zIndex: 2, // Keep text above graphic
  },
  watermarkContainerTeam: {
    position: 'absolute',
    right: -19, // Push SVG graphic off right edge
    bottom: -14,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerMap: {
    position: 'absolute',
    right: -13,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerPodCF: {
    position: 'absolute',
    right: -14,
    top: -9,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerContactUs: {
    position: 'absolute',
    right: -7,
    bottom: -2,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkContainerAppSettings: {
    position: 'absolute',
    right: -27,
    top: -32,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mapPngWatermark: {
    width: 50,
    height: 60,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },

  // Social links row styles
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  socialCardLeft: {
    flex: 1,
    height: 80,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2,
  },
  socialCardMiddle: {
    flex: 1,
    height: 80,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2,
  },
  socialCardRight: {
    flex: 1,
    height: 80,
    backgroundColor: Colors.card,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2
  },
  socialText: {
    fontSize: 11,
    fontFamily: 'Lato',
    color: Colors.text,
    paddingTop: 4,
  },
});
