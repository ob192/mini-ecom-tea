// Layout measurements for a design audit. Evaluate the whole file in the page once (it survives
// viewport resizes), then call `measure("<css selector>")`. Read-only; returns plain JSON.
// Positions are relative to the target's top-left (`rx`, `ry`) so bars above it do not skew them.
window.measure = (selector = "main") => {
	const root = document.querySelector(selector)
	if (!root) return {error: `no element for ${selector}`}
	const vw = document.documentElement.clientWidth
	const vh = window.innerHeight
	const R = root.getBoundingClientRect()

	// Any CSS colour (oklab, color-mix, alpha) to rgba through a canvas.
	const ctx = document.createElement("canvas").getContext("2d", {willReadFrequently: true})
	const rgba = (css) => {
		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = css
		ctx.fillRect(0, 0, 1, 1)
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
		return `rgba(${r},${g},${b},${+(a / 255).toFixed(2)})`
	}
	const visible = (el) => {
		const s = getComputedStyle(el)
		const b = el.getBoundingClientRect()
		return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0
	}
	const text = (el) => (el.innerText || el.getAttribute("alt") || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 50)
	const box = (b) => ({rx: Math.round(b.left - R.left), ry: Math.round(b.top - R.top), w: Math.round(b.width), h: Math.round(b.height)})
	// Rendered text lines: the line boxes of the element's text nodes only (child spans, icons and padding
	// add boxes of their own), merged when they overlap vertically — a bold span sits a pixel off its line.
	const lines = (el) => {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
		const rects = []
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (!node.textContent.trim()) continue
			const range = document.createRange()
			range.selectNodeContents(node)
			rects.push(...[...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1))
		}
		rects.sort((a, b) => a.top - b.top)
		let count = 0
		let bottom = -Infinity
		for (const r of rects) {
			if (r.top >= bottom - r.height / 2) count++
			bottom = Math.max(bottom, r.bottom)
		}
		return count
	}

	const SEL = "h1,h2,h3,h4,p,li,a,button,img,video,svg[role=img],dt,dd,label,input"
	const items = [...root.querySelectorAll(SEL)]
		.filter(visible)
		.filter((el) => !el.parentElement?.closest(SEL) || el.matches("img,video,input"))
		.map((el) => {
			const s = getComputedStyle(el)
			const b = el.getBoundingClientRect()
			const item = {tag: el.tagName.toLowerCase(), text: text(el), ...box(b)}
			if (!el.matches("img,video,input")) {
				item.font = `${s.fontSize}/${s.lineHeight} ${s.fontWeight}`
				item.lines = lines(el)
				item.color = rgba(s.color)
				if (el.matches("p,li,dd")) item.chPerLine = Math.round(el.innerText.length / Math.max(1, item.lines))
			}
			if (el.matches("img")) {
				const served = el.naturalWidth
				item.served = `${served}x${el.naturalHeight} (${el.currentSrc.split("?")[0].split("/").pop() || el.currentSrc.slice(0, 60)})`
				item.servedScale = +(served / (b.width * devicePixelRatio)).toFixed(2) // < 1 is soft; check the original file's width too
				item.bleedRight = Math.max(0, Math.round(b.right - vw))
				item.bleedPct = Math.round((item.bleedRight / b.width) * 100)
			}
			return item
		})

	// Vertical gaps between siblings of every column-stacked flex/grid container in the target.
	const gaps = [...root.querySelectorAll("*")]
		.filter((el) => {
			const s = getComputedStyle(el)
			return visible(el) && ((s.display.includes("flex") && s.flexDirection.startsWith("column")) || s.display.includes("grid")) && el.children.length > 1
		})
		.map((el) => {
			const kids = [...el.children].filter(visible).map((k) => ({tag: k.tagName.toLowerCase(), b: k.getBoundingClientRect()}))
			const stacked = kids.slice(1).filter((k, i) => k.b.top >= kids[i].b.bottom - 1)
			if (!stacked.length) return null
			return {
				parent: `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")}`,
				steps: kids.slice(1).map((k, i) => `${kids[i].tag}→${k.tag} ${Math.round(k.b.top - kids[i].b.bottom)}`),
			}
		})
		.filter(Boolean)

	// Gutters include negatives (content past the edge); overflow lists boxes whose content is wider than they are.
	const content = items.filter((i) => !i.bleedRight && i.tag !== "img")
	const gutters = {
		left: Math.min(...content.map((i) => i.rx + R.left)),
		right: Math.min(...content.map((i) => vw - (i.rx + R.left + i.w))),
	}
	// Skipped: boxes inside a deliberate clip (an ancestor with overflow-x hidden or clip), and boxes whose
	// only overflowing children are SVGs (a rotated dial reports a wider scroll box than it paints).
	const clippedAbove = (el) => {
		for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (/hidden|clip/.test(getComputedStyle(a).overflowX)) return true
		return false
	}
	const svgOnly = (el) => {
		const b = el.getBoundingClientRect()
		const out = [...el.children].filter((c) => {
			const k = c.getBoundingClientRect()
			return k.right > b.right + 1 || k.left < b.left - 1
		})
		return out.length > 0 && out.every((c) => c.matches("svg"))
	}
	const overflow = [...root.querySelectorAll("*")]
		.filter((el) => visible(el) && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === "visible" && !el.matches("svg,svg *,img") && !clippedAbove(el) && !svgOnly(el))
		.slice(0, 10)
		.map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")}: ${el.scrollWidth} > ${el.clientWidth}`)

	// Composition: how the content uses the target. A backdrop (media over most of the target) is not content;
	// surfaces (cards, buttons: a background, border or shadow) count as content even when their text is in spans.
	// The site header is left out: the space under it is the band's top padding, not an empty zone.
	const area = R.width * R.height
	const isBackdrop = (b) => b.width * b.height > area * 0.8
	const painted = (el) => {
		const s = getComputedStyle(el)
		return rgba(s.backgroundColor).endsWith(",0)") === false || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== "none"
	}
	const clip = (b) => {
		const l = Math.max(b.left, R.left, 0)
		const r = Math.min(b.right, R.right, vw)
		const t = Math.max(b.top, R.top)
		const bt = Math.min(b.bottom, R.bottom)
		return r > l && bt > t ? {l, r, t, b: bt} : null
	}
	const banner = (el) => el.closest("header,[role=banner]")
	const header = [...root.querySelectorAll("header,[role=banner]")].filter(visible).pop()
	const shown = [
		...[...root.querySelectorAll(SEL)].filter(visible),
		...[...root.querySelectorAll("div,span,li,figure")].filter((el) => visible(el) && painted(el)),
	]
		.filter((el) => !banner(el) || !root.contains(banner(el)))
		.map((el) => ({el, b: el.getBoundingClientRect()}))
		.filter(({b}) => !isBackdrop(b))
		.map(({el, b}) => ({tag: el.tagName.toLowerCase(), c: clip(b)}))
		.filter((i) => i.c)
	const union = (list) =>
		list.length
			? {l: Math.min(...list.map((i) => i.c.l)), r: Math.max(...list.map((i) => i.c.r)), t: Math.min(...list.map((i) => i.c.t)), b: Math.max(...list.map((i) => i.c.b))}
			: null
	const cb = union(shown)
	const composition = {}
	if (cb) {
		const cw = cb.r - cb.l
		const ch = cb.b - cb.t
		const tb = union(shown.filter((i) => /^(h[1-4]|p|li)$/.test(i.tag)))
		const media = shown.filter((i) => i.tag === "img" || i.tag === "video")
		composition.contentBox = {rx: Math.round(cb.l - R.left), ry: Math.round(cb.t - R.top), w: Math.round(cw), h: Math.round(ch)}
		if (tb) composition.textBox = {rx: Math.round(tb.l - R.left), ry: Math.round(tb.t - R.top), w: Math.round(tb.r - tb.l), h: Math.round(tb.b - tb.t)}
		// The band's padding as seen: from the header (or the target's top) to the content, and from the content to the bottom.
		composition.padding = {top: Math.round(cb.t - (header ? header.getBoundingClientRect().bottom : R.top)), bottom: Math.round(R.bottom - cb.b)}
		composition.textShare = tb ? +((tb.r - tb.l) / cw).toFixed(2) : 0
		// The widest visible media, clipped to the screen: what the eye gets, not the image box.
		composition.mediaShare = media.length ? +(Math.max(...media.map((i) => i.c.r - i.c.l)) / cw).toFixed(2) : 0
		// Largest empty rectangle inside the content box, on an 8px grid (maximal rectangle over a histogram).
		const S = 8
		const cols = Math.ceil(cw / S)
		const rows = Math.ceil(ch / S)
		const heights = new Array(cols).fill(0)
		let best = {area: 0}
		for (let y = 0; y < rows; y++) {
			const cy = cb.t + y * S + S / 2
			for (let x = 0; x < cols; x++) {
				const cx = cb.l + x * S + S / 2
				const covered = shown.some((i) => cx >= i.c.l && cx <= i.c.r && cy >= i.c.t && cy <= i.c.b)
				heights[x] = covered ? 0 : heights[x] + 1
			}
			const stack = []
			for (let x = 0; x <= cols; x++) {
				const h = x < cols ? heights[x] : 0
				while (stack.length && heights[stack[stack.length - 1]] >= h) {
					const top = stack.pop()
					const left = stack.length ? stack[stack.length - 1] + 1 : 0
					const a = heights[top] * (x - left)
					if (heights[top] && a > best.area) best = {area: a, x: left, y: y - heights[top] + 1, w: x - left, h: heights[top]}
				}
				if (x < cols) stack.push(x)
			}
		}
		if (best.area)
			composition.largestEmpty = {
				rx: Math.round(cb.l - R.left + best.x * S),
				ry: Math.round(cb.t - R.top + best.y * S),
				w: best.w * S,
				h: best.h * S,
				areaPct: Math.round(((best.w * best.h * S * S) / (cw * ch)) * 100),
				wPct: Math.round(((best.w * S) / cw) * 100),
				hPct: Math.round(((best.h * S) / ch) * 100),
			}
	}
	// Things laid over the bottom edge of a band (the target, or a full-width painted block in it): the share above the edge.
	const bands = [root, ...root.querySelectorAll("section,header,footer,div")].filter((el) => {
		const b = el.getBoundingClientRect()
		return visible(el) && b.width >= vw * 0.95 && (el === root || painted(el) || [...el.querySelectorAll("img,video")].some((m) => isBackdrop(m.getBoundingClientRect()) || m.getBoundingClientRect().width >= b.width * 0.95))
	})
	const edges = [...new Set(bands.map((el) => Math.round(el.getBoundingClientRect().bottom)))]
	composition.straddle = edges.flatMap((edge) =>
		[...document.body.querySelectorAll("*")]
			.filter((el) => {
				const b = el.getBoundingClientRect()
				if (!visible(el) || el.contains(root) || b.width * b.height > area * 0.5) return false
				if (!(b.top < edge - 4 && b.bottom > edge + 4)) return false
				if (!(painted(el) || el.matches("img,video"))) return false
				const p = el.parentElement.getBoundingClientRect()
				return !(p.top < edge - 4 && p.bottom > edge + 4 && painted(el.parentElement))
			})
			.slice(0, 6)
			.map((el) => {
				const b = el.getBoundingClientRect()
				return {edge: Math.round(edge - R.top), text: text(el).slice(0, 30), w: Math.round(b.width), abovePct: Math.round(((edge - b.top) / b.height) * 100)}
			}),
	)

	// Overlays: surfaces with text laid over the media (cards on a photo; a ground shadow is not one) — how
	// much of it they cover, and how close they come to the text. `clearance` is the gap to the nearest heading or paragraph; 0 means touching.
	const mediaEls = [...root.querySelectorAll("img,video")].filter((m) => visible(m) && !isBackdrop(m.getBoundingClientRect()))
	const texts = [...root.querySelectorAll("h1,h2,h3,h4,p")].filter(visible)
	const hits = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
	const gap = (a, b) => Math.round(Math.hypot(Math.max(0, a.left - b.right, b.left - a.right), Math.max(0, a.top - b.bottom, b.top - a.bottom)))
	composition.overlays = mediaEls.flatMap((m) => {
		const mb = m.getBoundingClientRect()
		return [...document.body.querySelectorAll("div,figure,aside")]
			.filter((el) => visible(el) && painted(el) && text(el) && !el.contains(m) && !m.contains(el) && !isBackdrop(el.getBoundingClientRect()) && hits(el.getBoundingClientRect(), mb))
			.filter((el) => !(painted(el.parentElement) && hits(el.parentElement.getBoundingClientRect(), mb) && !el.parentElement.contains(m)))
			.slice(0, 6)
			.map((el) => {
				const b = el.getBoundingClientRect()
				const ix = Math.max(0, Math.min(b.right, mb.right) - Math.max(b.left, mb.left))
				const iy = Math.max(0, Math.min(b.bottom, mb.bottom) - Math.max(b.top, mb.top))
				const near = texts.filter((t) => !el.contains(t))
				return {
					text: text(el).slice(0, 30),
					coversPct: Math.round(((ix * iy) / (mb.width * mb.height)) * 100),
					clearance: near.length ? Math.min(...near.map((t) => gap(b, t.getBoundingClientRect()))) : null,
				}
			})
	})
	// Past the container: media and overlays that run beyond the container's inner edge. Reaching the screen
	// edge is a bleed; stopping short of it is an overhang that misses both edges.
	// The container: the first wide box with a fixed max-width (`max-w-6xl`), not a `max-width: 100%` image.
	const container = [...root.querySelectorAll("*")].find((el) => /px$/.test(getComputedStyle(el).maxWidth) && el.getBoundingClientRect().width >= vw * 0.5)
	if (container) {
		const cs = getComputedStyle(container)
		const cr = container.getBoundingClientRect()
		const inner = {l: cr.left + parseFloat(cs.paddingLeft), r: cr.right - parseFloat(cs.paddingRight)}
		const loose = [...mediaEls, ...[...document.body.querySelectorAll("div,figure,aside")].filter((el) => visible(el) && painted(el) && text(el) && mediaEls.some((m) => hits(el.getBoundingClientRect(), m.getBoundingClientRect())) && !el.contains(root))]
		composition.pastContainer = loose
			.filter((el) => !loose.some((o) => o !== el && o.contains(el)))
			.map((el) => {
				const b = el.getBoundingClientRect()
				const past = Math.round(Math.max(b.right - inner.r, inner.l - b.left))
				return {tag: el.tagName.toLowerCase(), text: text(el).slice(0, 30), px: past, reachesEdge: b.right >= vw - 1 || b.left <= 1}
			})
			.filter((i) => i.px > 4)
			.slice(0, 6)
	}

	return {
		viewport: `${vw}x${vh}`,
		composition,
		target: {top: Math.round(R.top + scrollY), w: Math.round(R.width), h: Math.round(R.height), ofViewport: +(R.height / vh).toFixed(2)},
		gutters,
		firstScreen: items.filter((i) => i.ry < vh).map((i) => `${i.tag}: ${i.text}`),
		items,
		gaps,
		overflow,
		horizontalScroll: document.documentElement.scrollWidth > vw,
	}
}
