import { useRef } from 'react';
import { Pressable, Animated } from 'react-native';

// 1. Upgrade Pressable to accept animated styles
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 2. Export the function directly as the default export
export default function IconFadeAnimation(props: any) {
  // 3. Initialize our "dimmer switch" at full opacity (1)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 4. Define the smooth fade out when a finger touches down
  const handlePressIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 0.5, // The target opacity
      duration: 100, // Very fast fade out (snappy and responsive)
      useNativeDriver: true, // Crucial for 60fps performance
    }).start();
  };

  // 5. Define the smooth fade back in when the finger lifts up
  const handlePressOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250, // Slightly slower fade back in feels more premium
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: 'transparent' }} // Keep the Android ripple hidden
      // 6. Combine React Navigation's layout styles with our animated opacity
      style={[props.style, { opacity: fadeAnim }]} 
    />
  );
}