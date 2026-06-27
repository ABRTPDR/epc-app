import Svg, { Path, SvgProps } from 'react-native-svg';
import Colors from '@/constants/Colors';

const NavBar = (props : SvgProps) => (
  <Svg
    width={props.width || 373}
    height={props.height || 44}
    viewBox="0 0 373 44"
    fill="none"
    {...props}
  >
    <Path d="M15.4823 5.31188C17.711 1.99182 21.447 0 25.4457 0H348.262C352.473 0 356.375 2.20682 358.546 5.81504L370.575 25.815C375.385 33.8131 369.625 44 360.291 44H12.0203C2.41863 44 -3.29451 33.2839 2.0569 25.3119L15.4823 5.31188Z" fill={Colors.navBar}/>
  </Svg>
)
export default NavBar