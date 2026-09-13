import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../utils/api";
import { saveToken } from "../utils/auth";
import { Colors, Fonts } from "../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert("خطا", "ایمیل و رمز عبور را وارد کن");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister ? { email, password, name } : { email, password };

      const response = await api.post(endpoint, payload);
      await saveToken(response.data.access_token);
      router.replace("/(tabs)");
    } catch (err: any) {
      const message = err.response?.data?.detail || "خطایی رخ داد";
      Alert.alert("خطا", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LifeOS</Text>
      <Text style={styles.subtitle}>
        {isRegister ? "ساخت حساب جدید" : "ورود به حساب"}
      </Text>

      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="نام"
          value={name}
          onChangeText={setName}
          textAlign="right"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="ایمیل"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textAlign="right"
      />

      <TextInput
        style={styles.input}
        placeholder="رمز عبور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textAlign="right"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "..." : isRegister ? "ثبت‌نام" : "ورود"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.switchText}>
          {isRegister ? "قبلاً حساب داری؟ وارد شو" : "حساب نداری؟ ثبت‌نام کن"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.coral,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
  },
  switchText: {
    textAlign: "center",
    color: Colors.purple,
    fontSize: 12,
    marginTop: 16,
  },
});