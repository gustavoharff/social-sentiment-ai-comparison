import { App, ModalFuncProps } from "antd";
import classNames from "classnames";

export function useCustomModal() {
  const { modal } = App.useApp();

  return (props: ModalFuncProps) => {
    return modal.info({
      className: classNames("custom-modal"),
      maskClosable: true,
      footer: null,
      icon: null,
      styles: {
        content: { padding: 0, backgroundColor: "inherit" },
        mask: {
          backdropFilter: "blur(2px)",
        },
      },
      style: { padding: 0 },
      centered: true,
      ...props,
    });
  };
}
