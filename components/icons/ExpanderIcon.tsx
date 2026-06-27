import { ColorValue } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg'

interface SquareIconProps extends SvgProps {
  size?: number;
  color?: ColorValue; // ColorValue instead of string, accepts strings and advanced native colors, like React Native's PlatformColor or DynamicColorIOS which return OpaqueColorValue and not string
}

// Destructure custom props out, and gather the rest into "...props"
export default function DynamicSquareIcon({ 
  size = 24,           // Fallback default size
  color = '#727070', // Fallback default color
  ...props             // Gathers styles, testIDs, opacity, etc.
}: SquareIconProps) {
  
  return (
    <Svg
      width={size} 
      height={size} 
      viewBox="0 0 12 12"
      fill="none" 
      // Spread all remaining props to the root SVG element
      {...props} 
    >
      <Path d="M4.05383 0.686768C3.82327 0.460568 3.45212 0.46181 3.22375 0.692627C3.02397 0.89476 3.00062 1.20554 3.15247 1.43286L3.22864 1.52466L7.7677 6.00024L3.22864 10.4749V10.4758C2.99806 10.7039 2.99541 11.0768 3.22375 11.3079C3.33917 11.4244 3.49087 11.4816 3.64172 11.4817C3.79018 11.4817 3.9413 11.4259 4.05579 11.3127L8.5968 6.83521V6.83423C8.82186 6.61227 8.94638 6.31724 8.94641 6.00122C8.94641 5.68668 8.8236 5.38877 8.5968 5.16626L4.05481 0.687744L4.05383 0.686768Z" fill={color} stroke={color} stroke-width="0.3"/>

    </Svg>
  );
}