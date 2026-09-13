import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import api from "../../utils/api";
import { Colors, Fonts } from "../../constants/theme";

export default function HealthScreen() {
  const [tab, setTab] = useState<"medication" | "exercise">("medication");
  const [medications, setMedications] = useState<any[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [medRes, exRes] = await Promise.all([
        api.get(`/tracking/items/medication`),
        api.get(`/tracking/exercise`),
      ]);
      setMedications(medRes.data);
      setExerciseLogs(exRes.data);
    } catch (err) {
      console.log("خطا در گرفتن داده سلامت:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>سلامت</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "medication" && styles.tabBtnActive]}
            onPress={() => setTab("medication")}
          >
            <Text style={[styles.tabText, tab === "medication" && styles.tabTextActive]}>
              دارو و مکمل
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "exercise" && styles.tabBtnActive]}
            onPress={() => setTab("exercise")}
          >
            <Text style={[styles.tabText, tab === "exercise" && styles.tabTextActive]}>
              ورزش
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <Text style={styles.emptyText}>در حال بارگذاری...</Text>}

        {!loading && tab === "medication" && (
          <>
            {medications.length === 0 && (
              <Text style={styles.emptyText}>هنوز دارویی ثبت نشده</Text>
            )}
            {medications.map((med) => (
              <View key={med.id} style={styles.listCard}>
                <Text style={styles.itemName}>{med.name}</Text>
              </View>
            ))}
          </>
        )}

        {!loading && tab === "exercise" && (
          <>
            {exerciseLogs.length === 0 && (
              <Text style={styles.emptyText}>هنوز ورزشی ثبت نشده</Text>
            )}
            {exerciseLogs.map((log) => (
              <View key={log.id} style={styles.listCard}>
                <Text style={styles.itemName}>{log.value?.exercise_name}</Text>
                {log.value?.duration_minutes && (
                  <Text style={styles.itemSubtitle}>
                    {log.value.duration_minutes} دقیقه
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.bg },
  container: { padding: 18, paddingTop: 22, paddingBottom: 40 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.textDark,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row-reverse",
    backgroundColor: Colors.border,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: Colors.card,
  },
  tabText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.textDark,
  },
  emptyText: {
    color: Colors.textLight,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 9,
  },
  itemName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.textDark,
    textAlign: "right",
  },
  itemSubtitle: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: "right",
    marginTop: 4,
  },
});