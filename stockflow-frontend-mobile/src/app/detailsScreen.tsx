import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import StockMovementModal, {
  StockMovementType,
} from "../components/StockMovementModal";
import { Product } from "./models/product";
import { getProductById, moveProductStock } from "./services/productService";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;
    const productId = Number(id);

    setProduct(null);
    setError(null);
    setIsLoading(true);

    if (!id || !Number.isInteger(productId) || productId <= 0) {
      setError("Identificador do produto inválido.");
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    getProductById(productId)
      .then((data) => {
        if (isActive) {
          setProduct(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setError("Não foi possível carregar os detalhes do produto.");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [id, retryCount]);

  async function handleSaveMovement(type: StockMovementType, amount: number) {
    if (!product) {
      return;
    }

    const updatedProduct = await moveProductStock(product.id, {
      tipo: type,
      quantidade: amount,
    });

    setProduct(updatedProduct);
    setSuccessMessage("Movimentação de estoque salva com sucesso.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do produto</Text>

      {successMessage ? (
        <Text accessibilityRole="status" style={styles.successMessage}>
          {successMessage}
        </Text>
      ) : null}

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.stateText}>Carregando produto...</Text>
          </View>
        ) : error ? (
          <View style={styles.state}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => setRetryCount((count) => count + 1)}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : product ? (
          <>
            <View style={styles.detailsCard}>
              <View style={styles.detailField}>
                <Text style={styles.label}>ID</Text>
                <Text style={styles.value}>{product.id}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.label}>Nome</Text>
                <Text style={styles.value}>{product.name}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.label}>Descrição</Text>
                <Text style={styles.value}>
                  {product.description || "Sem descrição"}
                </Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.label}>Categoria</Text>
                <Text style={styles.value}>{product.category}</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.label}>Quantidade</Text>
                <Text style={styles.value}>{product.quantity} unidades</Text>
              </View>
              <View style={styles.detailField}>
                <Text style={styles.label}>Estoque mínimo</Text>
                <Text style={styles.value}>{product.minStock} unidades</Text>
              </View>
              <Text
                style={[
                  styles.stockStatus,
                  product.lowStock ? styles.lowStock : styles.stockAvailable,
                ]}
              >
                {product.lowStock ? "Estoque baixo" : "Estoque adequado"}
              </Text>
            </View>

            <Pressable
              style={styles.button}
              onPress={() => {
                setSuccessMessage("");
                setModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Estoque</Text>
            </Pressable>
          </>
        ) : null}
      </View>

      <StockMovementModal
        visible={modalVisible}
        currentStock={product?.quantity ?? 0}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveMovement}
      />
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
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  stateText: {
    color: "#4b5563",
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
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
  stockStatus: {
    fontSize: 15,
    fontWeight: "700",
  },
  lowStock: {
    color: "#dc2626",
  },
  stockAvailable: {
    color: "#15803d",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "left",
  },
  successMessage: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    color: "#166534",
    fontSize: 14,
    marginBottom: 12,
    padding: 12,
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
