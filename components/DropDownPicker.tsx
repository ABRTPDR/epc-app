import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, ScrollView, Modal } from 'react-native';

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
  
  // 1. References for layout and teleporting
  const buttonRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0 });

  // 2. NEW: References to track and control scroll position
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);

  const handlePress = () => {
    if (!disabled && options.length > 0) {
      if (!isOpen) {
        buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setDropdownLayout({ top: pageY - 36, left: pageX, width });
          setIsOpen(true);
        });
      } else {
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (option: DropDownOption) => {
    if (onSelect) {
      onSelect(option);
    }
    setIsOpen(false);
  };

  return (
    <>
      <View ref={buttonRef} collapsable={false} style={style}>
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
      </View>

      {isOpen && !disabled && options.length > 0 && (
        <Modal 
          transparent 
          visible={isOpen} 
          animationType="none" 
          onRequestClose={() => setIsOpen(false)} 
        >
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />
          
          <View style={[
            styles.popover, 
            { top: dropdownLayout.top, left: dropdownLayout.left, width: dropdownLayout.width }
          ]}>
            <ScrollView 
              ref={scrollViewRef} // Attach the ref so we can command it
              style={styles.popoverScroll}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true} 
              bounces={false}
              
              // --- NEW: Scroll tracking & restoring ---
              scrollEventThrottle={16} // Fires the scroll event smoothly
              onScroll={(e) => {
                // Silently save the exact Y position every time the user scrolls
                scrollOffset.current = e.nativeEvent.contentOffset.y;
              }}
              onLayout={() => {
                // The millisecond the dropdown re-renders, jump back to the saved position!
                if (scrollViewRef.current && scrollOffset.current > 0) {
                  scrollViewRef.current.scrollTo({ y: scrollOffset.current, animated: false });
                }
              }}
            >
              {options.map((option, index) => {
                const isFirst = index === 0;
                const isLast = index === options.length - 1;

                return (
                  <PressableRipple 
                    key={option.value}
                    style={[
                      styles.popoverOption,
                      isFirst && styles.firstOption, 
                      isLast && styles.lastOption,   
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <Text style={[
                      styles.popoverOptionText,
                      value === option.label && styles.popoverOptionActive
                    ]}>
                      {option.label}
                    </Text>
                  </PressableRipple>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}
    </>
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
  backdrop: {
    ...StyleSheet.absoluteFill, 
    zIndex: 1, 
  },
  popover: {
    position: 'absolute',
    backgroundColor: '#FFF', 
    borderRadius: 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  popoverScroll: {
    borderRadius: 20, 
    overflow: 'hidden', 
    maxHeight: 464,
    flexGrow: 0,
  },
  popoverOption: {
    height: 58,
    justifyContent: 'center',
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
  },
  firstOption: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  lastOption: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  }
});