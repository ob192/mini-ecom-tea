#!/bin/bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="$(cd "$HERE/../../assets/supplier" && pwd)"   # supplier folders + .new/ output
OUT="$BASE/.new"
PARSE_DOCX="$HERE/parse_docx.py"

declare -A dirs      # slug -> source dir name (exact filesystem name)
declare -A titles    # slug -> fallback display title, used only if no docx/SEO title
declare -A overrides # slug -> title that wins over the docx/SEO title (optional 4th arg)
declare -A subtitles # slug -> subtitle that wins over the parsed one (see `sub`)

# add <slug> <source dir> <fallback title> [title override]
#
# The supplier writeups headline teaware by type, not by size ("Керамічна
# Гайвань"), which collides once the catalogue carries six gaiwans and three
# teapots that differ mainly by volume. The 4th argument overrides the parsed
# title for those; leave it empty to keep whatever the .docx says.
add() { dirs["$1"]="$2"; titles["$1"]="$3"; overrides["$1"]="${4:-}"; }

# sub <slug> <subtitle>
#
# The subtitle is normally the tagline after the em-dash in the .docx headline.
# A few writeups open with a bare section heading instead ("Що таке чайний дух
# і навіщо він потрібен") or simply restate the product name, which makes a
# poor page subtitle and <title>. Those get a hand-written one here.
sub() { subtitles["$1"]="$2"; }

# U+201C / U+201D — cannot be stored as literals (editor normalizes to ASCII ")
LQ=$'\xe2\x80\x9c'
RQ=$'\xe2\x80\x9d'
# U+2011 non-breaking hyphen — visually identical to "-", so spell it out too
NB=$'\xe2\x80\x91'

add "white/lao-baicha-shoumei"        "білий - Лао Бай ча Шоу Мей"                       "Лао Бай ча Шоу Мей"
add "white/gushu-baicha-yueguangbai"  "білий -Ює Гуан Бай Гушу"                          "Ює Гуан Бай Гушу"
add "oolong/gaba-oolong"              "габа"                                              "Габа улун"
add "green/longjing-cha"              " зелений - Лунцзін"                                "Лунцзін"
add "oolong/dancong-milanxiang"       "улун Дань Цун Мі Лань Сян"                         "Дань Цун Мі Лань Сян"
add "oolong/dahongpao-rougui"         "улун Да Хун Пао Жоу Гуй"                          "Да Хун Пао Жоу Гуй"
add "oolong/dahongpao-shuixian"       "улун-Да Хун Пао Шуй Сянь"                         "Да Хун Пао Шуй Сянь"
add "oolong/dongding-oolong"          "улун-Дун Дін"                                      "Дун Дін"
# Both Те Гуань Інь folders are named "№4"; the grade is only stated inside the
# .docx ("Тегуань Інь 4 грейд" vs "5 грейд"). Mapping them by folder name alone
# shipped the 5-grade writeup twice — go by the document, not the label.
add "oolong/tieguanyin-4"             "улун -Те Гуань Інь № 4"                            "Те Гуань Інь №4"
add "oolong/tieguanyin-5"             "улун- Те Гуань Інь №4"                             "Те Гуань Інь №5"
add "oolong/jinxuan-oolong"           "улун-Цзинь Сюань _Молочний улун_"                  "Цзинь Сюань (Молочний улун)"
add "red/da-jin-zhen-gushu-hongcha"   "червоний - Дянь Хун Да Цзінь Чжень"               "Дянь Хун Да Цзінь Чжень"
add "red/dianhong-first-grade"        "червоний-Дянь хун перший сорт"                     "Дянь Хун перший сорт"
add "puer/naka-gushu-shengcha"        "Шен пуер-Нака Гушу"                                "Нака Гушу (Шен пуер)"
add "puer/gongting-gongbing-shu"      "Шу пуер-Гунтін Гунбін"                             "Гунтін Гунбін (Шу пуер)"
add "puer/jingmai-qiaomu-shu"         "Шу пуер-Цзінмай Цяому"                             "Цзінмай Цяому (Шу пуер)"
add "puer/seven-sons-shu"             "Шу Пуер «Сім Синів»"                               "Сім Синів (Шу пуер)"
add "piala/glass-55ml"                "Піала зі скла, 55 мл "                             "Піала зі скла, 55 мл"
add "piala/glass-70ml"                "піала-скло 70мл"                                   "Піала зі скла, 70 мл"
add "piala/ceramic-fish-50ml"         "Піала з рибкою 50 мл (робочий 35), кераміка "      "Піала з рибкою 50 мл, кераміка"
add "piala/porcelain-50ml"            "Піала з фарфору, 50 мл"                            "Піала з фарфору, 50 мл"
add "piala/jingdezhen-90ml"           "Піала з Цзіндечженьської кераміки, 90 мл "         "Піала з Цзіндечженьської кераміки, 90 мл"
add "piala/porcelain-donkey-50ml"     "Піала фарфор 50 мл  ${LQ}Віслюк і пастухи${RQ}"  "Піала фарфор «Віслюк і пастухи», 50 мл"
add "piala/porcelain-80ml"            "Піала фарфор 80 мл "                                "Піала фарфор, 80 мл"
add "piala/porcelain-trapezoid-70ml"  "Піала фарфор ${LQ}Трапеція${RQ} 70 мл"             "Піала фарфор «Трапеція», 70 мл"

