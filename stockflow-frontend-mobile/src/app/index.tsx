import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function TelaA() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela A</Text>

      <Pressable style={styles.button} onPress={() => router.push("/telaB")}>
        <Text style={styles.buttonText}>Ir para Tela B</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push("/telaC")}>
        <Text style={styles.buttonText}>Ir para Tela C</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

