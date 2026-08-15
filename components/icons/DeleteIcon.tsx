import Svg, { Path, SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  color?: string; 
}

const DeleteIcon = ({ color, ...props }: IconProps) => (
  <Svg
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >

    <Path fillRule="evenodd" clipRule="evenodd" d="M6.25105 6.25105C6.58579 5.91632 7.1285 5.91632 7.46324 6.25105L12 10.7878L16.5368 6.25105C16.8715 5.91632 17.4142 5.91632 17.749 6.25105C18.0837 6.58579 18.0837 7.1285 17.749 7.46324L13.2122 12L17.749 16.5368C18.0837 16.8715 18.0837 17.4142 17.749 17.749C17.4142 18.0837 16.8715 18.0837 16.5368 17.749L12 13.2122L7.46324 17.749C7.1285 18.0837 6.58579 18.0837 6.25105 17.749C5.91632 17.4142 5.91632 16.8715 6.25105 16.5368L10.7878 12L6.25105 7.46324C5.91632 7.1285 5.91632 6.58579 6.25105 6.25105Z" fill={color || "#727070"}/>
  </Svg>
);

export default DeleteIcon;