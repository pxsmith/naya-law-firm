"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import styles from "../app/page.module.css";

/** The audiences shown in the "Who it's for" section, top to bottom. */
const AUDIENCES = [
	"Commercial mortgage lenders",
	"Life insurance company lenders",
	"Institutional lending teams",
	"Private and hard money lenders",
	"Other forward-thinking lenders",
];

/** Each pill steps a little further right than the one above it (a cascading indent). */
const INDENT_STEP = 26; // px added per pill, top to bottom

// House easing used elsewhere on the site.
const EASE = [0.22, 1, 0.36, 1] as const;

const listVariants: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.09 } },
};

export function AudienceList() {
	const reduceMotion = useReducedMotion();
	// On mobile, drop the cascading indent (it pushed pills off the screen).
	const [isNarrow, setIsNarrow] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(max-width: 800px)");
		const update = () => setIsNarrow(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	return (
		<motion.ul
			className={styles.audienceList}
			variants={listVariants}
			initial="hidden"
			whileInView={isNarrow ? undefined : "visible"}
			animate={isNarrow ? "visible" : undefined}
			viewport={{ once: true, amount: 0.4 }}
		>
			{AUDIENCES.map((label, i) => {
				const x = isNarrow ? 0 : i * INDENT_STEP;
				// Desktop: cascading indent + slide-in. Mobile (and reduced-motion):
				// no indent, appear immediately (chips wrap; no scroll-triggered fade).
				const itemVariants: Variants = {
					hidden:
						reduceMotion || isNarrow
							? { opacity: 1, x }
							: { opacity: 0, x: x - 32 },
					visible: {
						opacity: 1,
						x,
						transition: { duration: 0.5, ease: EASE },
					},
				};

				return (
					<motion.li key={label} variants={itemVariants}>
						{label}
					</motion.li>
				);
			})}
		</motion.ul>
	);
}
