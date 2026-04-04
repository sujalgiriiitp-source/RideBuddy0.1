# Premium Animated Components Library

Modern, production-ready animated components for RideBuddy mobile app. Built with React Native, Expo, and high-performance animations.

## 🎨 Components Overview

### 1. AnimatedGradientCard
Elevated card with gradient background, lift animation, and optional glow effect.

**Props:**
- `gradient` - Gradient preset or custom array (default: 'primary')
- `elevation` - Shadow depth: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `padding` - Internal spacing: 'sm' | 'md' | 'lg' | 'xl' (default: 'lg')
- `animateOnPress` - Enable press animation (default: true)
- `glowOnPress` - Add glow effect on press (default: false)
- `onPress` - Callback function

**Usage:**
```jsx
import { AnimatedGradientCard } from '../components';

<AnimatedGradientCard 
  gradient="ocean" 
  elevation="lg"
  glowOnPress
  onPress={() => console.log('Card pressed')}
>
  <Text>Your content here</Text>
</AnimatedGradientCard>
```

---

### 2. PressableScale
Universal pressable with scale animation and haptic feedback.

**Props:**
- `scale` - Scale factor on press (default: 0.95)
- `haptics` - Enable haptic feedback (default: true)
- `onPress` - Press callback
- `onLongPress` - Long press callback

**Usage:**
```jsx
import { PressableScale } from '../components';

<PressableScale onPress={handlePress} scale={0.93} haptics>
  <View>Your button content</View>
</PressableScale>
```

---

### 3. ShimmerLoader
Skeleton loader with smooth shimmer animation. Includes pre-built variants.

**Props:**
- `width` - Width (default: '100%')
- `height` - Height (default: 100)
- `borderRadius` - Corner radius (default: tokens.radius.lg)

**Pre-built Variants:**
- `<RideCardSkeleton />` - For ride cards
- `<ListItemSkeleton count={5} />` - For list items

**Usage:**
```jsx
import { ShimmerLoader, RideCardSkeleton } from '../components';

// Custom skeleton
<ShimmerLoader width="80%" height={20} borderRadius={8} />

// Pre-built
<RideCardSkeleton />
<ListItemSkeleton count={3} />
```

---

### 4. SwipeableCard
Card with left/right swipe gestures for quick actions.

**Props:**
- `onSwipeLeft` - Left swipe callback
- `onSwipeRight` - Right swipe callback
- `leftActionColor` - Left indicator color (default: colors.danger)
- `rightActionColor` - Right indicator color (default: colors.success)
- `leftActionIcon` - Ionicon name for left (default: 'close-circle')
- `rightActionIcon` - Ionicon name for right (default: 'checkmark-circle')

**Usage:**
```jsx
import { SwipeableCard, AnimatedGradientCard } from '../components';

<SwipeableCard
  onSwipeRight={() => acceptRide()}
  onSwipeLeft={() => rejectRide()}
  rightActionIcon="checkmark-circle"
  leftActionIcon="close-circle"
>
  <AnimatedGradientCard>
    <Text>Swipe me!</Text>
  </AnimatedGradientCard>
</SwipeableCard>
```

---

### 5. AnimatedEmptyState
Elegant empty state with floating icon animation.

**Props:**
- `icon` - Ionicon name (default: 'alert-circle-outline')
- `title` - Heading text
- `message` - Description text
- `actionText` - CTA button text (optional)
- `onActionPress` - Button callback (optional)
- `iconColor` - Icon color (default: colors.primary)

**Usage:**
```jsx
import { AnimatedEmptyState } from '../components';

<AnimatedEmptyState
  icon="car-outline"
  title="No Rides Available"
  message="Create a ride to get started."
  actionText="Create Ride"
  onActionPress={() => navigation.navigate('CreateRide')}
/>
```

---

### 6. PullToRefresh
Custom pull-to-refresh with smooth animation.

**Props:**
- `onRefresh` - Async refresh callback
- `refreshing` - External loading state (optional)

**Usage:**
```jsx
import { PullToRefresh } from '../components';

<ScrollView>
  <PullToRefresh onRefresh={handleRefresh}>
    {/* Your content */}
  </PullToRefresh>
</ScrollView>
```

---

### 7. StaggeredList
Cascade entrance animation for list items.

**Props:**
- `staggerDelay` - Delay between items in ms (default: 100)

**Usage:**
```jsx
import { StaggeredList } from '../components';

<StaggeredList staggerDelay={120}>
  {rides.map(ride => (
    <RideCard key={ride.id} ride={ride} />
  ))}
</StaggeredList>
```

---

### 8. ProgressBar
Animated progress indicator with smooth transitions.

