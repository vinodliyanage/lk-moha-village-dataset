# MOHA Village Data Scraper

Scrapes the complete village-level administrative division dataset from [Sri Lanka's Ministry of Home Affairs (MOHA)](http://moha.gov.lk:8090/lifecode) — in all three official languages (English, Sinhala, Tamil).

## Dataset

The scraped dataset is available at [`data/villages.tsv`](data/villages.tsv).

### At a glance

| Level        | Count   |
| ------------ | ------- |
| Provinces    | 9       |
| Districts    | 25      |
| DS Divisions | 337     |
| GN Divisions | ~12,356 |
| Villages     | ~52,487 |

Every row is a single village, with its full administrative hierarchy in all three languages.

### Schema

The TSV file has the following columns:

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

### Sample

```
province_en  district_en  ds_division_en  gn_division_en  village_en       village_si          village_ta
Western      Colombo      Colombo         Fort            Lotus Rd         ලෝටස් පාර           லோட்டஸ் வீதி
Western      Colombo      Colombo         Fort            Lanka Bank Rd    ලංකා බැංකු පාර      இலங்கை வங்கி வீதி
Western      Colombo      Colombo         Fort            York Street      යෝරක් විදිය         யோர்க் வீதி
```

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

This hits the MOHA server for every province → district → DS division → village combination in all three languages. It takes a while — the server is not the fastest. Output goes to `output/villages.tsv`.

## How it Works

The scraper walks through the MOHA administrative hierarchy top-down:

1. **Provinces** — hardcoded (they don't change), IDs 63–71
2. **Districts** — fetched per province via `fetch.php` with `action=province`
3. **DS Divisions** — fetched per district via `fetch.php` with `action=district`
4. **Villages** — fetched per DS division via `rpt_village_list.php`

Each level is fetched three times — once for each language (English, Sinhala, Tamil) — and the results are merged by index into a single row.

## Project Structure

```
├── data/
│   └── villages.tsv       # the dataset
├── src/
│   └── scraper.ts         # the scraper
├── output/                 # scraper writes here (gitignored)
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
