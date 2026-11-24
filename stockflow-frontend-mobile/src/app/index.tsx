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

type Product = {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  estoqueMinimo: number;
};

// TODO: Substituir pelos dados reais da API quando o backend estiver disponível
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    nome: "Caderno Universitário",
    categoria: "Papelaria",
    quantidade: 10,
    estoqueMinimo: 3,
  },
  {
    id: 2,
    nome: "Caneta Esferográfica Azul",
    categoria: "Papelaria",
    quantidade: 2,
    estoqueMinimo: 5,
  },
  {
    id: 3,
    nome: "Teclado Mecânico",
    categoria: "Eletrônicos",
    quantidade: 7,
    estoqueMinimo: 2,
  },
  {
    id: 4,
    nome: "Mouse Sem Fio",
    categoria: "Eletrônicos",
    quantidade: 1,
    estoqueMinimo: 4,
  },
];

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
      // TODO: Substituir pela chamada real à API (ex: fetchProdutos())
      await new Promise((resolve) => setTimeout(resolve, 600));
      setProducts(MOCK_PRODUCTS);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Produtos</Text>

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
              nome={item.nome}
              categoria={item.categoria}
              quantidade={item.quantidade}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
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

