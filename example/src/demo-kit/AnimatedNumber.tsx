import { StyleSheet, TextInput } from 'react-native';

import Animated, {
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';

import { controlStyles } from './Controls';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedNumberProps = {
  value: SharedValue<number>;
  fractionDigits?: number;
};

/**
 * Renders a shared value on the UI thread, without React re-renders
 */
export const AnimatedNumber = ({
  value,
  fractionDigits = 2,
}: AnimatedNumberProps) => {
  const animatedProps = useAnimatedProps(() => {
    const text = value.value.toFixed(fractionDigits);

    return { text, defaultValue: text } as object;
  });

  return (
    <AnimatedTextInput
      editable={false}
      pointerEvents="none"
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={styles.text}
    />
  );
};

const styles = StyleSheet.create({
  text: controlStyles.statValueText,
});
