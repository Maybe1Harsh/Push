import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    // Hide the splash screen after 2 seconds
    const timer = setTimeout(() => {
      onFinish(); // Notify the parent component that the splash is done
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [onFinish]);

  return (
    <View style={styles.splashContainer}>
      <Image source={require('../assets/images/splash_try.jpg')} style={styles.splashImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Optional: Set a background color
  },
  splashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Adjust the image to cover the entire screen
  },
});
