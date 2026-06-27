import Svg, { Rect, SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  color?: string; 
}

const NavHomeIcon = ({ color, ...props }: IconProps) => (
  <Svg
    width={props.width || 64}
    height={props.height || 64}
    viewBox="0 0 64 64"
    fill="none"
    {...props}
  >

    <Rect x="17" y="44.4795" width="26.7809" height="2.52055" rx="1" fill={color || "#727070"}/>
    <Rect x="17" y="34.2397" width="26.7809" height="2.52055" rx="1" fill={color || "#727070"}/>
    <Rect x="17" y="24" width="26.7809" height="2.52055" rx="1" fill={color || "#727070"}/>

  </Svg>
);

export default NavHomeIcon;