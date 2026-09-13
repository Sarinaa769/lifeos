import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import api from "../../utils/api";
import { Colors, Fonts } from "../../constants/theme";

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);

  const icons = ["💬", "🍽️", "💡", "🏃", "📌", "🎯"];
  const bgColors = [Colors.tealLight, Colors.pinkLight, Colors.amberLight, Colors.purpleLight];

  async function fetchMemories() {
    try {
      const response = await api.get(`/analytics/history`);
      setMemories(response.data.slice(0, 5));
    } catch (err) {
      console.log("خطا در گرفتن خاطرات:", err);
    } finally {
      setLoadingMemories(false);
    }
  }

  useEffect(() => {
    fetchMemories();
  }, []);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert("خطا", "امکان ضبط صدا نبود");
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setIsUploading(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as any);

      await api.post(`/capture/audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("انجام شد", "خاطره ثبت شد");
      fetchMemories();
    } catch (err) {
      Alert.alert("خطا", "ارسال به سرور ناموفق بود");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.appTitle}>LifeOS</Text>

        <View style={styles.tasksCard}>
          <View style={styles.tasksBlob} />
          <Text style={styles.tasksTitle}>کارهای امروز · ۲ از ۴ انجام‌شده</Text>
          <View style={styles.taskRow}>
            <View style={[styles.checkbox, styles.checkboxDone]}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.taskText}>ارسال گزارش هفتگی</Text>
          </View>
          <View style={styles.taskRow}>
            <View style={styles.checkbox} />
            <Text style={styles.taskText}>ورزش صبحگاهی</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>خاطرات امروز</Text>
          <Text style={styles.sectionLink}>مشاهده همه</Text>
        </View>

        {loadingMemories && (
          <Text style={{ color: Colors.textLight, fontSize: 12 }}>در حال بارگذاری...</Text>
        )}

        {!loadingMemories && memories.length === 0 && (
          <Text style={{ color: Colors.textLight, fontSize: 12 }}>هنوز خاطره‌ای ثبت نشده</Text>
        )}

        {memories.map((m, i) => {
          const activity = m.extracted?.activities?.[0] || "خاطره صوتی";
          const person = m.extracted?.people?.[0];
          return (
            <View key={m.id} style={styles.memoryCard}>
              <View style={[styles.memoryIcon, { backgroundColor: bgColors[i % bgColors.length] }]}>
                <Text style={{ fontSize: 15 }}>{icons[i % icons.length]}</Text>
              </View>
              <View>
                <Text style={styles.memoryTitle}>{activity}</Text>
                <Text style={styles.memorySubtitle}>
                  {person ? `با ${person}` : new Date(m.created_at).toLocaleDateString("fa-IR")}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.micButton, recording && styles.micButtonActive]}
        onPress={recording ? stopRecording : startRecording}
        disabled={isUploading}
        activeOpacity={0.85}
      >
        <Text style={styles.micIcon}>{isUploading ? "..." : "🎙"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    padding: 18,
    paddingTop: 22,
    paddingBottom: 110,
  },
  appTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.textDark,
    marginBottom: 16,
  },
  tasksCard: {
    backgroundColor: Colors.textDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  tasksBlob: {
    position: "absolute",
    width: 80,
    height: 80,
    backgroundColor: Colors.coral,
    borderRadius: 40,
    top: -30,
    left: -30,
    opacity: 0.9,
  },
  tasksTitle: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: "#fff",
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  checkboxDone: {
    backgroundColor: Colors.teal,
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 11,
  },
  taskText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textDark,
  },
  sectionLink: {
    fontSize: 11,
    color: Colors.textLight,
  },
  memoryCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 11,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 9,
  },
  memoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryTitle: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.textDark,
    textAlign: "right",
  },
  memorySubtitle: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: "right",
    marginTop: 2,
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.coral,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.coral,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  micButtonActive: {
    backgroundColor: "#E53E3E",
  },
  micIcon: {
    fontSize: 24,
  },
});