import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Tela A" }} />
      <Stack.Screen name="detailsScreen" options={{ title: "Detalhes" }} />
      <Stack.Screen name="telaC" options={{ title: "Tela C" }} />
    </Stack>
  );
}

