import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';

import { TFP_CATALOG, TFP_YEARS_ORDER } from '@/constants/Publications';
import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import SearchButton from '@/components/SearchButton';
import EPCGraphic from '@/components/icons/EPCGraphic';
import PressableRipple from '@/components/PressableRipple';

export default function TfpScreen() {
  return (
    <View style={styles.container}>     
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
          <BackButton onPress={() => router.back()} color={Colors.grey} />
          <SearchButton onPress={() => router.push({ pathname: '/search', params: { filters: 'TFP' } })} color={Colors.grey} />
          <Text style={styles.headerTitle}>THE FINE PRINT</Text>
          <Text style={styles.headerDescription}>
            The campus newsletter by the EPC. New issues every other{'\n'}month. Get up to speed on the{'\n'}BITSian experience!
          </Text>
          <View style={styles.watermarkContainerEPC}>
            <EPCGraphic width={218} />
          </View>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.listContainer}>
          {TFP_YEARS_ORDER.map((yearKey) => {
            const yearData = TFP_CATALOG[yearKey];
            
            return (
              <PressableRipple 
                key={yearKey}
                style={styles.card}
                onPress={() => router.push({ pathname: '/tfp/[year]', params: { year: yearKey } })}
              >
                <Text style={styles.cardText}>TFP {yearKey}</Text>
                
                {/* Conditionally render the Special Issue badge */}
                {yearData.hasSpecialIssue && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {yearData.specialIssueName.toUpperCase()}
                    </Text>
                  </View>
                )}
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
    backgroundColor: Colors.tint,
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
    paddingRight: 160,
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
  scrollContent: {
    paddingBottom: 40,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  cardText: {
    fontFamily: 'Lato',
    fontSize: 18,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.green,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  badgeText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: Colors.text,
    includeFontPadding: false,
    lineHeight: 14,
  }
});