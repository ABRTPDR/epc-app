import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle, StyleSheet, View } from 'react-native';

interface AppPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function PressableRipple({ style, children, ...props }: AppPressableProps) {
  const flatStyle = StyleSheet.flatten(style) || {};

  // 1. Extract ONLY external positioning properties for the outer mask
  const {
    margin, marginTop, marginBottom, marginLeft, marginRight, marginVertical, marginHorizontal,
    position, top, bottom, left, right,
    alignSelf,
    ...innerStyle // KEEP flex, padding, backgrounds, and justifyContent for the inside!
  } = flatStyle;

  // 2. The mask pulls the margins/positions, mirrors dimensions, and clips the overflow
  const maskStyle: ViewStyle = {
    margin, marginTop, marginBottom, marginLeft, marginRight, marginVertical, marginHorizontal,
    position, top, bottom, left, right,
    alignSelf,
    // Mirror sizing to ensure the mask perfectly wraps the inner button
    flex: flatStyle.flex, 
    flexGrow: flatStyle.flexGrow,
    flexShrink: flatStyle.flexShrink,
    width: flatStyle.width,
    height: flatStyle.height,
    borderRadius: flatStyle.borderRadius,
    borderTopLeftRadius: flatStyle.borderTopLeftRadius,
    borderTopRightRadius: flatStyle.borderTopRightRadius,
    borderBottomLeftRadius: flatStyle.borderBottomLeftRadius,
    borderBottomRightRadius: flatStyle.borderBottomRightRadius,
    overflow: 'hidden',
  };

  return (
    <View style={maskStyle}>
      <Pressable
        {...props}
        // By keeping innerStyle, we retain flex: 1 and justifyContent: 'space-between'
        // flexGrow: 1 ensures it completely fills the mask if the mask expands
        style={[innerStyle, { flexGrow: 1 }]} 
        android_ripple={{
          color: 'rgba(0, 0, 0, 0.05)',
          borderless: false,
          foreground: true,
        }}
      >
        {children}
      </Pressable>
    </View>
  );
}

/*
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface AppPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function PressableRipple({ style, children, ...props }: AppPressableProps) {
  return (
    <Pressable
      {...props}
      style={[style, { overflow: 'hidden' }]} // Instead of just style={style}, to restrict ripple for rounded corners
      android_ripple={{
        color: 'rgba(0, 0, 0, 0.05)',
        borderless: false, // Prevents ripple from going past borders
        foreground: true, // Instead of ripple on only button background, applies on its children as well
      }}
    >
      {children}
    </Pressable>
  );
}
*/