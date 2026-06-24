import Link from "next/link";
import { Container } from "@/components/Container";
import { VideoBg } from "@/components/VideoBg";
import { ImageBg } from "@/components/ImageBg";
import { Faq } from "@/components/Faq";
import { AudienceList } from "@/components/AudienceList";
import styles from "./page.module.css";

const FAQ_ITEMS = [
	{
		question: "How can a law firm offer fixed fees on complex closings?",
		answer:
			"Because Naya focuses narrowly on commercial real estate and corporate lending, the work is repeatable — and our platform automates the documents and workflow that traditional firms bill by the hour. That lets us price the matter based on what it should cost and stand behind that number before the work begins.",
	},
	{
		question: "What happens if a deal turns out to be more complicated than expected?",
		answer:
			"The fee structure is agreed up front, including how unusual scope is handled. You will not get a surprise invoice at closing — if something material changes, we tell you before the work happens, not after.",
	},
	{
		question: "Is my deal data confidential if you use AI?",
		answer:
			"Yes. Naya runs on its own platform built specifically for commercial mortgage transactions, and client data is never used to train third-party models. AI accelerates document and workflow tasks under attorney supervision; it does not replace the lawyer responsible for your matter.",
	},
	{
		question: "Who is actually doing the legal work?",
		answer:
			"Experienced commercial real estate attorneys. Naya was built by Matthew Basile, who spent nearly two decades in CRE law and was a partner at a large Am Law 150 firm. You get Big Law judgment with a delivery model built for the AI era.",
	},
	{
		question: "What types of transactions do you handle?",
		answer:
			"Commercial mortgage loan closings and related corporate lending transactions — typically sub-$10M loan closings, though we work across a range of institutional lending matters. If your team needs predictable legal fees on repeatable lending work, we likely fit.",
	},
	{
		question: "How can you quote pricing when you have never worked with us?",
		answer:
			"For sub-$10MM loans we are comfortable to close up to 5 deals with any new lender and take the risk. If both sides think an adjustment is appropriate then we can change the schedule as needed.",
	},
	{
		question: "How does the fixed fee pricing change if unexpected complexities come up in the course of a deal?",
		answer:
			"We generally stick to the fixed price as long as nothing major changes. The most common reasons pricing is increased is comments to the loan documents.",
	},
	{
		question: "How do you handle adjusting the price during a deal?",
		answer:
			"If any assumptions change, like if a heavy loan document mark-up is received from the borrower, we immediately let the client know so that they can make the borrower aware of the new price.",
	},
	{
		question: "Are you an AI native law firm?",
		answer:
			"We like to call ourselves an AI and tech first law firm. We work on complicated commercial transactions that will always need an experienced lawyer in the loop. However, since we fix our fees we are motivated to use AI and any other available technology to work fast.",
	},
	{
		question: "Are you hiring lawyers?",
		answer:
			"We are always looking for like minded lawyers that want to leverage our new pricing and technology platform to deliver a better client experience to their clients. Reach out if you are interested in joining our movement.",
	},
	{
		question: "What does your technology stack look like?",
		answer:
			"All of our lawyers and their clients run all their deals on the Naya Software Platform. This includes a DMS, blackline tools, document automation and dozens of AI apps. We are also integrated with Claude and Co-Pilot and other general AI tools through MCP. It is truly the future of real estate loan closings and you will be on the cutting edge.",
	},
	{
		question: "What is different for clients about working with you vs. a traditional Big Law lawyer?",
		answer:
			"Clients get access to the Naya software platform and can leverage many of the same tools we use. So they not only get top quality representation closing deals but they also get a building partner for their AI strategy. We are totally aligned with our clients on this front.",
	},
];

const HERO_VIDEO = "/videos/Stocksy_unlicensed_comp_watermarked_2907984.mp4";
const CONTACT_VIDEO = "/videos/Stocksy_unlicensed_comp_watermarked_4046271.mp4";
const APPROACH_VIDEO = "/videos/approach.mp4";
const AUDIENCE_VIDEO = "/videos/audience.mp4";

