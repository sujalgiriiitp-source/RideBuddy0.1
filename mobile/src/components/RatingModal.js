import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton';
import colors from '../theme/colors';
import tokens from '../theme/tokens';

const RatingModal = ({
  visible,
  title = 'Rate your ride',
  subtitle,
  submitting = false,
  onSubmit,
  onSkip,
  onClose
}) => {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');

  const canSubmit = useMemo(() => stars >= 1 && !submitting, [stars, submitting]);

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit?.({
      stars,
      review: review.trim()
    });
  };

  const handleSkip = () => {
    setStars(0);
    setReview('');
    onSkip?.();
  };

  const handleClose = () => {
    setStars(0);
    setReview('');
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setStars(value)} style={styles.starButton}>
                <Ionicons
                  name={value <= stars ? 'star' : 'star-outline'}
                  size={30}
                  color={value <= stars ? '#F59E0B' : '#94A3B8'}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.reviewInput}
            placeholder="Write an optional review"
            placeholderTextColor="#9AA4B2"
            multiline
            numberOfLines={4}
            value={review}
            onChangeText={setReview}
            maxLength={500}
          />

          <CustomButton
            title="Submit Rating"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
            icon="checkmark-circle-outline"
          />
          <CustomButton
            title="Skip"
            onPress={handleSkip}
            variant="secondary"
            icon="play-skip-forward-outline"
            style={styles.skipButton}
            disabled={submitting}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#DFE7F5',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 14,
    color: colors.mutedText,
    lineHeight: 20
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  starButton: {
    padding: 4
  },
  reviewInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#D9E3F8',
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
    color: colors.text,
    marginBottom: 12
  },
  skipButton: {
    marginTop: 8
  }
});

export default RatingModal;
