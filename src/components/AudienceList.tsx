"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import styles from "../app/page.module.css";

/** The audiences shown in the "Who it's for" section, top to bottom. */
const AUDIENCES = [
	"Commercial mortgage lenders",
	"Life insurance company lenders",
	"Institutional lending teams",
	"Private lenders",
	"Other forward thinking lenders",
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

	return (
		<motion.ul
			className={styles.audienceList}
			variants={listVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.4 }}
		>
			{AUDIENCES.map((label, i) => {
				const x = i * INDENT_STEP;
				// Resting state holds the cascading indent; entrance adds a slide from the left.
				const itemVariants: Variants = {
					hidden: reduceMotion
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