# Sets. Both source folders headline without an em-dash, so the parser finds no
# SEO title and the fallback below is what ships.
add "set/travel-mountains-3in1"       "Travel${NB}набір ${LQ}Гори Китаю${RQ} 3${NB}в${NB}1 (у кейсі)" \
                                                                                          "Travel-набір «Гори Китаю», 3-в-1" \
                                                                                          ""
add "set/start-mini-7"                "Набір старт Міні"                                  "Набір «Старт МІНІ», 7 видів по 10 г" \
                                                                                          ""

# Gaiwans — six of them, differing mainly by volume, hence the overrides.
add "gaiwan/ceramic-110ml"            "Гайвань 110мл"                                     "Керамічна гайвань, 110 мл" \
                                                                                          "Керамічна гайвань, 110 мл"
add "gaiwan/porcelain-110ml"          "Гайвань з фарфору, 110 мл"                         "Гайвань із білого фарфору, 110 мл" \
                                                                                          "Гайвань із білого фарфору, 110 мл"
add "gaiwan/mountains-130ml"          "Гайвань ${LQ}Гори${RQ} 130 мл"                     "Гайвань «Гори», 130 мл" \
                                                                                          "Гайвань «Гори», 130 мл"
add "gaiwan/bamboo-crackle-130ml"     "Гайвань ${LQ}Бамбук потріскана${RQ} 130 мл"        "Гайвань «Бамбук», кракле, 130 мл" \
                                                                                          "Гайвань «Бамбук», кракле, 130 мл"
add "gaiwan/bamboo-150ml"             "Гайвань ${LQ}Бамбук${RQ} 150 мл "                  "Гайвань «Бамбук», 150 мл" \
                                                                                          "Гайвань «Бамбук», 150 мл"
add "gaiwan/jingdezhen-200ml"         " Гайвань з Цзіндечженської кераміки, 200 мл"       "Гайвань із Цзіндечженської кераміки, 200 мл" \
                                                                                          "Гайвань із Цзіндечженської кераміки, 200 мл"

# Teapots.
add "teapot/glass-100ml"              "Скляний чайник 100мл"                              "Скляний чайник, 100 мл" \
                                                                                          "Скляний чайник, 100 мл"
add "teapot/jingdezhen-145ml"         "Чайник з Цзіндечженьської кераміки, 145 мл"        "Чайник із Цзіндечженської кераміки, 145 мл" \
                                                                                          "Чайник із Цзіндечженської кераміки, 145 мл"
add "teapot/jianshui-180ml"           "Чайник с Цзяньшуйської глини 180мл"                "Чайник із Цзяньшуйської глини, 180 мл" \
                                                                                          "Чайник із Цзяньшуйської глини, 180 мл"

# Accessories.
add "accessory/chahai-glass-285ml"    "Чахай скляний 285 мл"                              "Чахай скляний, 285 мл" \
                                                                                          "Чахай скляний, 285 мл"
add "accessory/strainer-steel"        "Сито з нержавіючої сталі з підставкою "            "Ситечко з нержавіючої сталі з підставкою" \
                                                                                          "Ситечко з нержавіючої сталі з підставкою"
add "accessory/strainer-gold"         "Сито ${LQ}золоте${RQ} з підставкою "               "Ситечко «золоте» з підставкою" \
                                                                                          "Ситечко «золоте» з підставкою"

# Tea-pet figurines. The writeups open with a generic "what is a tea pet"
# explainer rather than the figure's own name, so every one needs an override.
add "figurine/monkey-monk"            "Фігурка ${LQ}Мавпа${NB}монах${RQ}"                 "Фігурка «Мавпа-монах»" \
                                                                                          "Фігурка «Мавпа-монах»"
add "figurine/turtle"                 "Фігурка ${LQ}Чайний дух — мудра черепаха${RQ} "    "Фігурка «Чайний дух — мудра черепаха»" \
                                                                                          "Фігурка «Чайний дух — мудра черепаха»"
