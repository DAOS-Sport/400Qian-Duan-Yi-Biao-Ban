export const motionTokens = {
  duration: {
    fast: 0.16,
    base: 0.24,
    slow: 0.36,
  },
  ease: {
    standard: [0.2, 0, 0, 1] as const,
    emphasized: [0.2, 0, 0, 1] as const,
  },
};

export const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045 },
  },
};

export const riseIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.standard,
    },
  },
};
