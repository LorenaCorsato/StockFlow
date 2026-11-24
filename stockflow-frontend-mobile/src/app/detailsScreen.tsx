import { Pressable, StyleSheet, Text, View } from "react-native";

export default function DetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do produto</Text>

      <View style={styles.content}>
        <View style={styles.detailsCard}>
          <View style={styles.detailField}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>Caderno universitário</Text>
          </View>
          <View style={styles.detailField}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>
              Caderno de 10 matérias para uso escolar.
            </Text>
          </View>
          <View style={styles.detailField}>
            <Text style={styles.label}>Categoria</Text>
            <Text style={styles.value}>Papelaria</Text>
          </View>
          <View style={styles.detailField}>
            <Text style={styles.label}>Quantidade</Text>
            <Text style={styles.value}>10 unidades</Text>
          </View>
          <View style={styles.detailField}>
            <Text style={styles.label}>Estoque mínimo</Text>
            <Text style={styles.value}>3 unidades</Text>
          </View>
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Estoque</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 16,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    gap: 16,
    padding: 16,
  },
  detailField: {
    gap: 4,
  },
  label: {
    color: "#64748b",
    fontSize: 14,
  },
  value: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "left",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
