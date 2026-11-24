import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Lista de Produtos" }} />
      <Stack.Screen name="telaB" options={{ title: "Tela B" }} />
    </Stack>
  );
}

