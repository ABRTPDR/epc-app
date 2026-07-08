import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import DropDownIcon from './icons/DropDownIcon';
import PressableRipple from './PressableRipple';

export interface DropDownOption {
  label: string;
  value: string | number;
}

interface DropDownMenuProps {
  value: string;
  options?: DropDownOption[];
  onSelect?: (option: DropDownOption) => void;
  disabled?: boolean;
  style?: ViewStyle;
  outlineColour?: string;
}

export default function DropDownPicker({ 
  value, 
  options = [], 
  onSelect, 
  disabled = false, 
  style,
  outlineColour,
}: DropDownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    if (!disabled && options.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: DropDownOption) => {
    if (onSelect) {
      onSelect(option);
    }
    setIsOpen(false);
  };

  return (
    <View style={[style, { zIndex: isOpen ? 100 : 1 }]}>
      
      {/* 1. The Standard Background Button */}
      <PressableRipple 
        style={[
          styles.dropdownPill,
          outlineColour ? { borderWidth: 2, borderColor: outlineColour } : null
        ]} 
        onPress={handlePress}
      >
        <Text style={styles.dropdownText} numberOfLines={1}>{value}</Text>
        <DropDownIcon height={16} width={16} />
      </PressableRipple>

      {/* 2. The Overlapping Dropdown Menu */}
      {isOpen && !disabled && options.length > 0 && (
        <>
          {/* Invisible Backdrop to handle taps completely outside the menu */}
          <Pressable 
            style={styles.backdrop} 
            onPress={() => setIsOpen(false)} 
          />
          
          {/* Popover placed absolutely over the exact coordinate origin of the button */}
          <View style={styles.popover}>
            {options.map((option) => (
              <PressableRipple 
                key={option.value}
                style={styles.popoverOption}
                onPress={() => handleSelect(option)}
              >
                <Text style={[
                  styles.popoverOptionText,
                  value === option.label && styles.popoverOptionActive
                ]}>
                  {option.label}
                </Text>
              </PressableRipple>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 20,
  },
  dropdownText: {
    fontFamily: 'LatoSemibold',
    fontSize: 16,
    color: Colors.text,
  },

  // A massive negative boundary that covers the screen behind the popover
  backdrop: {
    position: 'absolute',
    top: -2000,
    bottom: -2000,
    left: -2000,
    right: -2000,
    zIndex: 99, 
  },
  
  // The actual floating menu
  popover: {
    position: 'absolute',
    top: 2,  // Snaps perfectly to the top of the pill
    left: 0, // Snaps perfectly to the left of the pill
    minWidth: '100%', // Ensures it is at least as wide as the pill, but can grow
    backgroundColor: '#FFF', 
    borderRadius: 20,
    zIndex: 100,

    // Shadows to make it float
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  popoverOption: {
    paddingVertical: 18, // Matches the pill padding so the text aligns perfectly
    paddingHorizontal: 16,
  },
  popoverOptionText: {
    fontFamily: 'Lato', 
    fontSize: 16, 
    color: Colors.grey,
  },
  popoverOptionActive: { 
    fontFamily: 'LatoSemibold', 
    color: Colors.text, 
  }
});