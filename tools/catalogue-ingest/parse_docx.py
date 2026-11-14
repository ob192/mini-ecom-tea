#!/usr/bin/env python3
"""Extract SEO title/subtitle/description/price from a single product .docx.

Expected source layout (as produced by the supplier docs):
  [Headline — tagline]         (optional, short line with an em-dash)
  Що це за чай? / Що таке ...  (optional heading, skipped)
  <body paragraphs>
  Смак і аромат / і характер   (heading, skipped)
  <body paragraphs>
  💵Пакування/ціна:
  <weight> г — <price> грн     (one or more)

Non-tea products (piala cups etc.) instead end with a single bare price
line and no weight, e.g. "250грн" or "цена 330 грн" — handled as a
fallback when no weight-tiers are found.

Prints one JSON object to stdout (or `null` if the file has no usable text).
Prints Merchant-Center-policy warnings (promotional phrases, ALL-CAPS, length)
to stderr — the caller decides whether those are fatal.
"""
import json
import re
import sys
import zipfile

WHAT_IS_HEADINGS = {"що це за чай?", "що таке габа чай?", "що це таке?"}
TASTE_HEADINGS = {"смак і аромат", "смак і характер"}
PRICE_HEADING_RE = re.compile(r"пакування\s*/?\s*ц[іiеe]на", re.IGNORECASE)
PRICE_LINE_RE = re.compile(r"(\d+)\s*г\s*[—\-]\s*([\d\s]+)\s*грн", re.IGNORECASE)
# Non-tea products (teaware, figurines, sets) have no weight tiers — just a
# single trailing price line. The supplier writes the lead-in inconsistently
# ("Ціна:", but also the Russian "цена"), so accept both spellings.
BARE_PRICE_RE = re.compile(r"^(?:ц[іiеe]на\s*[:\-]?\s*)?(\d[\d\s]*)\s*грн\.?$", re.IGNORECASE)
# Same line with the currency dropped ("цена 2250"). The "цена" lead-in is
# mandatory here — without it any stray number line would look like a price.
BARE_PRICE_NO_CCY_RE = re.compile(r"^ц[іiеe]на\s*[:\-]?\s*(\d[\d\s]*)$", re.IGNORECASE)
EMOJI_RE = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F0FF]+"
)
QUOTE_OPEN = "«“"
QUOTE_CLOSE = "»”"
# Supplier list items start with a plain hyphen ("-Габа Наполеон").
BULLET_RE = re.compile(r"^[-–—•]\s*")
HAS_LETTER_RE = re.compile(r"\w", re.UNICODE)

# Phrases forbidden (or heavily restricted) in Google Merchant Center title/description.
FORBIDDEN_PATTERNS = [
    r"безкоштовн\w*\s+доставк\w*",
    r"знижк\w*",
    r"акці[яйюі]\w*",
    r"розпродаж\w*",
    r"найкращ\w*\s+ц[іi]н\w*",
    r"гарант\w*\s+повернен\w*",
    r"подарун\w*",
    r"free\s+shipping",
    r"best\s+price",
    r"top\s+quality",
    r"№\s*1\b",
    r"best\s*seller",
    r"\bsale\b",
]
FORBIDDEN_RE = re.compile("|".join(FORBIDDEN_PATTERNS), re.IGNORECASE)

WEIGHT_PRIORITY = [50, 100, 25]  # preferred default package size, in that order
TITLE_MAX = 150
# Longest a paragraph can be and still read as a headline/section heading
# rather than as body prose.
HEADLINE_MAX = 100
DESCRIPTION_MAX = 5000
# Soft budget for the shipped description. The supplier writeups trail off into
# long cultural essays that never come back to the product, so we keep the
# opening paragraphs and drop the rest — always on a paragraph boundary, so the
# copy never ends mid-thought. The first paragraph is kept whatever its length.
DESCRIPTION_TARGET = 1100


def extract_paragraphs(path):
    z = zipfile.ZipFile(path)
    xml = z.read("word/document.xml").decode("utf-8")
    paras = re.findall(r"<w:p[ >].*?</w:p>", xml, re.S)
    out = []
    for p in paras:
        runs = re.findall(r"<w:t[^>]*>(.*?)</w:t>", p, re.S)
        text = "".join(runs)
        text = (
            text.replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
            .replace("&apos;", "'")
        )
        text = clean_text(text)
        if text:
            out.append(text)
    return out


