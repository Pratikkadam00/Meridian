import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { FloatingNav } from "@/features/navigation";

export default function AppLayout() {
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
      <FloatingNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
