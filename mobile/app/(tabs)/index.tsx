import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
import axios from "axios";

const API_URL = "http://10.0.0.102:8000";

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

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

      const response = await axios.post(`${API_URL}/capture/audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      Alert.alert("خطا", "ارسال به سرور ناموفق بود");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LifeOS</Text>

      <TouchableOpacity
        style={[styles.button, recording ? styles.buttonRecording : null]}
        onPress={recording ? stopRecording : startRecording}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>
          {isUploading ? "در حال پردازش..." : recording ? "توقف ضبط" : "شروع ضبط"}
        </Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>متن تشخیص داده‌شده:</Text>
          <Text style={styles.resultText}>{result.transcript}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#333",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  buttonRecording: {
    backgroundColor: "#c0392b",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  result: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: "100%",
  },
  resultLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  resultText: {
    textAlign: "right",
  },
});
