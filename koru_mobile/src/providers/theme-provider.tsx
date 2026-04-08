import { PropsWithChildren } from "react";
import { View } from "react-native";
import { vars } from "nativewind";

import { colorVars } from "@/theme/tokens";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <View style={vars(colorVars)} className="flex-1 bg-surface">
      {children}
    </View>
  );
}
