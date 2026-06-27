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
      style={[style, { overflow: 'hidden' }]} // instead of just style={style}, to restrict ripple for rounded corners
      android_ripple={{
        color: 'rgba(0, 0, 0, 0.05)',
        borderless: false, // prevents ripple from going past borders
      }}
    >
      {children}
    </Pressable>
  );
}