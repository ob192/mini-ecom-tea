// Keyboard walk. Installs window.__kbd, which records every focus move on the current page; load it
// with the other scripts after each page load (SKILL.md, step 2). `__kbd.reset()` returns how many
// elements are tabbable; press Tab with the browser tool (action `key`, text "Tab", `repeat` = that
// number + 2, at most 100; walk longer pages in several presses) and read `__kbd.report()` —
// `__kbd.report({full: true})` lists every step. Call `__kbd.reset()` again before walking another
// state of the same page (a menu or the cart open): it clears the log and records the unfocused look
// of what that state shows.
//
// It measures focus the way it is drawn: the indicator is whatever changes on the element, its
// parent or grandparent between the unfocused and the focused look (outline, ring, border,
// background, underline). It changes nothing on the page except hiding the Next dev indicator and
// finishing the focus transition of the element it measures, so the ring is read at its final
// colour. Fields are explained in references/criteria.md, "Reading the output".
;(() => {
	const devIndicator = document.querySelector("nextjs-portal")
	if (devIndicator) devIndicator.style.display = "none"
	window.__kbd?.uninstall()

	const FOCUSABLE =
		'a[href], button, input:not([type=hidden]), select, textarea, summary, iframe, [tabindex], [contenteditable=""], [contenteditable=true], audio[controls], video[controls]'
	const shown = (el) =>
		el.checkVisibility ? el.checkVisibility({visibilityProperty: true, opacityProperty: true}) : el.getClientRects().length > 0
	const tabbable = () =>
		[...document.querySelectorAll(FOCUSABLE)].filter((el) => el.tabIndex >= 0 && !el.disabled && !el.closest("[inert]") && shown(el))

	// Any CSS colour → [r, g, b, a] through a canvas, so oklch(), color() and hex all compare alike.
	const ctx = Object.assign(document.createElement("canvas"), {width: 1, height: 1}).getContext("2d", {willReadFrequently: true})
	const rgba = (c) => {
		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = "rgba(0,0,0,0)"
		ctx.fillStyle = c
		ctx.fillRect(0, 0, 1, 1)
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
		return [r, g, b, a / 255]
	}
	const lum = ([r, g, b]) =>
		[r, g, b].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0)
	const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)]
	const contrast = (fg, bg) => {
		const [x, y] = [lum(over(fg, bg)), lum(bg)].sort((p, q) => q - p)
		return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100
	}
	// The solid colour behind an element: the first ancestor (from `el`) with an opaque-enough background.
	const surface = (el) => {
		for (let n = el; n; n = n.parentElement) {
			const c = rgba(getComputedStyle(n).backgroundColor)
			if (c[3] > 0.5) return c
		}
		return [255, 255, 255, 1]
	}
	const selector = (el) => {
		const parts = []
		for (let n = el; n && n !== document.body && parts.length < 3; n = n.parentElement) {
			if (n.id) {
				parts.unshift(`#${CSS.escape(n.id)}`)
				break
			}
			const slot = n.getAttribute("data-slot")
			const cls = [...n.classList].filter((c) => !c.includes(":") && !c.includes("[")).slice(0, 2)
			parts.unshift(n.tagName.toLowerCase() + (slot ? `[data-slot=${slot}]` : cls.length ? "." + cls.map((c) => CSS.escape(c)).join(".") : ""))
		}
		return parts.join(" > ")
	}
	const name = (el) =>
		(
			el.getAttribute("aria-label") ||
			(el.getAttribute("aria-labelledby") || "")
				.split(/\s+/)
				.map((id) => document.getElementById(id)?.textContent || "")
				.join(" ") ||
			[...(el.labels || [])].map((l) => l.textContent).join(" ") ||
			el.textContent ||
			el.querySelector?.("img[alt]")?.alt ||
			el.getAttribute("title") ||
			el.getAttribute("placeholder") ||
			""
		)
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 60)
	const role = (el) => el.getAttribute("role") || {a: "link", button: "button", select: "combobox", textarea: "textbox", summary: "button"}[el.tagName.toLowerCase()] || (el.tagName === "INPUT" ? `input:${el.type}` : el.tagName.toLowerCase())

	const look = (el) => {
		const s = getComputedStyle(el)
		return {
			outline: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 ? `${s.outlineWidth} ${s.outlineColor}` : "",
			outlineColor: s.outlineColor,
			outlineWidth: parseFloat(s.outlineWidth) || 0,
			shadow: s.boxShadow === "none" ? "" : s.boxShadow,
			border: `${s.borderTopWidth} ${s.borderTopColor}`,
			borderColor: s.borderTopColor,
			bg: s.backgroundColor,
			deco: s.textDecorationLine,
		}
	}
	// Box-shadow layers that draw something: [{color, spread}]. A Tailwind ring is a shadow whose
	// spread is the ring width (plus the offset width, drawn as a second layer in the offset colour).
	const layers = (shadow) =>
		shadow
			.split(/,(?![^(]*\))/)
			.map((l) => {
				const color = (l.match(/(?:rgba?|oklch|oklab|lab|lch|hsla?|color)\([^)]*\)|#[0-9a-f]{3,8}/i) || ["transparent"])[0]
				const px = (l.replace(color, "").match(/-?[\d.]+px/g) || []).map(parseFloat)
				return {color: rgba(color), spread: px[3] || 0, inset: /inset/.test(l)}
			})
			.filter((x) => x.color[3] > 0 && x.spread > 0)

	const baseline = new Map()
	const remember = (el) => {
		for (let n = el, i = 0; n && i < 3; n = n.parentElement, i++) if (!baseline.has(n)) baseline.set(n, look(n))
	}
	tabbable().forEach(remember)

	// What changed between the unfocused and the focused look, on the element or the two above it.
	const indicator = (el) => {
		el.getAnimations({subtree: true}).forEach((a) => a.effect?.getComputedTiming().iterations !== Infinity && a.finish())
		// Rendered after the last reset (an overlay or banner that appeared later): no unfocused look to
		// compare with, and one taken now would already be the focused look.
		if (!baseline.has(el)) return {kind: "unknown"}
		const around = surface(el.parentElement || el)
		for (let n = el, i = 0; n && i < 3; n = n.parentElement, i++) {
			const before = baseline.get(n)
			if (!before) continue
			const now = look(n)
			const on = ["self", "parent", "grandparent"][i]
			if (now.outline && now.outline !== before.outline)
				return {kind: "outline", on, width: now.outlineWidth, contrast: contrast(rgba(now.outlineColor), around)}
			if (now.shadow !== before.shadow && now.shadow) {
				const ring = layers(now.shadow)
				if (ring.length) {
					const outer = ring.reduce((a, b) => (b.spread > a.spread ? b : a))
					const offset = ring.filter((l) => l !== outer && contrast(l.color, around) < 1.1).reduce((m, l) => Math.max(m, l.spread), 0)
					return {kind: "ring", on, width: outer.spread - offset, contrast: contrast(outer.color, around)}
				}
			}
			if (now.border !== before.border)
				return {kind: "border", on, width: parseFloat(now.border), contrast: contrast(rgba(now.borderColor), surface(n.parentElement || n)), versusUnfocused: contrast(rgba(now.borderColor), over(rgba(before.borderColor), around))}
			if (now.bg !== before.bg) return {kind: "background", on, contrast: contrast(rgba(now.bg), over(rgba(before.bg), around))}
			if (now.deco !== before.deco) return {kind: "underline", on}
		}
		return {kind: "none"}
	}

	// Sample a 3×3 grid inside the element; a point whose topmost element is not this one (or inside
	// it) is covered. The cover is named by its nearest fixed or sticky ancestor when it has one.
	const covered = (el, r) => {
		let hit = 0
		let by = ""
		for (const fx of [0.15, 0.5, 0.85])
			for (const fy of [0.15, 0.5, 0.85]) {
				const x = r.left + r.width * fx
				const y = r.top + r.height * fy
				if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue
				const top = document.elementFromPoint(x, y)
				if (!top || top === el || el.contains(top) || top.contains(el)) continue
				hit++
				let n = top
				while (n && !["fixed", "sticky"].includes(getComputedStyle(n).position)) n = n.parentElement
				by ||= selector(n || top)
			}
		return hit ? {share: Math.round((hit / 9) * 100), by} : null
	}

	let log = []
	let left = 0
	const onFocus = (e) => {
		const el = e.target
		if (!(el instanceof Element)) return
		const r = el.getBoundingClientRect()
		const prev = log[log.length - 1]
		const step = {
			i: log.length + 1,
			el,
			sel: selector(el),
			role: role(el),
			name: name(el),
			rect: {x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height)},
			visible: shown(el) && r.width > 0 && r.height > 0,
			inViewport: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
			indicator: indicator(el),
			covered: covered(el, r),
			repeat: log.some((s) => s.el === el),
		}
		if (prev) {
			const dy = step.rect.y - prev.rect.y
			const dx = step.rect.x - prev.rect.x
			// Only jumps no reading order explains: half a screen up, or a third of the width back within
			// a row. Going from the bottom of one card to the top of the next is normal and not reported.
			if (dy < -innerHeight / 2 || (Math.abs(dy) < 12 && dx < -innerWidth / 3)) step.jump = `back from #${prev.i} (dy ${dy}, dx ${dx})`
		}
		log.push(step)
	}
	// Focus left the page (to the browser's own UI, after the last element) or fell back to <body>.
	const onBlur = (e) => {
		if (!e.relatedTarget) setTimeout(() => (!document.hasFocus() || document.activeElement === document.body) && left++, 0)
	}
	document.addEventListener("focusin", onFocus, true)
	document.addEventListener("focusout", onBlur, true)

	const line = (s) => {
		const ind = s.indicator
		const mark = ind.kind === "none" ? "NO INDICATOR" : ind.kind === "unknown" ? "indicator unknown (no baseline: __kbd.reset() after opening)" : `${ind.kind}${ind.on === "self" ? "" : "@" + ind.on}${ind.width != null ? ` ${ind.width}px` : ""}${ind.contrast != null ? ` ${ind.contrast}:1` : ""}`
		return `${s.i}. ${s.role} "${s.name}" [${s.sel}] — ${mark}${s.covered ? ` — covered ${s.covered.share}% by ${s.covered.by}` : ""}${s.visible ? "" : " — INVISIBLE"}${s.jump ? ` — jump ${s.jump}` : ""}${s.repeat ? " — again" : ""}`
	}
	const weak = (s) => {
		const ind = s.indicator
		if (ind.kind === "none" || ind.kind === "unknown") return false
		if (ind.kind === "ring" || ind.kind === "outline") return ind.contrast < 3 || ind.width < 2
		if (ind.kind === "border") return ind.contrast < 3 || ind.width < 2
		if (ind.kind === "background") return ind.contrast < 3
		return true // underline only: judge on the screenshot
	}

	window.__kbd = {
		uninstall: () => {
			document.removeEventListener("focusin", onFocus, true)
			document.removeEventListener("focusout", onBlur, true)
		},
		reset: () => {
			log = []
			left = 0
			tabbable().forEach(remember)
			return {tabbable: tabbable().length, next: `press Tab ${Math.min(tabbable().length + 2, 100)} times, then __kbd.report()`}
		},
		report: ({full = false} = {}) => {
			const first = log[0]?.el
			return {
				url: location.href,
				viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
				tabbable: tabbable().length,
				steps: log.length,
				leftDocument: left,
				summary: {
					skipLinkFirst: !!(first && first.matches('a[href^="#"]') && log[0].visible),
					noIndicator: log.filter((s) => s.indicator.kind === "none").map(line),
					weakIndicator: log.filter(weak).map(line),
					covered: log.filter((s) => s.covered).map(line),
					invisible: log.filter((s) => !s.visible).map(line),
					unknown: log.filter((s) => s.indicator.kind === "unknown").length,
					jumps: log.filter((s) => s.jump).map(line),
					notReached: tabbable()
						.filter((el) => !log.some((s) => s.el === el))
						.slice(0, 15)
						.map((el) => `${role(el)} "${name(el)}" [${selector(el)}]`),
				},
				...(full ? {walk: log.map(line)} : {}),
			}
		},
	}
})()
