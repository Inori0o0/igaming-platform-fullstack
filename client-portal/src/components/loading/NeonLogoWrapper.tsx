"use client";

import { motion, AnimatePresence, type Variants, type Transition } from "framer-motion";
import type { PropsWithChildren } from "react";
import clsx from "clsx";

type NeonLogoWrapperProps = PropsWithChildren<{
  show?: boolean;
  className?: string;
  durationIn?: number;
  durationOut?: number;
}>;

type VariantCustom = {
  durationIn: number;
  durationOut: number;
};

const variants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (custom: VariantCustom) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: custom.durationIn,
      ease: "easeOut" as Transition["ease"],
    },
  }),
  exit: (custom: VariantCustom) => ({
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: custom.durationOut,
      ease: "easeIn" as Transition["ease"],
    },
  }),
};

export function NeonLogoWrapper({
  show = true,
  children,
  className,
  durationIn = 0.5,
  durationOut = 0.3,
}: NeonLogoWrapperProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={clsx(
            "neon-glow animate-neon-pulse",
            className,
          )}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={{ durationIn, durationOut }}
          variants={variants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

