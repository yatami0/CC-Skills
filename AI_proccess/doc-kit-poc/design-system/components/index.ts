// 役割9カテゴリ・フラット分類のバレル（content-free / container-free / stateless）。
export * from "./types";

// Layout
export { Region } from "./layout/Region";
export { Stack } from "./layout/Stack";
export { Columns } from "./layout/Columns";
export { Card } from "./layout/Card";
export { Divider } from "./layout/Divider";
export { Spacer } from "./layout/Spacer";

// Display
export { Heading } from "./display/Heading";
export { Eyebrow } from "./display/Eyebrow";
export { Text } from "./display/Text";
export { Figure } from "./display/Figure";
export { Image } from "./display/Image";
export type { ImageProps } from "./display/Image";

// DataDisplay
export { Bullets } from "./datadisplay/Bullets";
export { KeyPoints } from "./datadisplay/KeyPoints";
export { Table } from "./datadisplay/Table";
export { CompareTable } from "./datadisplay/CompareTable";
export { Tag } from "./datadisplay/Tag";

// Communication
export { Callout } from "./communication/Callout";
export { Sources } from "./communication/Sources";
export { SourceIndex } from "./communication/SourceIndex";
export { Badge } from "./communication/Badge";

// Navigation
export { Toc } from "./navigation/Toc";

// Action
export { Link } from "./action/Link";
