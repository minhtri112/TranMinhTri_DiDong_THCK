import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { initDB } from "./database/db";
export default function Index() {
  useEffect(() => {
    initDB();
  }, []);
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
