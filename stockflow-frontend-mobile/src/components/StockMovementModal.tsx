import axios from "axios";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type StockMovementType = "ENTRADA" | "SAIDA";

type StockMovementModalProps = {
  visible: boolean;
  currentStock: number;
  onClose: () => void;
  onSave: (
    movementType: StockMovementType,
    quantity: number,
  ) => Promise<void> | void;
};

export default function StockMovementModal({
  visible,
  currentStock,
  onClose,
  onSave,
}: StockMovementModalProps) {
  const [movementType, setMovementType] =
    useState<StockMovementType>("ENTRADA");
  const [quantity, setQuantity] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!visible) {
    return null;
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    const amount = Number(quantity);

    if (!/^\d+$/.test(quantity) || !Number.isSafeInteger(amount) || amount <= 0) {
      setErrorMessage("Informe uma quantidade inteira maior que zero.");
      return;
    }

    if (movementType === "SAIDA" && amount > currentStock) {
      setErrorMessage("Estoque insuficiente.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await onSave(movementType, amount);
      setQuantity("");
      setErrorMessage("");
      setMovementType("ENTRADA");
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { message?: string; error?: string }
          | string
          | undefined;
        const apiMessage =
          typeof data === "string"
            ? data
            : data?.message || data?.error;
        setErrorMessage(
          apiMessage || "Não foi possível salvar a movimentação.",
        );
      } else {
        setErrorMessage("Não foi possível salvar a movimentação.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.modalBackdrop}>
      <View accessibilityViewIsModal style={styles.modalCard}>
        <Text style={styles.modalTitle}>Movimentar estoque</Text>

        <Text style={styles.inputLabel}>Tipo de movimentação</Text>
        <View style={styles.movementOptions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: movementType === "ENTRADA" }}
            style={[
              styles.movementOption,
              movementType === "ENTRADA" && styles.selectedMovementOption,
            ]}
            onPress={() => setMovementType("ENTRADA")}
          >
            <Text
              style={[
                styles.movementOptionText,
                movementType === "ENTRADA" &&
                  styles.selectedMovementOptionText,
              ]}
            >
              Entrada
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: movementType === "SAIDA" }}
            style={[
              styles.movementOption,
              movementType === "SAIDA" && styles.selectedMovementOption,
            ]}
            onPress={() => setMovementType("SAIDA")}
          >
            <Text
              style={[
                styles.movementOptionText,
                movementType === "SAIDA" &&
                  styles.selectedMovementOptionText,
              ]}
            >
              Saída
            </Text>
          </Pressable>
        </View>

        <View style={styles.stockInfo}>
          <Text style={styles.stockInfoLabel}>Quantidade em estoque</Text>
          <Text style={styles.stockInfoValue}>{currentStock} unidades</Text>
        </View>

        <Text style={styles.inputLabel}>Quantidade</Text>
        <TextInput
          accessibilityLabel="Quantidade da movimentação"
          keyboardType="number-pad"
          onChangeText={(value) => {
            if (/^\d*$/.test(value)) {
              setQuantity(value);
              setErrorMessage("");
            } else {
              setErrorMessage("Informe apenas números inteiros.");
            }
          }}
          placeholder="Digite a quantidade"
          style={styles.input}
          value={quantity}
        />

        {errorMessage ? (
          <Text accessibilityRole="alert" style={styles.errorMessage}>
            {errorMessage}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.actionButtonText}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    elevation: 10,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    gap: 12,
    padding: 20,
  },
  modalTitle: {
    color: "#1f2937",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputLabel: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600",
  },
  movementOptions: {
    flexDirection: "row",
    gap: 8,
  },
  stockInfo: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  stockInfoLabel: {
    color: "#475569",
    fontSize: 14,
  },
  stockInfoValue: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600",
  },
  movementOption: {
    flex: 1,
    alignItems: "center",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  selectedMovementOption: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  movementOptionText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  selectedMovementOptionText: {
    color: "#ffffff",
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorMessage: {
    color: "#b91c1c",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  cancelButton: {
    backgroundColor: "#64748b",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
