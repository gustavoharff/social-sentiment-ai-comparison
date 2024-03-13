import classNames from "classnames";
import { ComponentProps, ReactElement, ReactNode } from "react";

interface CardHeaderProps extends ComponentProps<"div"> {
  children?: ReactNode;
  icon?: ReactElement;
  title: string;
}

export function CardHeader(props: CardHeaderProps) {
  const { title, icon, children, className, ...rest } = props;

  return (
    <div
      className={classNames(
        'border-b border-solid border-[#d7dbdf] dark:border-[#3a3f42]',
        "flex items-center justify-between p-4",
        className
      )}
      {...rest}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="default-text text-xl">{icon}</div>}

        <div className="text-black dark:text-white/80 font-semibold">
          {title}
        </div>
      </div>

      {children}
    </div>
  );
}
