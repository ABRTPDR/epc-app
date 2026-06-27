import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';

import BackIcon from '@/components/icons/BackIcon';
import IconFadeAnimation from '@/components/IconFadeAnimation';

// Tell TS to expect onPress function
interface BackButtonProps {
  onPress: () => void;
  // Optional position parameters for custom placement eg. search bar
  color?: string;
  shadow?: boolean;
  absolute?: boolean;
}

export default function BackButton({ onPress, color=Colors.darkwhite, shadow = false, absolute = true }: BackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

	/* Logic 2: works but requires multiple clicks on the button on screen where it's rendered. also idk if after that it goes back or goes home
  const handleBackPress = () => {
    // 1. The Stack Check: If there is history, go back smoothly. 
    // If the history got wiped by a reload, manually force them to the home screen!
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); 
    }
  };
  */

	/* Logic 1: doesn't do anything onpress except animate the fade
  return (
    <Pressable
      onPress={() => router.back()} 
      // Array syntax allows us to combine static styles with dynamic inset padding
      style={[styles.absoluteButton, { top: insets.top + 16 }]}
    >
      // By passing an arrow function here, React Native automatically feeds the sqbracket pressed: true/false sqbracket state directly into your props
      {(props) => (
        <IconFadeAnimation {...props}>
          <BackIcon color={Colors.darkwhite} />
        </IconFadeAnimation>
      )}
    </Pressable>
		*/

   /* Logic 2
   <Pressable
      onPress={handleBackPress} 
      // 2. The Hit Slop: Makes the invisible touch target 20px larger in every direction!
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      style={[styles.absoluteabsoluteButton, { top: insets.top + 16 }]}
    >
      {(props) => (
        <IconFadeAnimation {...props}>
          <BackIcon color={Colors.darkwhite} />
        </IconFadeAnimation>
      )}
    </Pressable>
  );
	*/

	// 1. Initialize the dimmer switch specifically for this button
  const fadeAnim = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress} 
      hitSlop={30} 
      pressRetentionOffset={50} 
      
      // 2. Trigger the fade out when touched
      onPressIn={() => {
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }).start();
      }}
      
      // 3. Trigger the fade back in when let go
      onPressOut={() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }}

      style={[
        absolute ? styles.absoluteButton : styles.relativeButton, 
        absolute && { top: insets.top + 24, left: 30 }
      ]}
    >
      {/* 4. Wrap the icon in an Animated.View mapped to our fadeAnim */}
      {/*
      <View pointerEvents="none">
        <Animated.View style={{ opacity: fadeAnim }}>
          <BackIcon color={Colors.darkwhite} />
        </Animated.View>
      </View>
      */}
      <View pointerEvents="none" style={styles.iconWrapper}>
        <Animated.View style={[{ opacity: fadeAnim }, styles.centerContent]}>
          
          {/* THE FIGMA LAYER: Only renders if shadow={true} */}
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

          {/* YOUR ICON: Floating exactly in the center */}
          <BackIcon color={color} />

        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  absoluteButton: {
    position: 'absolute', // Tears the button out of the normal layout flow
    zIndex: 20,          // Ensures it floats on top of images, text, and scrolls
		elevation: 20,
    
  },
  backShadow: {
    width: 64,
    height: 64,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4.65,
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
    marginLeft: -32,
  },
	/* Logic 2
  absoluteabsoluteButton: {
    position: 'absolute', 
    left: 32,             
    zIndex: 100,      // Boosted to 100 just to be safe
    elevation: 100,   // 3. CRITICAL: This forces Android to register the touch above all other elements
  },
	*/
  relativeButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    // Optional: Add a specific width/height here if the flex layout squishes the button
    //padding: 4, 
  },
});