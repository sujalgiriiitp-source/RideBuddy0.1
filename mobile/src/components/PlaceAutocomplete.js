import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../theme/colors';
import tokens from '../theme/tokens';
import { apiRequest } from '../api';

const palette = colors || {};
const spacing = tokens?.spacing || { xxs: 2, xs: 4, sm: 8, md: 16 };
const borderRadius = tokens?.borderRadius || tokens?.radius || { lg: 16 };
const shadows = tokens?.shadows || {};

/**
 * PlaceAutocomplete Component
 * Search for places with Mapbox geocoding
 */
const PlaceAutocomplete = ({ 
  placeholder = 'Search location...',
  onSelectPlace,
  initialValue = '',
  proximity = null, // { longitude, latitude } for proximity bias
  style
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const searchPlaces = async (searchQuery) => {
    try {
      setIsLoading(true);

      // Call backend geocoding endpoint
      const params = new URLSearchParams({
        query: searchQuery,
        limit: '5'
      });

      if (proximity) {
        params.append('longitude', proximity.longitude);
        params.append('latitude', proximity.latitude);
      }

      const response = await apiRequest(`/mapbox/geocode?${params}`, {
        method: 'GET'
      });

      setSuggestions(response.places || []);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = (place) => {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setQuery(place.name);
    setSuggestions([]);
    setIsFocused(false);

    if (onSelectPlace) {
      onSelectPlace({
        name: place.name,
        shortName: place.shortName,
        coordinates: place.coordinates
      });
    }
  };

  const clearQuery = () => {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setQuery('');
    setSuggestions([]);
    if (onSelectPlace) {
      onSelectPlace(null);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <Ionicons name="search" size={20} color={palette.textTertiary || '#64748B'} style={styles.icon} />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={palette.textTertiary || '#64748B'}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {query.length > 0 && (
          <Pressable onPress={clearQuery} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={palette.textTertiary || '#64748B'} />
          </Pressable>
        )}

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Ionicons name="hourglass-outline" size={16} color={palette.primary || '#2563EB'} />
          </View>
        )}
      </View>

      {suggestions.length > 0 && isFocused && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.suggestionItem,
                  pressed && styles.suggestionItemPressed
                ]}
                onPress={() => handleSelectPlace(item)}
              >
                <Ionicons name="location" size={20} color={palette.primary || '#2563EB'} />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {item.shortName}
                  </Text>
                  <Text style={styles.suggestionAddress} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              </Pressable>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white || '#FFFFFF',
    borderRadius: borderRadius.lg || 16,
    paddingHorizontal: spacing.md || 16,
    paddingVertical: spacing.sm || 8,
    borderWidth: 2,
    borderColor: palette.border || '#E2E8F0',
    ...(shadows.md || {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8
    })
  },
  inputFocused: {
    borderColor: palette.primary || '#2563EB',
    ...(shadows.lg || {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12
    })
  },
  icon: {
    marginRight: spacing.sm || 8
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: palette.textPrimary || palette.text || '#0F172A',
    paddingVertical: 0
  },
  clearButton: {
    padding: spacing.xxs || 2,
    marginLeft: spacing.xs || 4
  },
  loadingIndicator: {
    marginLeft: spacing.xs || 4
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.xs || 4,
    backgroundColor: palette.white || '#FFFFFF',
    borderRadius: borderRadius.lg || 16,
    maxHeight: 250,
    ...(shadows.xl || {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 16
    }),
    borderWidth: 1,
    borderColor: palette.border || '#E2E8F0'
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md || 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border || '#E2E8F0'
  },
  suggestionItemPressed: {
    backgroundColor: palette.backgroundSecondary || palette.backgroundAlt || '#F8FAFF'
  },
  suggestionText: {
    flex: 1,
    marginLeft: spacing.sm || 8
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary || palette.text || '#0F172A',
    marginBottom: 2
  },
  suggestionAddress: {
    fontSize: 14,
    color: palette.textSecondary || '#475569'
  }
});

export default PlaceAutocomplete;
