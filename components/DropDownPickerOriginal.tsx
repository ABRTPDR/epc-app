import { useState } from 'react';
import { View, Text, StyleSheet, Modal, ViewStyle } from 'react-native';

import Colors from '@/constants/Colors';
import DropDownIcon from './icons/DropDownIcon';
import PressableRipple from './PressableRipple';

export interface DropDownOption {
  label: string;
  value: string | number;
}

interface DropDownMenuProps {
  value: string; // The current text displayed on the button
  options?: DropDownOption[]; // The list of options
  onSelect?: (option: DropDownOption) => void;
  disabled?: boolean;
  style?: ViewStyle; // Allows passing flex or margins from the parent
  modalTitle?: string;
}

export default function DropDownPicker({ 
  value, 
  options = [], 
  onSelect, 
  disabled = false, 
  style, 
  modalTitle = "Select Option" 
}: DropDownMenuProps) {
  const [isModalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (!disabled && options.length > 0) {
      setModalVisible(true);
    }
  };

  const handleSelect = (option: DropDownOption) => {
    if (onSelect) {
      onSelect(option);
    }
    setModalVisible(false);
  };

  return (
    <>
      <PressableRipple 
        style={[styles.dropdownPill, style]} 
        onPress={handlePress}
      >
        <Text style={styles.dropdownText}>{value}</Text>
        <DropDownIcon height={16} width={16} />
      </PressableRipple>

      {!disabled && options.length > 0 && (
        <Modal visible={isModalVisible} transparent animationType="fade">
          <PressableRipple style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>{modalTitle}</Text>
              {options.map((option) => (
                <PressableRipple 
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    value === option.label && styles.modalOptionActive
                  ]}>
                    {option.label}
                  </Text>
                </PressableRipple>
              ))}
            </View>
          </PressableRipple>
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
    paddingVertical: 24,
    borderRadius: 20,
  },
  dropdownText: { fontFamily: 'Lato', fontSize: 16, color: Colors.text },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 40,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: { fontFamily: 'LatoBold', fontSize: 18, marginBottom: 16, textAlign: 'center' },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalOptionText: { fontFamily: 'Lato', fontSize: 16, textAlign: 'center', color: Colors.grey },
  modalOptionActive: { fontFamily: 'LatoSemibold', color: Colors.text }
});