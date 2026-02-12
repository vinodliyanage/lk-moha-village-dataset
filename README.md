# MOHA GN & Village Data Scraper

Scrapes the complete village-level and GN (Grama Niladhari) division dataset from [Sri Lanka's Ministry of Home Affairs (MOHA)](http://moha.gov.lk:8090/lifecode) — in all three official languages (English, Sinhala, Tamil).

## Datasets

### At a glance

| Level        | Count   |
| ------------ | ------- |
| Provinces    | 9       |
| Districts    | 25      |
| DS Divisions | 337     |
| GN Divisions | ~12,020 |
| Villages     | ~52,487 |

---

### Villages — [`data/villages.tsv`](data/villages.tsv)

Every row is a single village, with its full administrative hierarchy in all three languages.

#### Schema

| Column           | Description                                     |
| ---------------- | ----------------------------------------------- |
| `province_id`    | MOHA internal ID for the province               |
| `province_en`    | Province name (English)                         |
| `province_si`    | Province name (Sinhala)                         |
| `province_ta`    | Province name (Tamil)                           |
| `district_id`    | MOHA internal ID for the district               |
| `district_en`    | District name (English)                         |
| `district_si`    | District name (Sinhala)                         |
| `district_ta`    | District name (Tamil)                           |
| `ds_division_id` | MOHA internal ID for the Divisional Secretariat |
| `ds_division_en` | DS Division name (English)                      |
| `ds_division_si` | DS Division name (Sinhala)                      |
| `ds_division_ta` | DS Division name (Tamil)                        |
| `gn_division_en` | GN Division name (English)                      |
| `gn_division_si` | GN Division name (Sinhala)                      |
| `gn_division_ta` | GN Division name (Tamil)                        |
| `location_code`  | Location code assigned by MOHA                  |
| `old_gnd_number` | Legacy GN Division number                       |
| `village_en`     | Village name (English)                          |
| `village_si`     | Village name (Sinhala)                          |
| `village_ta`     | Village name (Tamil)                            |

#### Sample

| province_id | province_en | province_si | province_ta | district_id | district_en | district_si | district_ta | ds_division_id | ds_division_en | ds_division_si | ds_division_ta | gn_division_en | gn_division_si | gn_division_ta | location_code | old_gnd_number | village_en     | village_si     | village_ta          |
| ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | -------------- | -------------- | -------------- | -------------- | -------------- | -------------- | -------------- | ------------- | -------------- | -------------- | -------------- | ------------------- |
| 63          | Western     | බස්නාහිර    | மேற்கு      | 42          | Colombo     | කොළඹ        | கொழும்பு    | 950            | Colombo        | කොළඹ           | கொழும்பு       | Fort           | කොටුව          | கோட்டை         | 1-1-03-120    | C5             | Lotus Rd       | ලෝටස් පාර      | லோட்டஸ் வீதி        |
| 63          | Western     | බස්නාහිර    | மேற்கு      | 42          | Colombo     | කොළඹ        | கொழும்பு    | 950            | Colombo        | කොළඹ           | கொழும்பு       | Fort           | කොටුව          | கோட்டை         | 1-1-03-120    | C5             | Lanka Bank Rd  | ලංකා බැංකු පාර | இலங்கை வங்கி வீதி   |
| 63          | Western     | බස්නාහිර    | மேற்கு      | 42          | Colombo     | කොළඹ        | கொழும்பு    | 950            | Colombo        | කොළඹ           | கொழும்பு       | Fort           | කොටුව          | கோட்டை         | 1-1-03-120    | C5             | York Street    | යෝරක් විදිය    | யோர்க் வீதி         |
| 63          | Western     | බස්නාහිර    | மேற்கு      | 42          | Colombo     | කොළඹ        | கொழும்பு    | 950            | Colombo        | කොළඹ           | கொழும்பு       | Fort           | කොටුව          | கோட்டை         | 1-1-03-120    | C5             | Hospital Lane  | රෝහල් පටු මග   | வைத்தியசாலை ஒழுங்கை |
| 63          | Western     | බස්නාහිර    | மேற்கு      | 42          | Colombo     | කොළඹ        | கொழும்பූ    | 950            | Colombo        | කොළඹ           | கொழும்பு       | Fort           | කොටුව          | கோட்டை         | 1-1-03-120    | C5             | Chathum Street | චැතැම් විදිය   | செத்தம் வீதி        |

---

### GN Divisions — [`data/gn.tsv`](data/gn.tsv)

Every row is a single GN (Grama Niladhari) division with names in all three languages. Unlike the village data, the MOHA GN endpoint returns all three languages in a **single response**, so no separate per-language requests are needed.

#### Schema

| Column        | Description                                     |
| ------------- | ----------------------------------------------- |
| `life_code`   | LIFe code assigned by MOHA (e.g. `1-1-03-005`)  |
| `gn_code`     | GN division code                                |
| `name_en`     | GN Division name (English)                      |
| `name_si`     | GN Division name (Sinhala)                      |
| `name_ta`     | GN Division name (Tamil)                        |
| `mpa_code`    | MPA code (if available)                         |
| `province_id` | MOHA internal ID for the province               |
| `province`    | Province (multilingual, as returned by MOHA)    |
| `district_id` | MOHA internal ID for the district               |
| `district`    | District (multilingual, as returned by MOHA)    |
| `ds_division` | DS Division (multilingual, as returned by MOHA) |

#### Sample

| life_code  | gn_code | name_en          | name_si        | name_ta       | mpa_code | province_id | province                     | district_id | district                   | ds_division                |
| ---------- | ------- | ---------------- | -------------- | ------------- | -------- | ----------- | ---------------------------- | ----------- | -------------------------- | -------------------------- |
| 1-1-03-005 | 005     | Sammanthranapura | සම්මන්ත්‍රණපුර | சம்மந்திரணபுர |          | 63          | 1: බස්නාහිර/ மேற்கு/ Western | 42          | 1: කොළඹ/ கொழும்பு/ Colombo | 3: කොළඹ/ கொழும்பு/ Colombo |
| 1-1-03-010 | 010     | Mattakkuliya     | මට්ටක්කුලිය    | மட்டக்குளி    | C26      | 63          | 1: බස්නාහිර/ மேற்கு/ Western | 42          | 1: කොළඹ/ கொழும்பு/ Colombo | 3: කොළඹ/ கொழும்பு/ Colombo |
| 1-1-03-015 | 015     | Modara           | මෝදර           | மோத‍ரை        | C27      | 63          | 1: බස්නාහිර/ மேற்கு/ Western | 42          | 1: කොළඹ/ கொழும்பு/ Colombo | 3: කොළඹ/ கொழும்பு/ Colombo |

## Running the Scraper

If you want to re-scrape the data yourself:

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)

