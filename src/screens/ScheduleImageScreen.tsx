import React, { useRef, useState } from "react";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import {
  PanGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
  State,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
  type PinchGestureHandlerGestureEvent,
  type PinchGestureHandlerStateChangeEvent,
  type TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { colors } from "../attendeeTheme";

// react-native ScrollView's minimumZoomScale/maximumZoomScale only works on
// iOS, so pinch-to-zoom silently did nothing on Android. This screen builds
// zoom + pan by hand with react-native-gesture-handler + the core Animated
// API (no reanimated needed) so it behaves the same on both platforms.
//
// The transform lives on a plain Animated.View wrapping the image rather
// than on the image itself - gesture handlers need a direct child that
// forwards a real native view handle, which expo-image's Image doesn't do.

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ScheduleImageScreen() {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const [layout, setLayout] = useState({ width: winWidth, height: winHeight });
  const route = useRoute<any>();
  const imageUrl = route.params.imageUrl as string;

  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const doubleTapRef = useRef(null);

  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);

  const baseTranslateX = useRef(new Animated.Value(0)).current;
  const baseTranslateY = useRef(new Animated.Value(0)).current;
  const panTranslateX = useRef(new Animated.Value(0)).current;
  const panTranslateY = useRef(new Animated.Value(0)).current;
  const translateX = Animated.add(baseTranslateX, panTranslateX);
  const translateY = Animated.add(baseTranslateY, panTranslateY);

  // Plain refs mirror the committed (post-gesture) values so gesture math
  // doesn't have to read back from Animated.Value, which is async.
  const currentScale = useRef(1);
  const currentTranslate = useRef({ x: 0, y: 0 });

  const clampTranslateToScale = (targetScale: number) => {
    const maxX = (Math.max(targetScale, 1) - 1) * layout.width / 2;
    const maxY = (Math.max(targetScale, 1) - 1) * layout.height / 2;
    currentTranslate.current = {
      x: clamp(currentTranslate.current.x, -maxX, maxX),
      y: clamp(currentTranslate.current.y, -maxY, maxY),
    };
    baseTranslateX.setValue(currentTranslate.current.x);
    baseTranslateY.setValue(currentTranslate.current.y);
  };

  const onPinchGestureEvent = Animated.event<PinchGestureHandlerGestureEvent>(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      currentScale.current = clamp(
        currentScale.current * event.nativeEvent.scale,
        MIN_SCALE,
        MAX_SCALE
      );
      baseScale.setValue(currentScale.current);
      pinchScale.setValue(1);
      clampTranslateToScale(currentScale.current);
    }
  };

  const onPanGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: panTranslateX, translationY: panTranslateY } }],
    { useNativeDriver: true }
  );

  const onPanStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      currentTranslate.current = {
        x: currentTranslate.current.x + event.nativeEvent.translationX,
        y: currentTranslate.current.y + event.nativeEvent.translationY,
      };
      panTranslateX.setValue(0);
      panTranslateY.setValue(0);
      clampTranslateToScale(currentScale.current);
    }
  };

  const onDoubleTap = (event: TapGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const resetting = currentScale.current > MIN_SCALE;
      currentScale.current = resetting ? MIN_SCALE : 2;
      currentTranslate.current = { x: 0, y: 0 };
      Animated.parallel([
        Animated.spring(baseScale, { toValue: currentScale.current, useNativeDriver: true }),
        Animated.spring(baseTranslateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(baseTranslateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <TapGestureHandler ref={doubleTapRef} numberOfTaps={2} onHandlerStateChange={onDoubleTap}>
      <Animated.View
        style={styles.container}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
      >
        <PanGestureHandler
          ref={panRef}
          simultaneousHandlers={pinchRef}
          waitFor={doubleTapRef}
          minPointers={1}
          maxPointers={2}
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanStateChange}
        >
          <Animated.View style={styles.container}>
            <PinchGestureHandler
              ref={pinchRef}
              simultaneousHandlers={panRef}
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchStateChange}
            >
              <Animated.View
                style={{
                  width: layout.width,
                  height: layout.height,
                  transform: [{ translateX }, { translateY }, { scale }],
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: layout.width, height: layout.height }}
                  contentFit="contain"
                />
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, overflow: "hidden" },
});
