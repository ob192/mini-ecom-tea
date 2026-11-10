// Замер мобильной эргономики. Определяет window.__mux и сразу вызывает его на текущем
// состоянии страницы. Передавать текст целиком в mcp__Claude_Browser__javascript_tool один раз
// после каждой загрузки страницы; следующие состояния той же страницы (открыл меню, переключил
// вкладку) мерить коротким вызовом `await __mux()` или `await __mux({root: "<css-селектор>"})`.
//
// Страницу не меняет, кроме одного: прячет индикатор Next dev (nextjs-portal) — это инструмент
// разработки, на проде его нет, а в углу экрана он перекрывает кнопки.
// Пороги и трактовка полей — references/criteria.md.
window.__mux = async ({root, min = 24, rec = 44} = {}) => {
	// Дождаться конца анимаций открытия (fade/zoom у Radix): пока они идут, оверлей прозрачен и
	// его цели не считаются видимыми. Бесконечные анимации (спиннеры) не ждём, потолок — 2 с.
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
	const running = document
		.getAnimations()
		.filter((a) => a.playState === "running" && isFinite(a.effect?.getComputedTiming().endTime))
	await Promise.race([
		Promise.all(running.map((a) => a.finished.catch(() => {}))),
		new Promise((r) => setTimeout(r, 2000)),
	])

	const devIndicator = document.querySelector("nextjs-portal")
	if (devIndicator) devIndicator.style.display = "none"

	// Реальная ширина страницы. При переполнении мобильная эмуляция Chrome расширяет layout
	// viewport (innerWidth растёт до ширины контента), поэтому innerWidth врёт ровно тогда, когда
	// есть горизонтальный скролл.
	const vw = document.documentElement.clientWidth
	const vh = document.documentElement.clientHeight

	// Область замера: явный root, иначе верхний открытый поповер или меню, иначе верхний открытый
	// диалог, иначе документ. Цели под оверлеем меряются в базовом состоянии, не здесь.
	// Только видимые: всегда смонтированное скрытое меню с aria-modal не должно забирать область.
	const open = (el) => (el.checkVisibility ? el.checkVisibility({visibilityProperty: true, opacityProperty: true}) : el.getClientRects().length > 0)
	const last = (sel) => [...document.querySelectorAll(sel)].filter(open).pop()
	const scope =
		(root && document.querySelector(root)) ||
		last(
			"[data-slot=popover-content][data-state=open], [role=menu][data-state=open], [role=listbox][data-state=open]",
		) ||
		last("[role=dialog][data-state=open], [aria-modal=true]") ||
		document.body

	const TARGETS = [
		"a[href]",
		"button",
		"input:not([type=hidden])",
		"select",
		"textarea",
		"summary",
		"label[for]",
		"[role=button]",
		"[role=link]",
		"[role=tab]",
		"[role=menuitem]",
		"[role=menuitemcheckbox]",
		"[role=menuitemradio]",
		"[role=option]",
		"[role=checkbox]",
		"[role=radio]",
		"[role=switch]",
		"[role=slider]",
		"[contenteditable=true]",
		"[tabindex]:not([tabindex='-1'])",
	].join(",")

	const rectOf = (el) => el.getBoundingClientRect()
	const visible = (el) => {
		const r = rectOf(el)
		if (r.width <= 2 || r.height <= 2) return false
		const cs = getComputedStyle(el)
		if (cs.display === "none" || cs.visibility === "hidden") return false
		// sr-only: clip/clip-path, обрезающие элемент до точки.
		if (/rect\(0(px)?,?\s*0(px)?/.test(cs.clip) || /inset\(50%\)/.test(cs.clipPath)) return false
		return el.checkVisibility
			? el.checkVisibility({opacityProperty: true, visibilityProperty: true})
			: +cs.opacity > 0
	}
	// Есть в раскладке, но прозрачен (обычно opacity-0 до hover) — кандидат в hover-only.
	const transparent = (el) => {
		const r = rectOf(el)
		if (r.width <= 2 || r.height <= 2) return false
		const cs = getComputedStyle(el)
		if (cs.display === "none" || cs.visibility === "hidden") return false
		return !!el.checkVisibility && !el.checkVisibility({opacityProperty: true})
	}
	const isFixed = (el) => {
		for (let n = el; n && n !== document.body; n = n.parentElement)
			if (["fixed", "sticky"].includes(getComputedStyle(n).position)) return true
		return false
	}
	const disabled = (el) => el.disabled === true || el.getAttribute("aria-disabled") === "true"

	const accName = (el) =>
		(
			el.getAttribute("aria-label") ||
			(el.getAttribute("aria-labelledby") &&
				el
					.getAttribute("aria-labelledby")
					.split(/\s+/)
					.map((id) => document.getElementById(id)?.textContent || "")
					.join(" ")) ||
			el.innerText ||
			el.getAttribute("title") ||
			el.querySelector("img[alt]")?.getAttribute("alt") ||
			el.getAttribute("placeholder") ||
			(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent) ||
			""
		)
			.replace(/\s+/g, " ")
			.trim()
	const label = (el) => accName(el).slice(0, 40) || el.getAttribute("href") || ""

	const path = (el) => {
		const parts = []
		for (let n = el; n && n !== document.body && parts.length < 4; n = n.parentElement) {
			const cls = [...n.classList]
				.filter((c) => !/[:[(]/.test(c))
				.slice(0, 2)
				.join(".")
			parts.unshift(n.tagName.toLowerCase() + (cls ? "." + cls : ""))
		}
		return parts.join(" > ")
	}
	// Как искать в коде: data-slot/size/variant примитива shadcn, иначе классы.
	const source = (el) => {
		const d = el.dataset
		const prim = [d.slot, d.size && `size=${d.size}`, d.variant && `variant=${d.variant}`].filter(Boolean).join(" ")
		return {primitive: prim || null, classes: (el.getAttribute("class") || "").slice(0, 120)}
	}

	// Ссылка внутри предложения — исключение Inline из 2.5.8.
	const isInline = (el) => {
		if (getComputedStyle(el).display !== "inline") return false
		const p = el.parentElement
		return !!p && [...p.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0)
	}

	// Цель перекрыта, если в точке её центра сверху лежит что-то постороннее. Проверяется только
	// для целей в текущем экране: elementFromPoint за его пределами не работает.
	const hitAt = (el) => {
		const r = rectOf(el)
		const x = r.left + r.width / 2
		const y = r.top + r.height / 2
		if (x < 0 || y < 0 || x >= vw || y >= vh) return null
		const hit = document.elementFromPoint(x, y)
		return hit && !el.contains(hit) && !hit.contains(el) ? hit : null
	}

	let nodes = [...scope.querySelectorAll(TARGETS)]

	// <div onClick>: элемент, от которого начинается cursor:pointer, сам не цель и не внутри цели.
	const pseudo = [...scope.querySelectorAll("div,span,li,img,svg,p")].filter((el) => {
		if (getComputedStyle(el).cursor !== "pointer") return false
		if (el.parentElement && getComputedStyle(el.parentElement).cursor === "pointer") return false
		return !el.closest(TARGETS) && !el.querySelector(TARGETS)
	})
	nodes.push(...pseudo)

	nodes = nodes.filter((el) => visible(el) || (disabled(el) && rectOf(el).width > 2))
	// Контейнер с собственными целями внутри (tablist с tabindex) — не цель; меряются вложенные.
	nodes = nodes.filter(
		(el) => el.tagName === "LABEL" || el.tagName === "A" || !nodes.some((o) => o !== el && el.contains(o)),
	)
	// Вложенная цель того же размера — дубль внешней.
	nodes = nodes.filter((el) => {
		const outer = el.parentElement?.closest(TARGETS)
		if (!outer || !nodes.includes(outer)) return true
		const r = rectOf(el)
		const o = rectOf(outer)
		return !(Math.abs(o.width - r.width) <= 1 && Math.abs(o.height - r.height) <= 1)
	})

	const covered = []
	const targets = []
	for (const el of nodes) {
		const r = rectOf(el)
		const hit = hitAt(el)
		if (hit) {
			covered.push({
				label: label(el),
				size: `${Math.round(r.width)}x${Math.round(r.height)}`,
				coveredBy: path(hit),
			})
			continue
		}
		const fixed = isFixed(el)
		const dx = fixed ? 0 : scrollX
		const dy = fixed ? 0 : scrollY
		targets.push({
			el,
			w: Math.round(r.width),
			h: Math.round(r.height),
			cx: r.left + dx + r.width / 2,
			cy: r.top + dy + r.height / 2,
			r: {left: r.left + dx, right: r.right + dx, top: r.top + dy, bottom: r.bottom + dy},
			firstScreen: fixed ? r.top < vh && r.bottom > 0 : r.top + scrollY < vh,
			inline: isInline(el),
			pseudo: pseudo.includes(el),
			disabled: disabled(el),
		})
	}

	const undersized = (t) => t.w < min || t.h < min
	const distToRect = (x, y, r) =>
		Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom))
	const unrelated = (a, b) => a !== b && !a.el.contains(b.el) && !b.el.contains(a.el)

	// Исключение по отступу (2.5.8): круг Ø24px с центром в цели не задевает другие цели и круги
	// других маленьких целей.
	const passesSpacing = (t) =>
		targets.every((o) => {
			if (!unrelated(o, t) || o.disabled) return true
			if (Math.abs(o.cx - t.cx) > 300 || Math.abs(o.cy - t.cy) > 300) return true
			if (distToRect(t.cx, t.cy, o.r) < min / 2) return false
			return !undersized(o) || Math.hypot(o.cx - t.cx, o.cy - t.cy) >= min
		})
	// Соседняя цель ближе 8px (Material: 8dp).
	const tightNeighbour = (t) =>
		targets.some((o) => {
			if (!unrelated(o, t)) return false
			const gapX = Math.max(o.r.left - t.r.right, t.r.left - o.r.right)
			const gapY = Math.max(o.r.top - t.r.bottom, t.r.top - o.r.bottom)
			return gapX < 8 && gapY < 8 && Math.max(gapX, gapY) >= 0
		})

	const groups = new Map()
	for (const t of targets) {
		if (t.inline) continue
		let level
		if (undersized(t)) level = passesSpacing(t) ? "small-spaced" : "fail-2.5.8"
		else if (t.w < rec || t.h < rec) level = "below-44"
		else continue
		const src = source(t.el)
		// Ширина у кнопок с текстом гуляет: группа — по примитиву (или классам) и высоте.
		const sig = src.primitive || src.classes.split(" ").slice(0, 6).join(" ") || path(t.el)
		const key = [level, t.el.tagName, sig, t.h, t.disabled].join("|")
		const g = groups.get(key) || {
			level,
			tag: t.el.tagName.toLowerCase(),
			h: t.h,
			wMin: t.w,
			wMax: t.w,
			label: label(t.el),
			path: path(t.el),
			...src,
			count: 0,
			tightNeighbours: 0,
			firstScreen: false,
			nonSemantic: t.pseudo,
			disabled: t.disabled,
		}
		g.count++
		g.wMin = Math.min(g.wMin, t.w)
		g.wMax = Math.max(g.wMax, t.w)
		if (tightNeighbour(t)) g.tightNeighbours++
		if (t.firstScreen) g.firstScreen = true
		groups.set(key, g)
	}
	const order = {"fail-2.5.8": 0, "small-spaced": 1, "below-44": 2}
	const targetGroups = [...groups.values()]
		.map(({wMin, wMax, h, ...g}) => ({...g, size: `${wMin === wMax ? wMin : `${wMin}–${wMax}`}x${h}`}))
		.sort((a, b) => order[a.level] - order[b.level] || b.count - a.count)

	// Цели без доступного имени (иконка без aria-label) и <div onClick> без роли.
	const unnamed = targets
		.filter((t) => !t.inline && !accName(t.el))
		.map((t) => ({size: `${t.w}x${t.h}`, path: path(t.el), ...source(t.el)}))
	const nonSemantic = targets
		.filter((t) => t.pseudo)
		.map((t) => ({label: label(t.el), size: `${t.w}x${t.h}`, path: path(t.el)}))

	// Прозрачные цели — показываются только по hover (на телефоне — никогда).
	const invisibleTargets = [...scope.querySelectorAll(TARGETS)]
		.filter(transparent)
		.slice(0, 15)
		.map((el) => ({label: label(el), path: path(el), ...source(el)}))

	// Поля ввода: шрифт < 16px — iOS Safari зумит страницу при фокусе.
	const inputs = [...scope.querySelectorAll("input:not([type=hidden]),textarea,select,[contenteditable=true]")]
		.filter(visible)
		.filter((el) => !["checkbox", "radio", "range", "color", "file", "submit", "button"].includes(el.type))
		.map((el) => ({
			label: label(el),
			fontSize: parseFloat(getComputedStyle(el).fontSize),
			size: `${Math.round(rectOf(el).width)}x${Math.round(rectOf(el).height)}`,
			type: el.type || el.tagName.toLowerCase(),
			inputmode: el.getAttribute("inputmode"),
			autocomplete: el.getAttribute("autocomplete"),
			enterkeyhint: el.getAttribute("enterkeyhint"),
			path: path(el),
		}))

	// Горизонтальный скролл страницы и кто вылезает за правый край (самые внешние).
	const clipped = (el) => {
		for (let n = el.parentElement; n && n !== document.body; n = n.parentElement)
			if (getComputedStyle(n).overflowX !== "visible") return true
		return false
	}
	const sticking = [...document.body.querySelectorAll("*")].filter((el) => {
		const r = rectOf(el)
		return r.width > 0 && r.right > vw + 1 && !clipped(el)
	})
	const overflowers = sticking
		.filter((el) => !sticking.some((o) => o !== el && o.contains(el)))
		.slice(0, 8)
		.map((el) => ({path: path(el), right: Math.round(rectOf(el).right), ...source(el)}))

	// Мелкий текст: элементы с собственным текстом и font-size < 12px.
	const smallText = new Map()
	for (const el of scope.querySelectorAll("*")) {
		if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
		if (!visible(el)) continue
		const fs = parseFloat(getComputedStyle(el).fontSize)
		if (fs >= 12) continue
		const k = `${fs}|${el.tagName}`
		const s = smallText.get(k) || {
			fontSize: fs,
			tag: el.tagName.toLowerCase(),
			count: 0,
			example: el.textContent.trim().slice(0, 30),
			path: path(el),
		}
		s.count++
		smallText.set(k, s)
	}

	// Закреплённые панели: сколько экрана реально занято. Подложки (fixed на весь экран без
	// своих целей) и всё внутри открытого диалога не считаются. tallerThanScreen — fixed-блок выше
	// экрана без собственной прокрутки: часть его содержимого недостижима.
	const pinned = [...document.body.querySelectorAll("*")]
		.filter((el) => ["fixed", "sticky"].includes(getComputedStyle(el).position) && visible(el))
		.map((el) => {
			const r = rectOf(el)
			const cs = getComputedStyle(el)
			const visibleH = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
			return {
				el,
				position: cs.position,
				path: path(el),
				size: `${Math.round(r.width)}x${Math.round(r.height)}`,
				screenShare: Math.round((visibleH / vh) * 100),
				tallerThanScreen: r.height > vh + 1 && !/(auto|scroll)/.test(cs.overflowY),
				// Подложка модалки или пустой контейнер (тосты, порталы) — не панель.
				backdrop:
					(r.width >= vw - 1 && r.height >= vh - 1 && !el.querySelector(TARGETS)) ||
					(!el.textContent.trim() && !el.querySelector("img,svg,video,canvas,button,input")),
				inDialog: !!el.parentElement?.closest("[role=dialog]"),
			}
		})
		.filter((p) => !p.backdrop && !p.inDialog && (p.screenShare > 0 || p.tallerThanScreen))
		.map(({el, backdrop, inDialog, ...p}) => p)

	const meta = document.querySelector("meta[name=viewport]")?.content || ""
	const maxScale = parseFloat((meta.match(/maximum-scale\s*=\s*([\d.]+)/) || [])[1])
	const sum = (lvl) => targetGroups.filter((g) => g.level === lvl).reduce((s, g) => s + g.count, 0)

	return {
		url: location.pathname + location.search,
		scope: scope === document.body ? "document" : path(scope),
		viewport: `${vw}x${vh}`,
		// Эмулятор раздул layout viewport под широкий контент: ширина «съехала».
		viewportInflated: innerWidth > vw + 1 || (!!window.visualViewport && visualViewport.scale < 0.99),
		viewportMeta: meta || null,
		zoomBlocked: /user-scalable\s*=\s*(no|0)\b/.test(meta) || maxScale < 2,
		horizontalScroll: document.documentElement.scrollWidth > vw || innerWidth > vw + 1,
		overflowers,
		summary: {
			targets: targets.length,
			"fail-2.5.8": sum("fail-2.5.8"),
			"small-spaced": sum("small-spaced"),
			"below-44": sum("below-44"),
			inputsZoom: inputs.filter((i) => i.fontSize < 16).length,
			unnamed: unnamed.length,
			nonSemantic: nonSemantic.length,
			invisibleTargets: invisibleTargets.length,
			covered: covered.length,
			tallerThanScreen: pinned.filter((p) => p.tallerThanScreen).length,
		},
		// Ноль целей почти всегда значит неверную область, а не пустую страницу.
		warning: targets.length === 0 ? "0 targets in scope — check `scope`; pass {root} or close overlays" : undefined,
		// firstScreen и pinned зависят от прокрутки: базовые состояния мерить с scrollY 0.
		scrollY: Math.round(scrollY),
		targetGroups: targetGroups.slice(0, 40),
		unnamed: unnamed.slice(0, 15),
		nonSemantic: nonSemantic.slice(0, 10),
		invisibleTargets,
		covered: covered.slice(0, 10),
		inputs: inputs.slice(0, 15),
		smallText: [...smallText.values()].sort((a, b) => b.count - a.count).slice(0, 10),
		pinned,
	}
}
// Последнее выражение, а не await на верхнем уровне: инструмент JavaScript дождётся промиса и вернёт
// результат, а файл грузится и обычным тегом <script>.
window.__mux()
