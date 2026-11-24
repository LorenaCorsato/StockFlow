import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ProductCard } from "./components/productCard";
import { Product } from "./models/product";
import { getProducts } from "./services/productService";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError("Não foi possível carregar os produtos. Tente novamente.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const isBusy = isLoading || refreshing;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Produtos</Text>
        <Pressable
          style={({ pressed }) => [
            styles.refreshButton,
            isBusy && styles.refreshButtonDisabled,
            pressed && !isBusy && styles.refreshButtonPressed,
          ]}
          onPress={() => loadProducts(products.length > 0)}
          disabled={isBusy}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? "Atualizando..." : "Atualizar"}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadProducts()}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            products.length === 0 && styles.emptyListContent,
          ]}
          refreshing={refreshing}
          onRefresh={() => loadProducts(true)}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateText}>Nenhum produto cadastrado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              nome={item.name}
              categoria={item.category}
              quantidade={item.quantity}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    flexShrink: 1,
  },
  refreshButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonPressed: {
    opacity: 0.85,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  stateText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

