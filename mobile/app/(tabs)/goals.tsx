import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import api from "../../utils/api";
import { Colors, Fonts } from "../../constants/theme";

const cardColors = [
  { bg: [Colors.purple, Colors.purpleDark] },
  { bg: [Colors.teal, Colors.tealDark] },
  { bg: [Colors.coral, Colors.coralDark] },
];

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGoals() {
    try {
      const response = await api.get(`/tracking/items/goal`);
      setGoals(response.data);
    } catch (err) {
      console.log("خطا در گرفتن اهداف:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>اهداف</Text>

        {loading && <Text style={styles.emptyText}>در حال بارگذاری...</Text>}

        {!loading && goals.length === 0 && (
          <Text style={styles.emptyText}>
            هنوز هدفی ثبت نشده. یه ویس بگیر و بگو چه هدفی داری!
          </Text>
        )}

        {goals.map((goal, i) => {
          const colorPair = cardColors[i % cardColors.length].bg;
          return (
            <View key={goal.id} style={[styles.goalCard, { backgroundColor: colorPair[0] }]}>
              <Text style={styles.goalName}>{goal.name}</Text>
              {goal.config?.target && (
                <Text style={styles.goalTarget}>{goal.config.target}</Text>
              )}
            </View>
          );
        })}

        <View style={styles.addCard}>
          <Text style={styles.addText}>+ برای افزودن هدف جدید، صحبت کن</Text>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.textDark,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.textLight,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  goalCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  goalName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#fff",
    textAlign: "right",
  },
  goalTarget: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    textAlign: "right",
    marginTop: 6,
  },
  addCard: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginTop: 6,
  },
  addText: {
    color: Colors.textLight,
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
  },
});