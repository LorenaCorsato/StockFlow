import { Pressable, StyleSheet, Text } from "react-native";

type ProductCardProps = {
  nome: string;
  categoria: string;
  quantidade: number;
  onPress?: () => void;
};

export function ProductCard({
  nome,
  categoria,
  quantidade,
  onPress,
}: ProductCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.title}>{nome}</Text>
      <Text style={styles.meta}>Categoria: {categoria}</Text>
      <Text style={styles.quantity}>
        Quantidade disponível: {quantidade}
      </Text>
    </Pressable>
  );
}

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    fontSize: 14,
    color: "#4B5563",
  },
  quantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
});
