import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, ScrollView, Modal, Animated } from 'react-native';

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
  
  // References for layout and teleporting
  const buttonRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState({ top: 0, left: 0, width: 0 });

  // References to track and control scroll position
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffset = useRef(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Custom scrollbar math (not relying on default Android scrollbar as colour varies with light/dark mode)
  const ITEM_HEIGHT = 58;
  const MAX_ITEMS = 8;
  const contentHeight = options.length * ITEM_HEIGHT;
  const visibleHeight = Math.min(contentHeight, ITEM_HEIGHT * MAX_ITEMS);
  const hasScrollbar = options.length > MAX_ITEMS;
  
  // Track is slightly smaller than the container to allow for rounded padding
  const trackHeight = visibleHeight - 12; 
  const indicatorHeight = Math.max((visibleHeight / contentHeight) * trackHeight, 30);
  const scrollRange = contentHeight - visibleHeight;
  const indicatorScrollRange = trackHeight - indicatorHeight;

  // Maps the invisible list scroll to the visible scrollbar thumb translation
  const indicatorTranslateY = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [0, indicatorScrollRange],
    extrapolate: 'clamp',
  });

  const handlePress = () => {
    if (!disabled && options.length > 0) {
      if (!isOpen) {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
          // 'top: y' anchors the dropdown list to the top edge of the initiating button
          setDropdownLayout({ top: y+2, left: x, width });
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
            <Animated.ScrollView 
              ref={scrollViewRef}
              style={styles.popoverScroll}
              showsVerticalScrollIndicator={false} // Hide the native scrollbar
              bounces={false}
              scrollEventThrottle={16}
              
              // Animated.event seamlessly drives the custom scrollbar 
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                {
                  useNativeDriver: true, // Hardware acceleration for buttery smoothness
                  listener: (e: any) => {
                    scrollOffset.current = e.nativeEvent.contentOffset.y;
                  }
                }
              )}
              onLayout={() => {
                if (scrollViewRef.current && scrollOffset.current > 0) {
                  // Safe cast for RN version compatibility (some require .getNode())
                  const scrollNode = (scrollViewRef.current as any).scrollTo 
                    ? scrollViewRef.current 
                    : (scrollViewRef.current as any).getNode();
                    
                  scrollNode?.scrollTo({ y: scrollOffset.current, animated: false });
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
            </Animated.ScrollView>

            {/* Custom animated scrollbar overlay */}
            {hasScrollbar && (
              <View style={[styles.scrollbarTrack, { height: trackHeight }]}>
                <Animated.View style={[
                  styles.scrollbarThumb,
                  { height: indicatorHeight, transform: [{ translateY: indicatorTranslateY }] }
                ]} />
              </View>
            )}
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
    paddingRight: 24, // Prevents text from colliding with the custom scrollbar
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
  },
  scrollbarTrack: {
    position: 'absolute',
    right: 6, // Snug against the right edge
    top: 6,
    width: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scrollbarThumb: {
    width: '100%',
    backgroundColor: Colors.lightGrey,
    borderRadius: 2,
  }
});