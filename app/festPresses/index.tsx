import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';

import {
  AEP_YEARS_ORDER, 
  BEP_YEARS_ORDER, 
  OEP_YEARS_ORDER 
} from '@/constants/Publications';
import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import SearchButton from '@/components/SearchButton';
import EPCGraphic from '@/components/icons/EPCGraphic';
import APOGEEGraphic from '@/components/icons/APOGEEGraphic';
import BOSMGraphic from '@/components/icons/BOSMGraphic';
import OasisGraphic from '@/components/icons/OasisGraphic';
import PressableRipple from '@/components/PressableRipple';

export default function FestPressesIndexScreen() {
  
  // Route to newest year of selected press, passing press type as parameter
  const handlePressNavigate = (press: 'AEP' | 'BEP' | 'OEP', latestYear: string) => {
    router.push({
      pathname: '/festPresses/[year]',
      params: { year: latestYear, press }
    });
  };

  const handleCategoryPress = () => {
    router.push('/tfp/[year]')
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} color={Colors.grey} />
        <SearchButton onPress={() => router.push({ pathname: '/search', params: { filters: 'AEP,BEP,OEP' } })} color={Colors.grey} />
        <Text style={styles.headerTitle}>FEST PRESSES</Text>
        <Text style={styles.headerDescription}>
          The days when the campus{'\n'}comes alive—of contests, clubs,{'\n'}camaraderie, and concerts—we{'\n'}celebrate, and we chronicle.
        </Text>
        <View style={styles.watermarkContainerEPC}>
          <EPCGraphic width={218} outerRingColour='#FFF2DF' accentColour='#FFC6B3' clockTowerColour={Colors.yellow} backgroundColour='#FEFBDF' />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {/* AEP Card */}
        <PressableRipple style={styles.card} onPress={() => handlePressNavigate('AEP', AEP_YEARS_ORDER[0])}>
          <View style={styles.graphicBox}>
            <APOGEEGraphic width={64} height={64} color='#FFB298' />
          </View>
          <Text style={styles.cardText}>APOGEE English Press</Text>
        </PressableRipple>

        {/* BEP Card */}
        <PressableRipple style={styles.card} onPress={() => handlePressNavigate('BEP', BEP_YEARS_ORDER[0])} >
          <View style={styles.graphicBox}>
            <BOSMGraphic style={{marginTop: 2}} width={62} height={62} color='#FFB298' />
          </View>
          <Text style={styles.cardText}>BOSM English Press</Text>
        </PressableRipple>

        {/* OEP Card */}
        <PressableRipple style={styles.card} onPress={() => handlePressNavigate('OEP', OEP_YEARS_ORDER[0])}>
          <View style={styles.graphicBox}>
            <OasisGraphic width={66} height={66} color='#FFB298' />
          </View>
          <Text style={styles.cardText}>Oasis English Press</Text>
        </PressableRipple>

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
    backgroundColor: Colors.yellow,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
  watermarkContainerEPC: {
    position: 'absolute',
    right: -40,
    bottom: -10,
    width: 218,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingRight: 16,
    borderRadius: 24,
    height: 80,
  },
  graphicBox: {
    backgroundColor: '#FEFBDF',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontFamily: 'LatoSemibold',
    fontSize: 16,
    color: Colors.text,
    marginLeft: 24,
  },
});