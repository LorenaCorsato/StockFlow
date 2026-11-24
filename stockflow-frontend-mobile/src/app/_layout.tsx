import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Tela A" }} />
      <Stack.Screen name="telaB" options={{ title: "Tela B" }} />
      <Stack.Screen name="telaC" options={{ title: "Tela C" }} />
    </Stack>
  );
}

