// Text size, text spacing and motion. Defines window.__adapt; load it with the other scripts after each
// page load (SKILL.md, step 2), then:
//   await __adapt("text200")   root font size 200%: text set in rem grows, text set in px does not (1.4.4)
//   await __adapt("spacing")   the WCAG 1.4.12 text-spacing override: line height 1.5, paragraph
//                              spacing 2em, letter spacing 0.12em, word spacing 0.16em
//   await __adapt("motion")    what moves on its own: running animations, autoplaying media (2.2.2)
// "text200" and "spacing" report the text that is clipped with the change but was not before, and
// restore the page. Pass {keep: true} to leave the change applied for a screenshot, then
// `await __adapt("reset")`. Fields are explained in references/criteria.md, "Reading the output".
window.__adapt = async (mode, {root = "body", keep = false} = {}) => {
	const scope = document.querySelector(root) || document.body
	const STYLE_ID = "__adapt-style"
	const reset = () => {
		document.getElementById(STYLE_ID)?.remove()
		document.documentElement.style.removeProperty("font-size")
	}
	const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
	const shown = (el) =>
		el.checkVisibility ? el.checkVisibility({visibilityProperty: true, opacityProperty: true}) : el.getClientRects().length > 0
	const selector = (el) => {
		const parts = []
		for (let n = el; n && n !== document.body && parts.length < 3; n = n.parentElement) {
			if (n.id) {
				parts.unshift(`#${CSS.escape(n.id)}`)
				break
			}
			const cls = [...n.classList].filter((c) => !c.includes(":") && !c.includes("[")).slice(0, 2)
			parts.unshift(n.tagName.toLowerCase() + (cls.length ? "." + cls.map((c) => CSS.escape(c)).join(".") : ""))
		}
		return parts.join(" > ")
	}
	// Elements that hold text of their own (a non-empty text node as a direct child).
	const texts = () =>
		[...scope.querySelectorAll("*")].filter(
			(el) => shown(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
		)
	// Clipped: the element's own box hides overflow it has, or a hiding ancestor (up to 4 levels)
	// cuts the element's box. Line clamps and `truncate` count — they are compared before and after.
	const clipped = (el) => {
		const s = getComputedStyle(el)
		const hides = (st) => /hidden|clip/.test(st.overflowX + st.overflowY)
		if (hides(s) && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) return "own box"
		const r = el.getBoundingClientRect()
		for (let n = el.parentElement, i = 0; n && i < 4; n = n.parentElement, i++) {
			if (!hides(getComputedStyle(n))) continue
			const p = n.getBoundingClientRect()
			if (r.bottom > p.bottom + 1 || r.right > p.right + 1 || r.top < p.top - 1 || r.left < p.left - 1) return `cut by ${selector(n)}`
		}
		return ""
	}
	const snapshot = () => new Map(texts().map((el) => [el, {clip: clipped(el), size: parseFloat(getComputedStyle(el).fontSize)}]))
	const text = (el) => el.textContent.replace(/\s+/g, " ").trim().slice(0, 50)

	if (mode === "reset") {
		reset()
		return {reset: true}
	}

	if (mode === "motion") {
		const running = document
			.getAnimations()
			.filter((a) => a.playState === "running")
			.map((a) => {
				const t = a.effect?.getComputedTiming()
				const target = a.effect?.target
				return {
					name: a.animationName || a.transitionProperty || a.constructor.name,
					target: target instanceof Element ? selector(target) : "",
					infinite: t?.iterations === Infinity,
					seconds: t && isFinite(t.endTime) ? Math.round(t.endTime / 100) / 10 : null,
				}
			})
			.filter((a) => a.infinite || a.seconds > 5)
		const media = [...document.querySelectorAll("video, audio")].map((m) => ({
			target: selector(m),
			autoplay: m.autoplay,
			playing: !m.paused,
			muted: m.muted,
			controls: m.controls,
		}))
		const carousels = [...document.querySelectorAll('[aria-roledescription="carousel"], [data-slot=carousel], [data-embla], .embla')].map(
			(c) => ({
				target: selector(c),
				pauseControl: [...c.querySelectorAll("button")].some((b) => /pause|stop|anhalten|pausieren|arrêter|pausa|ferma/i.test(b.textContent + (b.getAttribute("aria-label") || ""))),
			}),
		)
		return {
			reducedMotionPreferred: matchMedia("(prefers-reduced-motion: reduce)").matches,
			running,
			media,
			carousels,
			note: "Autoplay driven by JavaScript timers is invisible here: watch the page for 10 s and search the code (SKILL.md, step 6).",
		}
	}

	if (mode !== "text200" && mode !== "spacing") throw new Error(`unknown mode ${mode}: text200, spacing, motion or reset`)
	reset()
	await settle()
	const before = snapshot()
	if (mode === "text200") document.documentElement.style.fontSize = "200%"
	else
		document.head.appendChild(
			Object.assign(document.createElement("style"), {
				id: STYLE_ID,
				textContent:
					"* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
			}),
		)
	await settle()
	const after = snapshot()
	const newlyClipped = [...after]
		.filter(([el, a]) => a.clip && !before.get(el)?.clip)
		.map(([el, a]) => `"${text(el)}" [${selector(el)}] — ${a.clip}`)
	const notScaled =
		mode === "text200"
			? [...after].filter(([el, a]) => before.has(el) && a.size <= before.get(el).size * 1.05).map(([el, a]) => `${a.size}px "${text(el)}" [${selector(el)}]`)
			: []
	const horizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth
	if (!keep) reset()
	return {
		mode,
		viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
		kept: keep,
		horizontalScroll,
		newlyClipped: newlyClipped.slice(0, 30),
		newlyClippedCount: newlyClipped.length,
		...(mode === "text200" ? {notScaledCount: notScaled.length, notScaled: notScaled.slice(0, 20)} : {}),
	}
}
