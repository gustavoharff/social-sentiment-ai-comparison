import {
  ConfigProvider as AntdConfigProvider,
  ConfigProviderProps,
  theme as antdTheme,
} from "antd";
import { useTheme } from "next-themes";
import { useMemo } from "react";

export function ConfigProvider(props: ConfigProviderProps) {
  const { theme, resolvedTheme } = useTheme();

  const algorithm = useMemo(() => {
    if (theme === "dark") return antdTheme.darkAlgorithm;

    if (theme === "light") return antdTheme.defaultAlgorithm;

    if (theme === "system") {
      if (resolvedTheme === "dark") return antdTheme.darkAlgorithm;
      if (resolvedTheme === "light") return antdTheme.defaultAlgorithm;
    }

    return undefined;
  }, [theme, resolvedTheme]);

  return (
    <AntdConfigProvider
      theme={{
        algorithm: algorithm,
      }}
      {...props}
    />
  );
}
