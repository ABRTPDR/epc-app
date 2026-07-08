import { Stack } from 'expo-router';

export default function ExploreTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* No need to explicitly list index and search here as we just want them to inherit the false header (nav bar?), Expo handles automatically */}
    </Stack>
  );
}