### Setup

```bash
pnpm install
```

### Scrape

```bash
pnpm scrape
```

This hits the MOHA server for every province → district → DS division → village combination in all three languages. It also fetches GN division data per district (which returns all three languages in one request). It takes a while — the server is not the fastest. Output goes to `output/villages.tsv` and `output/gn.tsv`.

## How it Works

The scraper walks through the MOHA administrative hierarchy top-down:

1. **Provinces** — hardcoded (they don't change), IDs 63–71
2. **Districts** — fetched per province via `fetch.php` with `action=province`
3. **GN Divisions** — fetched per district via `rpt_gn_list.php` (all 3 languages in one response)
4. **DS Divisions** — fetched per district via `fetch.php` with `action=district`
5. **Villages** — fetched per DS division via `rpt_village_list.php`

Village data is fetched three times per level — once for each language (English, Sinhala, Tamil) — and the results are merged by index into a single row. GN data only requires a single request per district as the endpoint returns all three languages together.

## Project Structure

```
├── data/
│   ├── villages.tsv       # village dataset
│   └── gn.tsv             # GN division dataset
├── src/
│   └── scraper.ts         # the scraper
├── output/                # scraper writes here (gitignored)
├── package.json
└── tsconfig.json
```

## Data Source

All data is sourced from the Ministry of Home Affairs, Sri Lanka:
http://moha.gov.lk:8090/lifecode

## Disclaimer

This dataset is scraped directly from the official MOHA website and is provided as-is. The source data may contain misspellings, inconsistencies, or outdated entries. If you spot any errors, PRs and issues are very welcome.

## Contributing

Contributions are welcome — feel free to open an issue or submit a PR.

1. Fork the repo
2. Create your branch (`git checkout -b fix/something`)
3. Commit your changes
4. Push and open a pull request

If you notice any missing or incorrect data, please [open an issue](../../issues).

## License

MIT © [Vinod Liyanage](mailto:hello@vinodliyanage.com)
