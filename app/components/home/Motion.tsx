import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionProps {
    key?: string;
    children: ReactNode;
}

export default function Motion({ key, children }: MotionProps) {
    return (
        <motion.section
            key={key ?? useLocation().key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}>
            {children}
        </motion.section>
    );
}