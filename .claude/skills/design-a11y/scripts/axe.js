// Engine scan with axe-core. Defines window.__axe; load it with the other scripts (SKILL.md, step 2),
// then `await __axe()` on each state, or `await __axe({root: "<css selector>"})` for an open overlay.
// axe-core comes from the app's own node_modules through the same local server; set window.__AXE_URL
// first to load it from another address.
//
// Changes nothing on the page except hiding the Next dev indicator (nextjs-portal), which is not
// part of the site. Fields are explained in references/criteria.md, "Reading the output".
window.__axe = async ({root, bestPractice = true} = {}) => {
	if (!window.axe) {
		await new Promise((ok, fail) => {
			const s = document.createElement("script")
			s.src = window.__AXE_URL || "http://127.0.0.1:8766/axe.min.js"
			s.onload = ok
			s.onerror = () => fail(new Error(`axe-core did not load from ${s.src}: start the local server (SKILL.md, step 2)`))
			document.head.appendChild(s)
		})
	}
	const devIndicator = document.querySelector("nextjs-portal")
	if (devIndicator) devIndicator.style.display = "none"

	const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", ...(bestPractice ? ["best-practice"] : [])]
	const result = await axe.run(root ? {include: [root]} : document, {
		runOnly: {type: "tag", values: tags},
		resultTypes: ["violations", "incomplete"],
	})

	// axe tags a criterion as `wcag` + principle + guideline + number: wcag143 → 1.4.3, wcag2411 → 2.4.11.
	const criteria = (t) => t.filter((x) => /^wcag\d{3,4}$/.test(x)).map((x) => x.replace(/^wcag(\d)(\d)(\d+)$/, "$1.$2.$3"))
	const node = (n) => ({
		target: n.target.join(" "),
		html: n.html.replace(/\s+/g, " ").slice(0, 160),
		why: (n.failureSummary || "").split("\n").slice(1).join(" ").replace(/\s+/g, " ").trim().slice(0, 220),
	})
	const item = (v) => ({
		id: v.id,
		impact: v.impact,
		sc: criteria(v.tags),
		kind: criteria(v.tags).length ? "wcag" : "best-practice",
		help: v.help,
		count: v.nodes.length,
		nodes: v.nodes.slice(0, 5).map(node),
	})
	return {
		url: location.href,
		lang: document.documentElement.lang,
		title: document.title,
		axe: axe.version,
		viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
		scope: root || "document",
		violations: result.violations.map(item),
		incomplete: result.incomplete.map(item),
	}
}
