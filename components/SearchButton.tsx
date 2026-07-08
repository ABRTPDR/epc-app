import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef } from 'react';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';

import SearchIcon from './icons/SearchIcon';

// Tell TS to expect onPress function
interface SearchIconProps {
  onPress: () => void;
  // Optional position parameters for custom placement eg. search bar
  color?: string;
  shadow?: boolean;
  absolute?: boolean;
}

export default function SearchButton({ onPress, color=Colors.darkwhite, shadow = false, absolute = true }: SearchIconProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

	// Initialize the dimmer switch specifically for this button
  const fadeAnim = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress} 
      hitSlop={30} 
      pressRetentionOffset={50} 
      
      // Trigger the fade out when touched
      onPressIn={() => {
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }}
      
      // Trigger the fade back in when let go
      onPressOut={() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }}

      style={[
        absolute ? styles.absoluteButton : styles.relativeButton, 
        absolute && { top: insets.top + 24, right: 24 }
      ]}
    >

      <View pointerEvents="none" style={styles.iconWrapper}>
        <Animated.View style={[{ opacity: fadeAnim }, styles.centerContent]}>
          
          {/* Only renders if shadow={true} */}
          {shadow && (
            <Svg height="64" width="64" viewBox="0 0 64 64" style={styles.radialBackground}>
              <Defs>
                <RadialGradient id="blurGrad" cx="50%" cy="50%" r="50%">
                  {/* Starts at 18% opacity at the center, matching your Figma spec */}
                  <Stop offset="50%" stopColor="#000000" stopOpacity="0.24" />
                  {/* Smoothly fades to 0% at the outer edge to mimic a layer blur */}
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx="32" cy="32" r="32" fill="url(#blurGrad)" />
            </Svg>
          )}

          <SearchIcon color={color} />

        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  absoluteButton: {
    position: 'absolute',
    zIndex: 20,
		elevation: 20,
    
  },
  iconWrapper: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialBackground: {
    position: 'absolute',
    // Anchors the SVG exactly to the edges of the 64x64 bounding box
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginRight: -32,
  },
  relativeButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});