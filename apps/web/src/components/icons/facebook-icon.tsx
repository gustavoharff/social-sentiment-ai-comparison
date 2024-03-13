import { forwardRef } from "react";
import { IconProps } from "@radix-ui/react-icons/dist/types";

export const FacebookIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", ...props }, forwardedRef) => {
    return (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M15 7.5C15 11.3342 12.1225 14.4963 8.40875 14.9458L8.40917 9.79167H10.4371L10.8571 7.5H8.40583V6.68958C8.40583 5.4775 8.88 5.0125 10.11 5.0125C10.4908 5.0125 10.8 5.02167 10.9771 5.03958V2.96333C10.6408 2.87042 9.82208 2.7775 9.34792 2.7775C6.84292 2.7775 5.68792 3.95958 5.68792 6.5125V7.5H4.14V9.79208H5.68792L5.68833 14.7796C2.42125 13.9692 0 11.0175 0 7.5C0 3.35792 3.35792 0 7.5 0C11.6421 0 15 3.35792 15 7.5Z"
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    );
  }
);

FacebookIcon.displayName = "FacebookIcon";
