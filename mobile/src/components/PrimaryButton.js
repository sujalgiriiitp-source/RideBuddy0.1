import React from 'react';
import CustomButton from './CustomButton';

const PrimaryButton = ({ title, onPress, loading = false, variant = 'primary', style, icon }) => (
  <CustomButton title={title} onPress={onPress} loading={loading} variant={variant} style={style} icon={icon} />
);

export default PrimaryButton;
