import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { colors } from '../theme/colors';
import MapView from './MapView';

/**
 * RouteMap Component
 * Display route with polyline and markers
 */
const RouteMap = ({ 
  sourceCoordinates,
  destinationCoordinates,
  routePolyline = null,
  style,
  showUserLocation = false
}) => {
  const cameraRef = useRef(null);

  // Calculate bounds to fit route
  useEffect(() => {
    if (cameraRef.current && sourceCoordinates && destinationCoordinates) {
      const bounds = {
        ne: [
          Math.max(sourceCoordinates.longitude, destinationCoordinates.longitude),
          Math.max(sourceCoordinates.latitude, destinationCoordinates.latitude)
        ],
        sw: [
          Math.min(sourceCoordinates.longitude, destinationCoordinates.longitude),
          Math.min(sourceCoordinates.latitude, destinationCoordinates.latitude)
        ],
        paddingTop: 100,
        paddingRight: 50,
        paddingBottom: 100,
        paddingLeft: 50
      };

      cameraRef.current.fitBounds(bounds.ne, bounds.sw, bounds.paddingTop, bounds.paddingBottom);
    }
  }, [sourceCoordinates, destinationCoordinates]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  if (!sourceCoordinates || !destinationCoordinates) {
    return null;
  }

  const centerCoordinate = [
    (sourceCoordinates.longitude + destinationCoordinates.longitude) / 2,
    (sourceCoordinates.latitude + destinationCoordinates.latitude) / 2
  ];

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={centerCoordinate}
          zoomLevel={10}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {showUserLocation && (
          <MapboxGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
          />
        )}

        {/* Route polyline */}
        {routePolyline && routePolyline.length > 0 && (
          <MapboxGL.ShapeSource
            id="routeSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routePolyline
              }
            }}
          >
            <MapboxGL.LineLayer
              id="routeLine"
              style={{
                lineColor: colors.primary,
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Source marker */}
        <MapboxGL.PointAnnotation
          id="sourceMarker"
          coordinate={[sourceCoordinates.longitude, sourceCoordinates.latitude]}
        >
          <View style={styles.sourceMarker}>
            <View style={styles.sourceMarkerInner} />
          </View>
        </MapboxGL.PointAnnotation>

        {/* Destination marker */}
        <MapboxGL.PointAnnotation
          id="destinationMarker"
          coordinate={[destinationCoordinates.longitude, destinationCoordinates.latitude]}
        >
          <View style={styles.destinationMarker}>
            <View style={styles.destinationMarkerInner} />
          </View>
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>
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
  placeholder: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary
  },
  sourceMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  sourceMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success
  },
  destinationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  destinationMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error
  }
});

export default RouteMap;
