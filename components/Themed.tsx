/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import { Text as DefaultText, View as DefaultView } from 'react-native';
import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  // Uses custom manual overrides if provided via props, otherwise defaults to flat Colors
  if (props.light) {
    return props.light;
  } else {
    return Colors[colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}