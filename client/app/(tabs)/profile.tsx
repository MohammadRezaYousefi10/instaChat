import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { TextInput } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { api, useApp } from "@/context/AppContext";

import { Animated } from "react-native";
import ImageViewerModal from "@/components/ImageViewerModal";
import ForwardModal from "@/components/ForwardModal";
import HelpSupportModal from "@/components/HelpSupportModal";
import ShareProfileButton from "@/components/ShareProfileButton";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/ProfileScreen.styles";
import { useRouter } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { toast } from "@/components/Toast";



export default function profile() {
  const { auth, logout, updateUser } = useApp();

  const user = auth.user;

  const router = useRouter();

  const { colors } = useTheme();
  const styles = getStyles(colors);

 

  const [editMode, setEditMode] = useState(false);
  const [profileName, setProfileName] = useState(auth.user?.name || "");
  const [profileHandle, setProfileHandle] = useState(auth.user?.handle || "");
  const [profileBio, setProfileBio] = useState(auth.user?.bio || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAvatar, setSavedAvatar] = useState<string | null>(
    user?.avatar || null,
  );

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [displayAvatarUri, setDisplayAvatarUri] = useState<string|null>(null);


  // ---- افکت اسکرول-برای-بزرگ‌شدن آواتار ----
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const avatarScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.9, 1],
    extrapolate: "clamp",
  });

  const handleDeleteAvatar = async () => {
    // console.log('delete profile image')
    try {
      const { data } = await api.delete("/api/users/avatar");
      if (data.success) {
        setSavedAvatar(null);
        setAvatarUri(null);
        await updateUser(data.user);
        setShowImageViewer(false);
        toast.show("Image Removed", { icon: "checkmark-circle" });
      }
    } catch (err: any) {
      // toast.show("Failed to delete the photo.", { icon: "close" });
      Alert.alert("Error", err?.response?.data?.message || "Failed to delete the photo.");
    }
  };

  const displayAvatar = avatarUri || savedAvatar || user?.avatar;

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow access to your photos to change avatar.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profileName);
      formData.append("handle", profileHandle);
      formData.append("bio", profileBio);
      if (avatarUri) {
        formData.append("avatar", {
          uri: avatarUri,
          type: "image/jpeg",
          name: "avatar.jpg",
        } as any);
      }

      const { data } = await api.put("/api/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        // await updateUser(data.user)
        await updateUser({
          ...data.user,
          avatar: avatarUri || data.user.avatar,
        });

        if (data.user.avatar) {
          setSavedAvatar(data.user.avatar);
          // Alert.alert("Success", "Profile updated!");
          toast.show("Profile updated!", { icon: "checkmark-circle" });
          setEditMode(false);
          setAvatarUri(null);
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to updated profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sing Out", "Are you sure you want to sing out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "Sing Out", style: "destructive", onPress: logout },
    ]);
  };

   const handleCopy = async () => {
    const username = `@${profileHandle}`


    await Clipboard.setStringAsync(username);
    //setCopied(true);
    /* Toast.show({
    type: 'info',
    position:"bottom",
    text1: 'Copied!',
  }); */
    toast.show("Copied!", { icon: "checkmark-circle" });
    // Hide the message after 2 seconds
    // setTimeout(() => setCopied(false), 2000);
    // Alert.alert('Copied!', 'username copied to clipboard.');
  };

  /* const getUser = async () => {
    try {
      const {data} = await api.get("/api/users/profile");
      setProfileName(data.user.name)
      setProfileHandle(data.user.handle)
      setProfileBio(data.user.bio)
      if (data.user.avatar) {
        setSavedAvatar(data.user.avatar)
        setAvatarUri(null)
      }
    } catch (err:any) {
      console.log(err.message)
    }
  }

  useEffect( () => {
    getUser()
  } , []) */

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event: any) => {
              const y = event.nativeEvent.contentOffset.y;

              if (y < -120 && !showImageViewer && displayAvatar) {
                setShowImageViewer(true);
              }
            },
          },
        )}
        scrollEventThrottle={16}
        bounces
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* header */}
          <View style={styles.header}>
           {/*  {!editMode && <Text style={styles.title}>Profile</Text>} */}
            {!editMode && <Text style={styles.title}>{profileName}</Text>}

            {!editMode && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditMode(true)}
              >
                <Ionicons name="pencil" size={16} color={colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={() => {
                if (editMode) {
                  pickAvatar();
                } else if (displayAvatar) {
                  setShowImageViewer(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.avatarWrapper,
                  { transform: [{ scale: avatarScale }] },
                ]}
              >
                <Avatar
                  name={user?.name || "?"}
                  src={displayAvatar}
                  size={100}
                />
                {editMode && (
                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera" size={22} color="#fff" />
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* <TouchableOpacity
            onPress={editMode ? pickAvatar : undefined}
            activeOpacity={editMode ? 0.7 : 1}
          >
            <View style={styles.avatarWrapper}>
              <Avatar name={user?.name || "?"} src={displayAvatar} size={100} />
              {editMode && (

                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={22} color="#fff" />
                    
                </View>


              )}
            </View>
          </TouchableOpacity> */}

            <TouchableOpacity
              onPress={editMode ? pickAvatar : undefined}
              activeOpacity={editMode ? 0.7 : 1}
            >
              {editMode && (
                <View style={styles.userInfo}>
                  <Text style={styles.userHandle}>Set New Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {!editMode && (
              <View style={styles.userInfo}>
                {/* <Text style={styles.userName}>{profileName}</Text> */}
                <TouchableOpacity onPress={handleCopy}>

                <Text style={styles.userHandle}>@{profileHandle}</Text>
                </TouchableOpacity>
                {/* <Text style={styles.userEmail}>{user?.email}</Text> */}
                {user?.bio && <Text style={styles.userBio}>{profileBio}</Text>}
               
               
              </View>
              
            )}
            
             {copied && <Text style={styles.feedback}>Message copied!</Text>}
             {!editMode && (
             <View style={styles.handleRowBtn}>
                <TouchableOpacity style={styles.btn} onPress={() => setShowForward(true)}>
                      <Text style={styles.text}>Send Profile Image</Text>
                      <Ionicons name="arrow-redo-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>

                <ShareProfileButton
                  id={user?._id ?? ""}
                  name={profileName}
                  handle={profileHandle}
                />
                 </View>
                 )}
          </View>
          {/* Edit form */}
          {editMode && (
            <View style={styles.form}>
              {/* name */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NAME</Text>
                <TextInput
                  style={styles.input}
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Your name"
                  placeholderTextColor={colors.outlineVariant}
                  autoCapitalize="words"
                  keyboardAppearance={colors.surface === '#121314' ? 'dark' : 'light'}
                />
              </View>
              {/* handle */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>HANDLE</Text>
                <View style={styles.handleRow}>
                  <Text style={styles.atSign}>@</Text>
                  <TextInput
                    style={[styles.input, styles.handleInput]}
                    value={profileHandle}
                    onChangeText={(v) =>
                      setProfileHandle(v.toLowerCase().replace(/\s/g, ""))
                    }
                    placeholder="username"
                    placeholderTextColor={colors.outlineVariant}
                    autoCapitalize="none"
                    keyboardAppearance={colors.surface === '#121314' ? 'dark' : 'light'}
                  />
                </View>
              </View>
              {/* bio */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>BIO</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={profileBio}
                  onChangeText={setProfileBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={colors.outlineVariant}
                  autoCapitalize="words"
                  multiline
                  numberOfLines={3}
                  keyboardAppearance={colors.surface === '#121314' ? 'dark' : 'light'}
                />
              </View>
              {/* save button */}
              <TouchableOpacity
                onPress={saveProfile}
                disabled={loading}
                style={styles.saveWrapper}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtn}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              {/* cancel button */}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditMode(false);
                  setAvatarUri(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Profile options */}
          {!editMode && (
            <View style={styles.optionsSection}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => router.push("/settings")}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </View>
                <Text style={styles.optionText}>Settings</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.outlineVariant}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => router.push('/notification')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </View>
                <Text style={styles.optionText}>Notifications</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.outlineVariant}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => router.push('/privacy')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </View>
                <Text style={styles.optionText}>Privacy & Security</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.outlineVariant}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setShowHelp(true)}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </View>
                <Text style={styles.optionText}>Help & Suppurt</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.outlineVariant}
                />
              </TouchableOpacity>
            </View>
          )}
          {/* Sing out */}
          {!editMode && (
            <View style={styles.signOutSection}>
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={colors.error}
                />
                <Text style={styles.signOutText}>Sing Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.ScrollView>

      <ImageViewerModal
        visible={showImageViewer}
        imageUri={savedAvatar}
        onClose={() => setShowImageViewer(false)}
        onDelete={handleDeleteAvatar}
        
      />
        


      <ForwardModal
        visible={showForward}
        imageUri={displayAvatar ?? null}
        onClose={() => setShowForward(false)}
      /> 


      {/* <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} /> */}
      {/* <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      /> */}
      {/* <PrivacyModal
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      /> */}
      <HelpSupportModal visible={showHelp} onClose={() => setShowHelp(false)} />
        <Toast />
    </SafeAreaView>
  );
}
