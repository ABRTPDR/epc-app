import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

interface SquareIconProps extends SvgProps {
  size?: number;
}

// Destructure custom props out, and gather the rest into "...props"
export default function GamesConnectionsLogo({ 
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
      <Rect x="1.75" y="1.75" width="56.5" height="56.5" rx="12.25" fill="white" stroke="#191919" strokeWidth="3.5"/>
      <Path d="M40.5 41H56.5V46C56.5 52.0751 51.5751 57 45.5 57H40.5V41Z" fill="#FF9797"/>
      <Rect x="19" y="20" width="3.5" height="20" fill="#191919"/>
      <Rect x="37" y="3" width="3.5" height="19" fill="#191919"/>
      <Rect x="37" y="40" width="3.5" height="19" fill="#191919"/>
      <Rect x="3" y="23" width="3.5" height="54" transform="rotate(-90 3 23)" fill="#191919"/>
      <Rect x="3" y="41" width="3.5" height="54" transform="rotate(-90 3 41)" fill="#191919"/>
      <Path d="M40.5 19.5H56.5V14C56.5 8.20101 51.799 3.5 46 3.5H40.5V19.5Z" fill="#FFE376"/>
      <Rect x="3.5" y="23" width="15.5" height="14.5" fill="#F2B46E"/>

    </Svg>
  );
}