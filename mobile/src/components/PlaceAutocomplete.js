import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { tokens } from '../theme/tokens';
import { apiRequest } from '../api';

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
    if (Platform.OS !== 'web') {
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
    if (Platform.OS !== 'web') {
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
        <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.icon} />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {query.length > 0 && (
          <Pressable onPress={clearQuery} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </Pressable>
        )}

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Ionicons name="hourglass-outline" size={16} color={colors.primary} />
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
                <Ionicons name="location" size={20} color={colors.primary} />
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
    backgroundColor: colors.white,
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    ...tokens.shadows.md
  },
  inputFocused: {
    borderColor: colors.primary,
    ...tokens.shadows.lg
  },
  icon: {
    marginRight: tokens.spacing.sm
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 0
  },
  clearButton: {
    padding: tokens.spacing.xxs,
    marginLeft: tokens.spacing.xs
  },
  loadingIndicator: {
    marginLeft: tokens.spacing.xs
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: tokens.spacing.xs,
    backgroundColor: colors.white,
    borderRadius: tokens.borderRadius.lg,
    maxHeight: 250,
    ...tokens.shadows.xl,
    borderWidth: 1,
    borderColor: colors.border
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  suggestionItemPressed: {
    backgroundColor: colors.backgroundSecondary
  },
  suggestionText: {
    flex: 1,
    marginLeft: tokens.spacing.sm
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2
  },
  suggestionAddress: {
    fontSize: 14,
    color: colors.textSecondary
  }
});

export default PlaceAutocomplete;