add "figurine/tiger"                  "Фігурка ${LQ}Чайний дух — тигр${RQ} "              "Фігурка «Чайний дух — тигр»" \
                                                                                          "Фігурка «Чайний дух — тигр»"
add "figurine/garlic-frog"            "Фігурка ${LQ}Чайний дух — часник із жабою${RQ} "   "Фігурка «Чайний дух — часник із жабою»" \
                                                                                          "Фігурка «Чайний дух — часник із жабою»"
add "figurine/tiger-yixing"           "Фігурка ${LQ}Тигр${RQ} (ісинська глина) "          "Фігурка «Тигр», ісинська глина" \
                                                                                          "Фігурка «Тигр», ісинська глина"

sub "set/travel-mountains-3in1" "гайвань, чахай і дві піали у твердому кейсі"
sub "set/start-mini-7"          "сім сортів по 10 г — пуер, улуни, зелений, червоний, білий"
sub "accessory/strainer-steel"  "дрібна сітка та тримач на край чашки чи чайника"
sub "accessory/strainer-gold"   "для скрученого улуну, пресованого пуеру та дрібного листа"
sub "gaiwan/mountains-130ml"    "гірський мотив — символ незмінності та мудрості"
sub "figurine/tiger"            "чайний дух «ча цун» для ритуалу гунфу ча"
sub "figurine/tiger-yixing"     "символ сили, захисту та відваги"
sub "figurine/garlic-frog"      "чайний дух «ча цун», що поглинає настій під час чаювання"

# Extensions copied into the reorganized product folder as gallery images.
# Everything else (the supplier .docx writeup, stray files, etc.) is parsed
# for SEO copy but never shipped as a "photo".
IMAGE_EXT_RE='^(jpe?g|png|webp|gif)$'

mkdir -p "$OUT"

json_entries=()

for slug in "${!dirs[@]}"; do
  src_path="$BASE/${dirs[$slug]}"
  target="$OUT/$slug"
  fallback_title="${titles[$slug]}"
  title_override="${overrides[$slug]}"
  subtitle_override="${subtitles[$slug]:-}"

  if [[ ! -d "$src_path" ]]; then
    echo "SKIP (not found): '${dirs[$slug]}'"
    continue
  fi

  mkdir -p "$target"

  i=1
  file_list=()
  while IFS= read -r f; do
    [[ -f "$src_path/$f" ]] || continue
    ext="${f##*.}"
    ext_lower="${ext,,}"
    [[ "$ext_lower" =~ $IMAGE_EXT_RE ]] || continue
    dest_name="$i.${ext_lower}"
    cp "$src_path/$f" "$target/$dest_name"
    file_list+=("$dest_name")
    i=$((i+1))
  done < <(ls "$src_path" | sort)

  count=$((i-1))

  # Pick the first .docx in the source folder (supplier writeup) and parse
  # it into SEO title/subtitle/description/price via parse_docx.py.
  docx_path="$(find "$src_path" -maxdepth 1 -iname '*.docx' | sort | head -n1)"
  seo_json="null"
  if [[ -n "$docx_path" ]]; then
    warn_file="$(mktemp)"
    if seo_json="$(python3 "$PARSE_DOCX" "$docx_path" 2>"$warn_file")"; then
      :
    else
      echo "WARN ($slug): parse_docx.py failed on '$docx_path'"
      seo_json="null"
    fi
    if [[ -s "$warn_file" ]]; then
      while IFS= read -r line; do
        echo "  [$slug] $line"
      done < "$warn_file"
    fi
    rm -f "$warn_file"
  else
    echo "INFO ($slug): no .docx found, using fallback title only"
  fi

  echo "Done: ${dirs[$slug]} -> $slug ($count image files)"

  files_json="$(printf '%s\n' "${file_list[@]}" | jq -R -s -c 'split("\n") | map(select(length > 0))')"

  entry="$(jq -n \
    --arg slug "$slug" \
    --arg fallback_title "$fallback_title" \
    --arg title_override "$title_override" \
    --arg subtitle_override "$subtitle_override" \
    --argjson files "$files_json" \
    --argjson seo "$seo_json" \
    '{
      slug: $slug,
      title: (if ($title_override | length) > 0
              then $title_override
              else ($seo.title // $fallback_title) end),
      subtitle: (if ($subtitle_override | length) > 0
                 then $subtitle_override
                 else ($seo.subtitle // null) end),
      description: ($seo.description // null),
      price: ($seo.price // null),
      weight: ($seo.weight // null),
      priceTiers: ($seo.priceTiers // []),
      files: $files
    }')"

  json_entries+=("$entry")
done

printf '%s\n' "${json_entries[@]}" | jq -s 'sort_by(.slug)' > "$OUT/products.json"

echo ""
echo "products.json written to $OUT/products.json"
echo "All done"
