import type { ReactNode } from "react";
import styles from "./Container.module.css";

interface ContainerProps {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}

export function Container({ children, narrow, className }: ContainerProps) {
  const classes = [
    styles.container,
    narrow ? styles.narrow : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes}>{children}</div>;
}
