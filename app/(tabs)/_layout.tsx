import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

import NavBar from '@/components/NavBar';
import NavHomeIcon from '@/components/icons/NavHomeIcon';
import NavSearchIcon from '@/components/icons/NavSearchIcon';
import NavMoreIcon from '@/components/icons/NavMoreIcon';
import IconFadeAnimation from '@/components/IconFadeAnimation';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Calculate how much empty screen exists on one side of 392px nav bar island
  const extraSpace = Math.max(0, (width - 392) / 2);
  
  // Add that exact empty space to base 40px padding, forcing the 3 tabs into the center of any screen
  const dynamicPadding = 40 + extraSpace;

  return (
    <Tabs
      screenOptions={{

        // Force labels to render below the icon (else, goes to right of icon on tablet)
        tabBarLabelPosition: 'below-icon',

        // Prevent nav bar text from breaking fixed-height layout
        tabBarAllowFontScaling: false,

        // Nav bar icon+text colour scheme
        tabBarActiveTintColor: Colors.navIconActive,
        tabBarInactiveTintColor: Colors.navIconInactive,

        tabBarBackground: () => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 392, height: 70, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' }}>
              <NavBar width={392} height={44} />
            </View>
          </View>
        ),
        
        tabBarStyle: {
          position: 'absolute', // Disables default style rectangular nav bar
          bottom: insets.bottom - 10,
          left: 0,
          right: 0,
          paddingHorizontal: dynamicPadding,
          height: 70, // Working position for our nav bar
          backgroundColor: '#FFFFFF', // Hides default style rectangular nav bar
          borderTopWidth: 0, // Hides top stroke of default style rectangular nav bar
          elevation: 0, // Disables Android shadow
          shadowOpacity: 0, // Disables iOS shadow
          paddingBottom: 0, // Without this, React automatically applies insets.bottom, which becomes very large for nav buttons bar (not an issue with gesture bar). Since height fixed at 70, this large padding deducted leaves only few px for tab icon and text, text clips out
        },

        tabBarButton: (props) => <IconFadeAnimation {...props} />,
        
        tabBarIconStyle: { 
          marginTop: -15, // Icons position
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Lato',
          marginTop: 12,
        },
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          // Pass native colour variable
          tabBarIcon: ({ color }) => (
            <NavHomeIcon color={color as string} />
          ),
        }}
      />

      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: 'EXPLORE',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <NavSearchIcon color={color as string} />
          ),
        }} 
      />
      
      <Tabs.Screen
        name="more"
        options={{
          title: 'MORE',
          tabBarIcon: ({ color }) => (
            <NavMoreIcon color={color as string} />
          ),
        }}
      />

    </Tabs>
  );
}