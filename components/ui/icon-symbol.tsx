// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'plus.circle.fill': 'add-circle',
  'person.badge.plus.fill': 'person-add',
  'calendar': 'calendar-today',
  'clock': 'access-time',
  'location': 'place',
  'person.fill': 'person',
  'person.2.fill': 'people',
  'checkmark.circle.fill': 'check-circle',
  'lock.circle.fill': 'lock',
  'lock.open.circle.fill': 'lock-open',
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel',
  'xmark': 'close',
  'list.bullet.rectangle.fill': 'list',
  'square.and.arrow.down': 'download',
  'chart.bar.xaxis': 'bar-chart',
  'tray': 'inbox',
  'calendar.badge.clock': 'event',
  'pencil.circle.fill': 'edit',
  'minus.circle.fill': 'remove-circle',
  'info.circle.fill': 'info',
  'arrow.right.circle': 'arrow-forward',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'bell.fill': 'notifications',
  'moon.fill': 'dark-mode',
  'envelope.fill': 'email',
  'qrcode': 'qr-code',
  'checkmark': 'check',
  'clock.fill': 'schedule',
  'person.3.fill': 'groups',
  'chart.pie.fill': 'pie-chart',
  'person.fill.checkmark': 'how-to-reg',
  'exclamationmark.triangle': 'warning',
  'doc.text': 'description',
  'funnel.fill': 'filter-list',
  'camera.fill': 'camera-alt',
  'trash.fill': 'delete',
  'arrow.clockwise': 'refresh',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
