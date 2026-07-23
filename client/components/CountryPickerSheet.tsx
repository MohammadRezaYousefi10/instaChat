// client/components/CountryPickerSheet.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, 
    TouchableOpacity, StyleSheet, Keyboard, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppBottomSheet from "./AppBottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { COUNTRIES, Country, isoToFlagEmoji } from "@/constants/countries";
import { BottomSheetFlatList, BottomSheetScrollView, BottomSheetSectionList, TouchableWithoutFeedback } from "@gorhom/bottom-sheet";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
}

export default function CountryPickerSheet({ visible, onClose, onSelect }: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [modalSize , setModalSize] = useState("75%") 

  const filtered = useMemo(() => {
    //console.log('keyboard : ' , Keyboard.dismiss())
    // Keyboard.dismiss()
    if (!query.trim()) {
        Keyboard.dismiss()
        return COUNTRIES;
    } 
        
    const q = query.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q)
    );
  }, [query]);


  const renderItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Text style={styles.flag}>{isoToFlagEmoji(item.code)}</Text>
      <Text style={[styles.name, { color: colors.onSurface }]}>{item.name}</Text>
      <Text style={[styles.dialCode, { color: colors.outlineVariant }]}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    //style={{ flex: 1 }}
    <AppBottomSheet  visible={visible} onClose={onClose} snapPoints={["75%" , "95%" ]}> 
  <Pressable
  
    onPress={Keyboard.dismiss}>  
    <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Select Country</Text>

          <View style={[styles.searchBox, { backgroundColor: colors.surfaceLowest }]}>
            <Ionicons name="search" size={16} color={colors.outlineVariant} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder="Search country or code..."
              placeholderTextColor={colors.outlineVariant}
              value={query}
              onChangeText={setQuery}
              keyboardAppearance={colors.surface === '#121314' ? 'dark' : 'light'}
            />
          </View>
                 

        </View>
      </Pressable>


      <BottomSheetFlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        /> 



      
     </AppBottomSheet> 
    
 
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
  flag: { fontSize: 24 },
  name: { flex: 1, fontSize: 15 },
  dialCode: { fontSize: 14 },
});