import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import { Colors, Fonts } from "../../constants/theme";

const API_URL = "http://10.0.0.102:8000";
const dayLabels = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

export default function AnalyticsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [coachInsight, setCoachInsight] = useState<string>("");

  useEffect(() => {
    axios
      .get(`${API_URL}/analytics/weekly`)
      .then((res) => setData(res.data))
      .catch((err) => console.log("خطا:", err))
      .finally(() => setLoading(false));

    axios
      .get(`${API_URL}/analytics/coach`)
      .then((res) => setCoachInsight(res.data.insight))
      .catch((err) => console.log("خطا در Coach:", err));
  }, []);

  if (loading || !data) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.emptyText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.daily_activity.map((d: any) => d.count), 1);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>تحلیل</Text>

        <View style={styles.statsRow}>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{data.streak} روز</Text>
            <Text style={styles.streakLabel}>زنجیره ثبت روزانه</Text>
          </View>
          <View style={styles.compareCard}>
            <Text style={styles.compareNumber}>
              {data.this_week_count} {data.change_percent >= 0 ? "↑" : "↓"}
            </Text>
            <Text style={styles.compareLabel}>
              {Math.abs(data.change_percent)}٪ {data.change_percent >= 0 ? "بیشتر" : "کمتر"} از هفته قبل
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>فعالیت روزانه</Text>
          <View style={styles.barsRow}>
            {data.daily_activity.map((d: any, i: number) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((d.count / maxCount) * 70, 6),
                      backgroundColor:
                        selectedDay === i ? Colors.purple : Colors.purpleLight,
                    },
                  ]}
                  onTouchEnd={() => setSelectedDay(i)}
                />
                <Text style={styles.dayLabel}>{dayLabels[i]}</Text>
              </View>
            ))}
          </View>
          {selectedDay !== null && (
            <Text style={styles.dayDetail}>
              {data.daily_activity[selectedDay].date}:{" "}
              {data.daily_activity[selectedDay].count} ثبت
            </Text>
          )}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>💡 بینش این هفته</Text>
          <Text style={styles.insightText}>
            {data.this_week_count > data.last_week_count
              ? "این هفته فعال‌تر از هفته قبل بودی، همینطور ادامه بده."
              : "این هفته ثبت‌های کمتری داشتی. سعی کن به زنجیره روزانه‌ت برگردی."}
          </Text>
        </View>
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
  emptyText: { color: Colors.textLight, fontSize: 12, textAlign: "center", marginTop: 40 },
  statsRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 14 },
  streakCard: {
    flex: 1,
    backgroundColor: Colors.amber,
    borderRadius: 18,
    padding: 14,
  },
  streakEmoji: { fontSize: 20 },
  streakNumber: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: "#fff",
    marginTop: 4,
  },
  streakLabel: { fontSize: 10, color: "#fff", marginTop: 2 },
  compareCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 14,
    justifyContent: "center",
  },
  compareNumber: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.teal,
  },
  compareLabel: { fontSize: 9.5, color: Colors.textMuted, marginTop: 4 },
  chartCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  chartTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.textDark,
    marginBottom: 14,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 90,
  },
  barCol: { alignItems: "center", gap: 6 },
  bar: { width: 18, borderRadius: 6 },
  dayLabel: { fontSize: 9, color: Colors.textLight },
  dayDetail: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "right",
  },
  insightCard: {
    backgroundColor: Colors.textDark,
    borderRadius: 18,
    padding: 16,
  },
  insightLabel: {
    fontSize: 11,
    color: Colors.amber,
    fontFamily: Fonts.bodyBold,
    marginBottom: 6,
    textAlign: "right",
  },
  insightText: {
    fontSize: 12,
    color: "#fff",
    lineHeight: 22,
    textAlign: "right",
  },
});