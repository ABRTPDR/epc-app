import { Tabs } from 'expo-router';
import { View } from 'react-native';

import Colors from '@/constants/Colors';

import NavBar from '@/components/NavBar';
import NavHomeIcon from '@/components/icons/NavHomeIcon';
import NavSearchIcon from '@/components/icons/NavSearchIcon';
import NavMoreIcon from '@/components/icons/NavMoreIcon';
import IconFadeAnimation from '@/components/IconFadeAnimation';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{

        // Nav bar icon+text colour scheme
        tabBarActiveTintColor: Colors.navIconActive,
        tabBarInactiveTintColor: Colors.navIconInactive,

        tabBarBackground: () => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <NavBar width={392} height={44} />
          </View>
        ),
        
        tabBarStyle: {
          position: 'absolute', // Disables default style rectangular nav bar
          bottom: 15,
          left: 24,
          right: 24,
          height: 70, // Working position for our nav bar
          backgroundColor: 'transparent', // Hides default style rectangular nav bar
          borderTopWidth: 0, // Hides top stroke of default style rectangular nav bar
          elevation: 0, // Disables Android shadow
          shadowOpacity: 0, // Disables iOS shadow
          paddingHorizontal: 40, // Nav bar item spacing
        },

        tabBarButton: (props) => <IconFadeAnimation {...props} />,
        /*
        tabBarButton: (props) => (
          <Pressable 
            {...props as any} 
            android_ripple={{ color: 'transparent' }} 
            style={({ pressed }) => [
              props.style, 
              { opacity: pressed ? 0.7 : 1 } 
            ]}
          />
        ),
        */
        
        tabBarIconStyle: { 
          marginTop: -15, // Ions position
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Lato',
          position: 'absolute',
          bottom: 4,
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