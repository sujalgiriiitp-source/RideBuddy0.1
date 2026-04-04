import React, { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { colors } from '../theme/colors';

// Set Mapbox access token
MapboxGL.setAccessToken('pk.your-mapbox-access-token-here'); // Replace with your token

/**
 * MapView Component
 * Wrapper for Mapbox map with common functionality
 */
const MapView = ({ 
  children, 
  style,
  centerCoordinate = [-122.4194, 37.7749], // Default: San Francisco
  zoomLevel = 12,
  onRegionDidChange,
  onPress,
  showUserLocation = true,
  followUserLocation = false,
  ...props 
}) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const cameraRef = useRef(null);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.webPlaceholder}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        onDidFinishLoadingMap={() => setIsMapLoaded(true)}
        onRegionDidChange={onRegionDidChange}
        onPress={onPress}
        {...props}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {showUserLocation && (
          <MapboxGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            animated={true}
          />
        )}

        {children}
      </MapboxGL.MapView>

      {!isMapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center'
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary
  }
});

export default MapView;