**Props:**
- `progress` - Progress value 0-100 (default: 0)
- `height` - Bar height (default: 6)
- `backgroundColor` - Track color (default: colors.gray200)
- `progressColor` - Fill color (default: colors.primary)
- `animated` - Enable animation (default: true)

**Usage:**
```jsx
import { ProgressBar } from '../components';

<ProgressBar 
  progress={75} 
  height={8}
  progressColor={colors.success}
/>
```

---

### 9. SuccessAnimation
Animated checkmark with confetti burst effect.

**Props:**
- `visible` - Show animation (default: true)
- `size` - Icon size (default: 80)
- `onAnimationComplete` - Callback when complete

**Usage:**
```jsx
import { SuccessAnimation } from '../components';

<SuccessAnimation 
  visible={showSuccess}
  size={100}
  onAnimationComplete={() => navigation.goBack()}
/>
```

---

### 10. AnimatedBadge
Status badge with smooth styling.

**Props:**
- `variant` - Style preset: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
- `size` - Size: 'sm' | 'md' | 'lg' (default: 'md')
- `outlined` - Outlined style (default: false)

**Usage:**
```jsx
import { AnimatedBadge } from '../components';

<AnimatedBadge variant="success" size="sm">
  Active
</AnimatedBadge>

<AnimatedBadge variant="danger" outlined>
  Cancelled
</AnimatedBadge>
```

---

### 11. ParallaxHeader
Scrolling header with parallax effect.

**Props:**
- `scrollY` - Animated scroll value from ScrollView
- `headerHeight` - Initial height (default: 200)
- `minHeight` - Collapsed height (default: 80)
- `gradient` - Gradient colors array

**Usage:**
```jsx
import { ParallaxHeader } from '../components';
import { Animated } from 'react-native';

const scrollY = useRef(new Animated.Value(0)).current;

<Animated.ScrollView
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  )}
  scrollEventThrottle={16}
>
  <ParallaxHeader scrollY={scrollY} headerHeight={250}>
    <Text style={styles.headerTitle}>RideBuddy</Text>
  </ParallaxHeader>
  {/* Rest of content */}
</Animated.ScrollView>
```

---

### 12. FloatingActionButton (FAB)
Animated floating action button with gradient.

**Props:**
- `icon` - React element (usually Ionicons)
- `onPress` - Press callback
- `bottom` - Bottom position (default: 20)
- `right` - Right position (default: 20)

**Usage:**
```jsx
import { FloatingActionButton } from '../components';
import { Ionicons } from '@expo/vector-icons';

<FloatingActionButton
  icon={<Ionicons name="add" size={24} color="white" />}
  onPress={() => navigation.navigate('CreateRide')}
  bottom={30}
  right={30}
/>
```

---

## 🎯 Animation Presets

Available in `tokens.js`:

### Spring Configs
- `gentle` - { friction: 8, tension: 40 }
- `default` - { friction: 8, tension: 100 }
- `snappy` - { friction: 6, tension: 120 }
- `bouncy` - { friction: 4, tension: 100 }

### Durations
- `instant` - 100ms
- `fast` - 150ms
- `base` - 200ms
- `slow` - 300ms
- `gentle` - 600ms

---

## 🌈 Gradient Presets

New gradients in `tokens.js`:

**Ride Cards:**
- `sunset` - Orange to Red
- `ocean` - Cyan to Blue
- `forest` - Green
- `twilight` - Indigo to Purple
- `rose` - Pink
- `amber` - Yellow to Orange

**Status:**
- `pending` - Gray
- `active` - Green
- `completed` - Cyan

---

## ✨ Best Practices

1. **Performance:**
   - All animations use `useNativeDriver` where possible
   - Haptics disabled on web platform automatically
   - Animations are optimized for 60fps

2. **Accessibility:**
   - Components support reduced motion preferences
   - Proper touch target sizes (minimum 44x44)
   - Semantic color usage

3. **Gesture Handling:**
   - Swipe threshold: 25% of screen width
   - Pull-to-refresh trigger: 60px
   - Haptic feedback for interactive elements

4. **Usage Tips:**
   - Combine components (e.g., SwipeableCard + AnimatedGradientCard)
   - Use StaggeredList for list entrance animations
   - Leverage PressableScale for any tappable element
   - Add ShimmerLoader while data loads for better UX

---

## 📦 Installation

Haptics support requires:
```bash
npx expo install expo-haptics
```

Already included in package.json!

---

## 🚀 Next Steps

1. Apply these components to existing screens (ui-003)
2. Add gesture navigation (ui-005)
3. Test animations on physical devices
4. Gather user feedback for refinements

---

Built with ❤️ for RideBuddy