def clean_text(text):
    text = EMOJI_RE.sub("", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def split_headline(text):
    """Split "Name — tagline" on the first em-dash that sits outside «…»/“…”.

    Product names routinely contain their own em-dash inside quotes
    ("Фігурка «Чайний дух — мудра черепаха» — символ довголіття"); splitting on
    the first dash found anywhere cuts the name in half.
    """
    depth = 0
    for i, ch in enumerate(text):
        if ch in QUOTE_OPEN:
            depth += 1
        elif ch in QUOTE_CLOSE:
            depth = max(0, depth - 1)
        elif depth == 0 and text.startswith(" — ", i):
            return text[:i], text[i + 3:]
    return None


def compact(paragraphs):
    """Join paragraphs into the shipped description, trimmed to a budget.

    Paragraphs are kept whole and separated by newlines so the storefront can
    render them as real paragraphs and bullets instead of one run-on wall of
    text. Cutting only between paragraphs guarantees the description always
    ends on a finished sentence.
    """
    kept = []
    total = 0
    for p in paragraphs:
        if kept and total + len(p) > DESCRIPTION_TARGET:
            break
        kept.append(p)
        total += len(p)

    if len(kept) < len(paragraphs):
        # Something was cut. A section heading left with nothing (or only its
        # lead-in sentence) under it reads as unfinished copy, so fall back to
        # the last section that survived whole.
        while kept and is_headline(kept[-1]):
            kept.pop()
        if len(kept) >= 2 and is_headline(kept[-2]):
            kept.pop()
            kept.pop()

    return "\n".join(kept)


def is_headline(text):
    """True for a short standalone title line rather than a body sentence."""
    return len(text) <= HEADLINE_MAX and not text.endswith((".", "!", "?"))


def bare_price(text):
    """The hryvnia amount if `text` is a standalone price line, else None."""
    for pattern in (BARE_PRICE_RE, BARE_PRICE_NO_CCY_RE):
        m = pattern.match(text.strip())
        if m:
            return int(m.group(1).replace(" ", ""))
    return None


def normalize_quotes(text):
    text = text.strip().strip("\"'").strip()
    return text


def flag_forbidden(label, text, warnings):
    if not text:
        return
    m = FORBIDDEN_RE.search(text)
    if m:
        warnings.append(f"{label}: contains forbidden/promotional phrase '{m.group(0)}'")
    for word in re.findall(r"[A-ZА-ЯЁІЇЄ]{6,}", text):
        warnings.append(f"{label}: ALL-CAPS word '{word}' — not allowed in Merchant Center feeds")


def parse(path):
    paragraphs = extract_paragraphs(path)
    warnings = []
    if not paragraphs:
        return None, warnings

    idx = 0
    name_part = None
    tagline_part = None

    first = paragraphs[0]
    split = split_headline(first)
    if split:
        candidate_name, candidate_rest = split
        candidate_name = candidate_name.strip()
        if len(candidate_name) <= 40:
            name_part = candidate_name
            if len(first) <= 100:
                # Standalone short headline paragraph: "Name — tagline".
                # Consume it entirely so it isn't repeated in the body.
                tagline_part = candidate_rest.strip()
                idx = 1
                if idx < len(paragraphs) and paragraphs[idx].strip().lower() in WHAT_IS_HEADINGS:
                    idx += 1
            else:
                # Long first paragraph that merely opens with "Name — ...":
                # keep it in the body/description, just note the name.
                tagline_part = None
    elif is_headline(first) and len(paragraphs) >= 3:
        # Dashless standalone headline ("Символіка гір у китайській культурі").
        # There's no name to take from it, but it still reads as a tagline —
        # consume it so it doesn't also open the description.
        tagline_part = first
        idx = 1
        if idx < len(paragraphs) and paragraphs[idx].strip().lower() in WHAT_IS_HEADINGS:
            idx += 1

    body = []
    for p in paragraphs[idx:]:
        low = p.strip().lower()
        if PRICE_HEADING_RE.search(low):
            break
        if low in TASTE_HEADINGS or low in WHAT_IS_HEADINGS:
            continue
        if bare_price(p) is not None:
            continue
        if not HAS_LETTER_RE.search(p):
            continue  # stray punctuation-only paragraph (a lone "." etc.)
        body.append(BULLET_RE.sub("• ", p))

    dropped = len(body)
    description = compact(body).strip()
    dropped -= len(description.split("\n")) if description else 0
    if dropped:
        warnings.append(
            f"description: trimmed {dropped} trailing paragraph(s) to stay near "
            f"{DESCRIPTION_TARGET} characters"
        )
    if len(description) > DESCRIPTION_MAX:
        warnings.append("description: exceeds 5000 characters, truncating")
        description = description[:DESCRIPTION_MAX].rstrip()

    tiers = []
    in_price = False
    for p in paragraphs:
        if PRICE_HEADING_RE.search(p.lower()):
            in_price = True
            continue
        if in_price:
            m = PRICE_LINE_RE.search(p)
            if m:
                weight = int(m.group(1))
                price = int(m.group(2).replace(" ", ""))
                tiers.append({"weight": weight, "price": price})

    weight = price = None
    for w in WEIGHT_PRIORITY:
        match = next((t for t in tiers if t["weight"] == w), None)
        if match:
            weight, price = match["weight"], match["price"]
            break
    if weight is None and tiers:
        weight, price = tiers[0]["weight"], tiers[0]["price"]

    # Non-tea products: no weight tiers, just a bare "... грн" line anywhere.
    if price is None:
        for p in paragraphs:
            price = bare_price(p)
            if price is not None:
                break

    if tagline_part is None and body:
        first_sentence = re.split(r"(?<=[.!?])\s", body[0])[0]
        if len(first_sentence) > 90:
            first_sentence = first_sentence[:90].rsplit(" ", 1)[0]
        tagline_part = first_sentence.rstrip(" ,;:")

    title = name_part
    subtitle = normalize_quotes(tagline_part) if tagline_part else None

    for label, text in (("title", title or ""), ("subtitle", subtitle or ""), ("description", description)):
        flag_forbidden(label, text, warnings)

    if title and len(title) > TITLE_MAX:
        warnings.append(f"title: exceeds {TITLE_MAX} characters, truncating")
        title = title[:TITLE_MAX].rstrip()

    result = {
        "title": title,
        "subtitle": subtitle,
        "description": description or None,
        "price": price,
        "weight": weight,
        "priceTiers": tiers,
    }
    return result, warnings


def main():
    if len(sys.argv) != 2:
        print("usage: parse_docx.py <path.docx>", file=sys.stderr)
        sys.exit(1)

    result, warnings = parse(sys.argv[1])
    for w in warnings:
        print(f"WARN: {sys.argv[1]}: {w}", file=sys.stderr)

    print(json.dumps(result, ensure_ascii=False) if result else "null")


if __name__ == "__main__":
    main()
