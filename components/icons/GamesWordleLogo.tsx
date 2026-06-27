import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

interface SquareIconProps extends SvgProps {
  size?: number;
}

// Destructure custom props out, and gather the rest into "...props"
export default function GamesWordleLogo({ 
  size = 64,           // Fallback default size
  ...props             // Gathers styles, testIDs, opacity, etc.
}: SquareIconProps) {
  
  return (
    <Svg
      width={size} 
      height={size} 
      viewBox="0 0 60 60"
      fill="none" 
      // Spread all remaining props to the root SVG element
      {...props} 
    >
      <Rect x="1.75" y="1.75" width="56.5" height="56.5" rx="12.25" fill="#D9D9D9" stroke="#191919" strokeWidth="3.5"/>
      <Rect x="22.5" y="23" width="14.5" height="14.5" fill="#FFE376"/>
      <Rect x="22.5" y="41" width="14.5" height="15.5" fill="#5CCBE9"/>
      <Rect x="40.5" y="23" width="16" height="14.5" fill="#5CCBE9"/>
      <Path d="M40.5 41H56.5V46C56.5 52.0751 51.5751 57 45.5 57H40.5V41Z" fill="#5CCBE9"/>
      <Path d="M19 41H3V46C3 52.0751 7.92487 57 14 57H19V41Z" fill="#5CCBE9"/>
      <Rect x="19" y="3" width="3.5" height="54" fill="#191919"/>
      <Rect x="37" y="3" width="3.5" height="54" fill="#191919"/>
      <Rect x="3" y="23" width="3.5" height="54" transform="rotate(-90 3 23)" fill="#191919"/>
      <Rect x="3" y="41" width="3.5" height="54" transform="rotate(-90 3 41)" fill="#191919"/>

    </Svg>
  );
}