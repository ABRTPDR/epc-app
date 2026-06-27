import { Stack } from 'expo-router';

export default function ExploreTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* You don't even need to explicitly list index and search here 
        if you just want them to inherit the false header! 
        Expo handles it automatically.
      */}
    </Stack>
  );
}