// Line-style marks for the comparison table. Lime check = the Naya way;
// muted â = the traditional way (brand avoids red, so the negative recedes
// in grey rather than shouting).
function CheckMark() {
	return (
		<svg
			className={`${styles.compareMark} ${styles.compareMarkCheck}`}
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M3.5 8.5l3 3 6-7.5"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function XMark() {
	return (
		<svg
			className={`${styles.compareMark} ${styles.compareMarkX}`}
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M4 4l8 8M12 4l-8 8"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export default function HomePage() {
	return (
		<>
			{/* âââââââââââââ Hero âââââââââââââ */}
			<section className={styles.hero}>
				<VideoBg src={HERO_VIDEO} className={styles.sectionVideo} />
				<Container>
					<p
						className={`${styles.proof} ${styles.reveal}`}
						style={{ animationDelay: "0ms" }}
					>
						<span className={styles.proofDot} aria-hidden="true" />
						100+ CRE closings of over $775MM
					</p>
					<h1
						className={`${styles.heroTitle} ${styles.reveal}`}
						style={{ animationDelay: "90ms" }}
					>
						AI-native commercial
						<br />
						real estate law firm
					</h1>
					<p
						className={`${styles.lede} ${styles.reveal}`}
						style={{ animationDelay: "210ms" }}
					>
						Naya Law is a tech and AI first law firm for institutional real estate lenders. We combine Big Law experience, a proprietary technology platform, and value based fixed-fee pricing so you can quote legal costs up front, close more
						loans with the same team, and leverage AI to transform your closing process.
					</p>
					<div
						className={`${styles.ctas} ${styles.reveal}`}
						style={{ animationDelay: "330ms" }}
					>
						<Link href="/pricing" className={styles.primaryCta} data-beam-hover>
							Get Pricing
						</Link>
						<Link href="#approach" className={styles.secondaryCta}>
							Learn More
						</Link>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Problem âââââââââââââ */}
			<section
				className={`${styles.section} ${styles.sectionTrimBottom}`}
				data-beam-zone
			>
				<Container>
					<div className={styles.split}>
						<div>
							<p className={styles.eyebrow}>The problem</p>
							<h1 className={`${styles.sectionTitle} ${styles.lightHeading}`}>
								The longer it takes, the higher the fee.
							</h1>
						</div>
						<div className={styles.prose}>
							<p>
								Traditional law firms still run on the billable hour, which means
								delay, manual work, and extra timekeepers all result into a higher
								invoice for the client.
							</p>
							<p>
								That model also gives firms weak incentives to leverage technology and AI to automate processes, because
								improved efficiency can reduce billable time. It is also risk free to the law firm as any inefficiency or surprises just increase the fee.
							</p>
							<p>
								For institutional lenders, that creates friction where there
								should be certainty: fees are hard to quote up front, hard to
								explain to borrowers, and often higher than expected by the time
								the deal closes.
							</p>
						</div>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Fern Visual Break âââââââââââââ */}
			<section className={styles.fernSection} data-beam-zone>
				<div className={styles.fernWrapper}>
					<ImageBg
						src="/brand/fern.png"
						className={styles.fernImage}
						scale={1.15}
						offset={[0.12, 0]}
					/>
				</div>
			</section>

			{/* âââââââââââââ What Naya Does âââââââââââââ */}
			<section
				className={`${styles.section} ${styles.sectionTrimTop}`}
				data-beam-zone
			>
				<Container>
					<div className={styles.splitWithCards}>
						<div>
							<p className={styles.eyebrow}>What we do</p>
							<h2 className={styles.sectionTitle}>
								Commercial lending closings, rebuilt for the AI era.
							</h2>
							<div className={styles.prose}>
								<p>
									Naya Law focuses narrowly on commercial real estate and
									corporate lending transactions rather than trying to be everything
									to everyone.
								</p>
								<p>
									The firm runs its legal work on Naya's own software platform,
									built specifically for commercial mortgage loan transactions. The
									legal workflow, software workflow, and client experience are
									designed together from day one.
								</p>
							</div>
						</div>
						<ul className={styles.differentiators}>
							<li>
								<h2 className="sansHeading">Fixed-fee pricing</h2>
								<p>Quoted up front, before the work begins.</p>
							</li>
							<li>
								<h2 className="sansHeading">Big Law experience</h2>
								<p>Nearly two decades of complex CRE transactions.</p>
							</li>
							<li>
								<h2 className="sansHeading">Proprietary platform</h2>
								<p>Built around commercial mortgage closings.</p>
							</li>
							<li>
								<h2 className="sansHeading">100+ loans closed</h2>
								<p>This model is already proven in production.</p>
							</li>
						</ul>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Approach âââââââââââââ */}
			<section id="approach" className={`${styles.section} ${styles.approachVideoSection}`}>
				<VideoBg src={APPROACH_VIDEO} className={styles.sectionVideo} />
				<Container narrow className={styles.approachCenter}>
					<p className={styles.eyebrow}>Approach</p>
					<h2 className={`${styles.sectionTitle} ${styles.tunableHeading}`}>
						Optimized for efficiency, not billable hours.
					</h2>
					<div className={styles.prose}>
						<p>
							Before the matter begins, Naya gives clients a defined fee structure instead of an hourly estimate. That allows your originators to quote legal fees to borrowers upfront, manage expectations, and compete more effectively to win deals on total economics. And because Naya does not bill by the hour, its incentive is straightforward: close the deal accurately, efficiently, and without unnecessary friction so you benefit as AI and tech improves.
						</p>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Experience / About âââââââââââââ */}
			<section id="about" className={`${styles.section} ${styles.alt}`}>
				<Container>
					<div className={styles.aboutGrid}>
						<div className={styles.aboutIntro}>
							<p className={styles.eyebrow}>About</p>
							<h2 className={`${styles.sectionTitle} ${styles.aboutTitle}`}>
								Big Law judgment.{" "}
								<span className={styles.aboutTitleItalic}>
									<span data-beam-target>Different</span> economics.
								</span>
							</h2>
							<p className={styles.aboutLink}>
								<Link href="/about">More about the firm &rarr;</Link>
							</p>
						</div>
						<ol className={styles.aboutPoints}>
							<li className={styles.aboutPoint}>
								<span className={styles.aboutPointNum} aria-hidden="true">
									01
								</span>
								<p>
									Our team has spent decades practicing commercial real estate law at AM Law firms before building Naya Law.
								</p>
							</li>
							<li className={styles.aboutPoint}>
								<span className={styles.aboutPointNum} aria-hidden="true">
									02
								</span>
								<p>
									That background gives Naya experience with complex transactions, but the delivery model is different: value based fees, tech and AI enabled workflows, and no billable-hour at all anywhere.
								</p>
							</li>
							<li className={styles.aboutPoint}>
								<span className={styles.aboutPointNum} aria-hidden="true">
									03
								</span>
								<p>
									The result is the quality lenders expect from a major firm
									with a pricing model built for how legal work should operate in
									the AI era.
								</p>
							</li>
						</ol>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Pricing âââââââââââââ */}
			<section id="pricing" className={styles.section}>
				<Container>
					<div className={styles.split}>
						<div>
							<p className={styles.eyebrow}>Pricing</p>
							<h2 className={`${styles.sectionTitle} ${styles.tunableHeading}`}>
								Know the legal fee before the work starts.
							</h2>
						</div>
						<div className={`${styles.prose} ${styles.proseRight}`}>
							<p>
								For context: large-firm associate rates often run $650–$700 per
								hour, junior partners $1,000+, and top partners $2,000–$3,000.
								Naya's pitch is simple: price the matter based on what it should
								cost, then stand behind that number.
							</p>
						</div>
					</div>

					<div className={styles.priceCompare}>
						<div className={`${styles.priceCard} ${styles.priceCardMuted}`}>
							<p className={styles.priceLabel}>Big Law equivalent</p>
							<p className={styles.priceAmount}>$20K–$30K</p>
							<p className={styles.priceNote}>for similar matters</p>
							<ul className={styles.compareList}>
								<li className={styles.compareCell}>
									<XMark />
									Bills by the hour.
								</li>
								<li className={styles.compareCell}>
									<XMark />
									Fee is known after the work.
								</li>
								<li className={styles.compareCell}>
									<XMark />
									Technology is layered onto old workflows.
								</li>
								<li className={styles.compareCell}>
									<XMark />
									Incentive is to spend more time.
								</li>
							</ul>
						</div>
						<div className={styles.priceCard}>
							<p className={styles.priceLabel}>Naya Law</p>
							<p className={styles.priceAmount} data-beam-target>$5K–$15K</p>
							<p className={styles.priceNote}>typical sub-$10M loan closing</p>
							<ul className={styles.compareList}>
								<li className={styles.compareCell}>
									<CheckMark />
									Fixed fee quoted up front.
								</li>
								<li className={styles.compareCell}>
									<CheckMark />
									Fee structure is known before the work starts.
								</li>
								<li className={styles.compareCell}>
									<CheckMark />
									Technology is built into the operating model.
								</li>
								<li className={styles.compareCell}>
									<CheckMark />
									Incentive is to close efficiently.
								</li>
							</ul>
							<Link href="/pricing" className={styles.priceCardCta} data-beam-hover>
								Get Pricing
							</Link>
						</div>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Platform âââââââââââââ */}
			<section className={`${styles.section} ${styles.alt} ${styles.platformSection}`}>
				<Container>
					<p className={`${styles.eyebrow} ${styles.platformEyebrow}`}>
						Platform
					</p>
					<h2 className={`${styles.sectionTitle} ${styles.platformTitle}`}>
						A law firm running on its own operating{" "}
					<span data-beam-target>system</span>.
					</h2>
					<div className={styles.platformColumns}>
						<p>
							Naya's software is customized for commercial mortgage loan
							transactions, including document automation and workflow support
							tailored to lender requirements.
						</p>
						<p>
							The Naya Closing Services model combines cutting-edge technology
							with an experienced deal team to improve cost efficiency and
							accelerate commercial real estate finance closings.
						</p>
						<p>
							This is the core differentiator: Naya is not just using
							third-party tools — it is building and controlling the platform
							behind the work.
						</p>
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Who It's For âââââââââââââ */}
			<section className={`${styles.section} ${styles.audienceVideoSection}`}>
				<VideoBg src={AUDIENCE_VIDEO} className={styles.sectionVideo} />
				<Container>
					<div className={styles.audienceGrid}>
						<div>
							<p className={styles.eyebrow}>Who it's for</p>
							<h2 className={`${styles.sectionTitle} ${styles.tunableHeading}`}>
								Built for institutional lenders.
							</h2>
							<div className={styles.prose}>
								<p>
									If your team needs predictable legal fees, repeatable
									workflows, and a partner focused specifically on lending
									transactions, Naya fits that profile.
								</p>
							</div>
						</div>
						<AudienceList />
					</div>
				</Container>
			</section>

			{/* âââââââââââââ FAQ âââââââââââââ */}
			<section id="faq" className={`${styles.section} ${styles.faqSection}`}>
				<Container>
					<div className={styles.faqGrid}>
						<div>
							<p className={styles.eyebrow}>FAQ</p>
							<h2 className={styles.faqTitle}>
								Questions lenders ask us.
							</h2>
							<p className={styles.faqLede}>
								Everything firms want to understand before moving a closing
								to Naya.
							</p>
						</div>
						<Faq items={FAQ_ITEMS} />
					</div>
				</Container>
			</section>

			{/* âââââââââââââ Final CTA / Contact âââââââââââââ */}
			<section id="contact" className={styles.finalCta}>
				<VideoBg src={CONTACT_VIDEO} className={styles.sectionVideo} />
				<Container narrow>
					<h2 className={styles.sectionTitle}>
						Ready to close with more certainty?
					</h2>
					<p className={styles.lede}>
						If your team wants fixed-fee commercial real estate closings,
						predictable pricing, and a technology-first legal partner, Naya Law was built for that.
					</p>
					<div className={styles.ctas}>
						<Link href="/pricing" className={styles.primaryCta} data-beam-hover>
							Get Pricing
						</Link>
						<Link href="/contact" className={styles.secondaryCta}>
							Contact Naya Law
						</Link>
					</div>
				</Container>
			</section>
		</>
	);
}
