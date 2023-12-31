import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"

const SvgComponent = (props: SvgProps) => (
  <Svg
    style={{
      width: 24,
      height: 24,
    }}
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill="currentColor"
      d="M21 7H3c-1.1 0-2 .9-2 2v8h1a2 2 0 1 0 4 0h12a2 2 0 1 0 4 0h1V9a2 2 0 0 0-2-2M7 12H3V9h4v3m8 0H9V9h6v3m6 0h-4V9h4v3Z"
    />
  </Svg>
)

export default SvgComponent
