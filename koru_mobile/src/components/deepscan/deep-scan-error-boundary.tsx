import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, View } from "react-native";


type DeepScanErrorBoundaryProps = {
  children: ReactNode;
};

type DeepScanErrorBoundaryState = {
  hasError: boolean;
};


export class DeepScanErrorBoundary extends Component<
  DeepScanErrorBoundaryProps,
  DeepScanErrorBoundaryState
> {
  state: DeepScanErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): DeepScanErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error("DeepScanErrorBoundary", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="rounded-[30px] border border-primary/8 bg-white/36 px-6 py-6">
          <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
            Recalibrating
          </Text>
          <Text className="mt-3 font-heading text-3xl text-primary">
            Recalibrating...
          </Text>
          <Text className="mt-3 font-ui text-base leading-7 text-primary/70">
            O guia esta reorganizando a leitura da base para voltar com clareza.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
