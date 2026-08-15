import Svg, { Path, SvgProps } from 'react-native-svg'

interface IconProps extends SvgProps {
  color?: string; 
}

export default ({ color, ...props }: IconProps) => (
  <Svg
    width={props.width || 138}
    height={props.width || 138}
    viewBox="0 0 138 138"
    fill="none"
    {...props}
  >
    <Path d="M25.577 142.162C-7.32649 110.677 -8.47679 58.4807 23.0077 25.5772V25.5772C54.4921 -7.32625 106.689 -8.4766 139.592 23.0079L214.665 94.8429L100.65 213.997L25.577 142.162Z" fill={color || "#EDF7FF"}/>
  </Svg>
);