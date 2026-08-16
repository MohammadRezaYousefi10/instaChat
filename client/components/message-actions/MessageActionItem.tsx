import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface Props {
  title: string;

  onPress(): void;
}

export default function MessageActionItem({
  title,

  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 16,
      }}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
