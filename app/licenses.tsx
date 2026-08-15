import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import licenses from '@/assets/licenses.json';

interface LicenseEntry {
  licenses?: string;
  repository?: string;
  publisher?: string;
  email?: string;
  url?: string;
  path?: string;
  licenseFile?: string;
}

export default function LicensesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Stack.Screen options={{ headerShown: false }} />

      <BackButton onPress={() => router.back()} color={Colors.grey} />

			<View style={[styles.header, { height: insets.top + 80, paddingTop: insets.top }]}>
				<Text style={styles.headerTitle}>OSS Licenses</Text>
			</View>

      <FlatList
        data={Object.keys(licenses)}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => {
          // Cast object to the interface
          const pkg = licenses[item as keyof typeof licenses] as LicenseEntry; 
          
          return (
            <View style={{ gap: 2, marginBottom: 14 }}>
              <Text style={styles.text}>{item}</Text>
              <Text style={styles.text}>{pkg.publisher} ({pkg.licenses})</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Lora',
    color: Colors.text,
  },
  scrollContent: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'LatoSemibold',
    color: Colors.text,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: Colors.text,
    textAlign: 'center',
  },
});