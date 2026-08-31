import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import { Colors, Fonts } from "../../constants/theme";

const API_URL = "http://10.0.0.102:8000";

export default function FinanceScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransactions() {
    try {
      const response = await axios.get(`${API_URL}/tracking/finance`);
      setTransactions(response.data);
    } catch (err) {
      console.log("خطا در گرفتن تراکنش‌ها:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.value?.type === "income")
    .reduce((sum, t) => sum + (t.value?.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.value?.type === "expense")
    .reduce((sum, t) => sum + (t.value?.amount || 0), 0);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>مالی</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>موجودی این ماه</Text>
          <Text style={styles.balanceAmount}>
            {(totalIncome - totalExpense).toLocaleString("fa-IR")} تومان
          </Text>
          <View style={styles.balanceSplit}>
            <Text style={styles.splitText}>
              درآمد {totalIncome.toLocaleString("fa-IR")}
            </Text>
            <Text style={styles.splitText}>
              هزینه {totalExpense.toLocaleString("fa-IR")}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>تراکنش‌های اخیر</Text>

        {loading && <Text style={styles.emptyText}>در حال بارگذاری...</Text>}
        {!loading && transactions.length === 0 && (
          <Text style={styles.emptyText}>هنوز تراکنشی ثبت نشده</Text>
        )}

        {transactions.map((t) => (
          <View key={t.id} style={styles.txCard}>
            <View>
              <Text style={styles.txName}>{t.value?.item_name}</Text>
              <Text style={styles.txSource}>{t.source === "voice" ? "ثبت صوتی" : t.source}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: t.value?.type === "income" ? Colors.teal : Colors.coral },
              ]}
            >
              {t.value?.type === "income" ? "+" : "-"}
              {t.value?.amount?.toLocaleString("fa-IR")}
            </Text>
          </View>
        ))}
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
  balanceCard: {
    backgroundColor: Colors.textDark,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    textAlign: "right",
  },
  balanceAmount: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: "#fff",
    textAlign: "right",
    marginTop: 4,
  },
  balanceSplit: {
    flexDirection: "row-reverse",
    gap: 16,
    marginTop: 12,
  },
  splitText: {
    fontSize: 10.5,
    color: "#fff",
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textDark,
    marginBottom: 10,
  },
  emptyText: {
    color: Colors.textLight,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
  txCard: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 9,
  },
  txName: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.textDark,
    textAlign: "right",
  },
  txSource: {
    fontSize: 9.5,
    color: Colors.textLight,
    textAlign: "right",
    marginTop: 3,
  },
  txAmount: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
  },
});