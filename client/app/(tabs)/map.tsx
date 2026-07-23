import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
// import { Colors } from "@/constants/Colors";
import Avatar from "@/components/Avatar";
import { api, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/Map.styles";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

interface NearbyUser {
  _id: string;
  name: string;
  handle: string;
  avatar?: string;
  location: { coordinates: [number, number] };
}

export default function MapScreen() {

  const { colors } = useTheme();
  const styles = getStyles(colors);

  const router = useRouter();
  const { getToken } = useAuth();
  const { auth , updateUser } = useApp();
  
  const user = auth?.user;

  const [region, setRegion] = useState<Region | null>(null);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isVisibleOnMap, setIsVisibleOnMap] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;





  // ---- ۱. پرمیشن + لوکیشن اولیه ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (mounted) {
          setPermissionDenied(true);
          setLoading(false);
        }
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!mounted) return;

      const { latitude, longitude } = loc.coords;
      setMyLocation({ latitude, longitude });
      setRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // ---- ۲. گرفتن کاربران نزدیک ----
  const fetchNearbyUsers = useCallback(async (lat: number, lng: number) => {
    try {
      /* const token = await getTokenRef.current();

      const res = await fetch(
        `${API_URL}/api/map/nearby?latitude=${lat}&longitude=${lng}&maxDistanceKm=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      
      const data = await res.json();
      if (data.success) setNearbyUsers(data.users); */
      const res = await api.get("/api/map/nearby", {
          params: {
            latitude: lat,
            longitude: lng,
            maxDistanceKm: 20,
          },
        });

        const data = res.data;

        if (data.success) {
          setNearbyUsers(data.users);
        }
    } catch (err) {
      console.error("fetchNearbyUsers error:", err);
    }
  }, []);

  // رفرنسی که همیشه آخرین نسخه رو نگه می‌داره، برای استفاده داخل ws.onmessage
  // نوع رفرنس رو صریح "تابع بدون آرگومان" تعریف می‌کنیم تا با تابع async دو-آرگومانه بالا تداخل نداشته باشه
  const fetchNearbyUsersRef = useRef<() => void>(() => {});
  useEffect(() => {
    fetchNearbyUsersRef.current = () => {
      if (myLocation) 
        fetchNearbyUsers(myLocation.latitude, myLocation.longitude);

    };
  }, [myLocation, fetchNearbyUsers]);

  // ---- ۳. اتصال WebSocket (فقط یک بار) ----
  useEffect(() => {
    let ws: WebSocket;
    let closed = false;

    (async () => {
      const token = await getTokenRef.current();
      if (!token || !WS_URL || closed) return;

      ws = new WebSocket(`${WS_URL}/ws?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "map_update") {
            if (data.isVisibleOnMap === false) {
              setNearbyUsers((prev) => prev.filter((u) => u._id !== data.userId));
            } else if (data.location) {
              setNearbyUsers((prev) =>
                prev.map((u) =>
                  u._id === data.userId
                    ? { ...u, location: { coordinates: [data.location.longitude, data.location.latitude] } }
                    : u
                )
              );
            } else if (data.isVisibleOnMap === true) {
              fetchNearbyUsersRef.current();
            }
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onerror = (err) => console.error("WS error:", err);
    })();

    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, []);

  // ---- ۴. toggle یا لوکیشن (فقط مقادیر primitive) عوض شد ----
  useEffect(() => {
    if (isVisibleOnMap && myLocation) {

      fetchNearbyUsers(myLocation.latitude, myLocation.longitude);
    } else {
      setNearbyUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisibleOnMap, myLocation?.latitude, myLocation?.longitude]);

  // ---- ۵. واچ کردن لوکیشن وقتی روی نقشه ویزیبل هستیم ----
  useEffect(() => {
    if (!isVisibleOnMap) {
      watchSubRef.current?.remove();
      watchSubRef.current = null;
      return;
    }

    let cancelled = false;
    (async () => {
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 8000, distanceInterval: 15 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setMyLocation({ latitude, longitude });
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "location", latitude, longitude }));
          }
        }
      );
      if (cancelled) sub.remove();
      else watchSubRef.current = sub;
    })();

    return () => {
      cancelled = true;
      watchSubRef.current?.remove();
      watchSubRef.current = null;
    };
  }, [isVisibleOnMap]);

  const handleToggle = async (value: boolean) => {
    setIsVisibleOnMap(value);
    try {
      /* const token = await getTokenRef.current();
      console.log(api) */

      await api.patch("/api/map/visibility", {
        isVisibleOnMap: value,
      });
/* 
      await fetch(`${api}/api/map/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isVisibleOnMap: value }),
      }); */
      
      wsRef.current?.send(JSON.stringify({ type: "map_visibility", isVisibleOnMap: value }));
    } catch (err) {
      setIsVisibleOnMap(!value);
      Alert.alert("Error", "The status change encountered a problem.");
    }
  };



  const handleUserPress = (u: NearbyUser) => {
    router.push(`/user/${u._id}` as any);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="location-outline" size={40} color={colors.outlineVariant} />
        <Text style={styles.permissionText}>برای استفاده از نقشه، دسترسی به لوکیشن لازم است.</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Location.requestForegroundPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>اجازه دسترسی</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region ?? undefined}
          showsUserLocation={false} // دایره‌ی پیش‌فرض رو خاموش می‌کنیم چون مارکر سفارشی خودمون رو داریم
          showsMyLocationButton
        >
          {/* مارکر خودم با عکس و اسم */}
          {myLocation && (
            
            <Marker 
              coordinate={myLocation}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={10}
              >
              <View style={styles.myMarkerWrapper}>
                <Avatar name={user?.name || "Me"} src={user?.avatar || undefined} size={44}
                 online={isVisibleOnMap} />
                {/* <Text style={styles.markerLabel} >
                  {profileName}
                </Text> */}
                <Text style={[styles.markerLabel , {color:colors.primary}]} >
                  @{user?.handle}
                </Text>
                  
              </View>
              
            </Marker>
          )}

          {/* مارکر کاربران نزدیک با عکس و اسم */}
          {nearbyUsers.map((u) => (
            <Marker
              key={u._id}
              coordinate={{
                latitude: u.location.coordinates[1],
                longitude: u.location.coordinates[0],
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => handleUserPress(u)}
              tracksViewChanges={false}
            >
              <View style={styles.markerWrapper}>
                <Avatar name={u.name} src={u.avatar} size={40} online />
                <Text style={styles.markerLabel} numberOfLines={1}>
                  {u.name}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>{isVisibleOnMap ? "روی نقشه دیده می‌شوید" : "مخفی"}</Text>
          <Switch value={isVisibleOnMap} onValueChange={handleToggle} />
        </View>

        {isVisibleOnMap && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{nearbyUsers.length} نفر نزدیک شما</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

