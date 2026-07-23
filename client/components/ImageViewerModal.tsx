import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { Colors } from "@/constants/Colors";
// for SDK 56
// import * as FileSystem from "expo-file-system";
// for SDK 54
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "./Toast";
import { getStyles } from "@/assets/styles/ImageViewerMoadl.styles";



interface Props {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onDelete: () => void;
}

export default function ImageViewerModal({
  visible,
  imageUri,
  onClose,
  onDelete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [checkMark, setCheckMark] = useState(false);
  const { setStatusBarOverride  , colors} = useTheme();
  const styles = getStyles(colors)


  useEffect(() => {
    if (visible) {
      setStatusBarOverride({ style: "light" });
    } else {
      setStatusBarOverride(null); // برگردون به حالت پیش‌فرض تم
    }
    // موقع unmount هم پاک کن تا گیر نکنه
    return () => setStatusBarOverride(null);
  }, [visible]);

  const handleDelete = () => {
    Alert.alert("Remove profile picture", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onDelete },
    ]);
  };

  const handleSaveToGallery = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Access is required",
          "To save the photo, grant access to the gallery.",
        );
        return;
      }

      let localUri = imageUri;
      if (imageUri.startsWith("http")) {
        const fileUri = FileSystem.cacheDirectory + "avatar_save.jpg";
        const { uri } = await FileSystem.downloadAsync(imageUri, fileUri);
        localUri = uri;
      }

      await MediaLibrary.saveToLibraryAsync(localUri);
      setLoading(false);
      setCheckMark(true)
       // Hide checkmark after 2 seconds
        setTimeout(() => {
          setCheckMark(false);
        }, 2000);
      // toast.show("Image Saved", { icon: "checkmark-circle" });
      // Alert.alert("Saved", "The photo saved to your gallery.");
    } catch (err) {
      console.error("save error:", err);
      // setCheckMark(false)
      setLoading(false);
      Alert.alert("Error", "An error occurred while saving the photo.");
    } 
  };

  if (!imageUri) return null;

  

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <ImageView
        images={[{ uri: imageUri }]}
        imageIndex={0}
        visible={visible}
        
        onRequestClose={onClose}
        HeaderComponent={() => (
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleSaveToGallery}
            >
              {loading ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : checkMark ? (
                 <View style={styles.footer}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" /> 
               <Text style={styles.actionText}  >Image Saved</Text>
                 </View> 
              ) : ( 
                <Ionicons name="download-outline" size={24} color="#fff" />
              )}

            </TouchableOpacity>
          </View>
        )}
        FooterComponent={() => (
          <View style={styles.footer}>

            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Ionicons
                style={styles.iconBtn}
                name="trash-outline"
                size={24}
                color={Colors.error ?? "#EF4444"}
              />
            </TouchableOpacity>
          </View>
        )}
      />
  
    </Modal>
  </>
  );
}

 