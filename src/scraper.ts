import * as cheerio from "cheerio";
import { mkdirSync, writeFileSync } from "fs";

const BASE = "http://moha.gov.lk:8090/lifecode";

const LANG_CONFIG = {
  en: {
    fetch: "views/fetch.php",
    village: "views/rpt_village_list.php",
    gn: "views/rpt_gn_list.php",
    referrer: "village_list",
  },
  si: { fetch: "sinhala/fetch.php", village: "sinhala/rpt_village_list.php", referrer: "village_list_sinhala" },
  ta: { fetch: "tamil/fetch.php", village: "tamil/rpt_village_list.php", referrer: "village_list_tamil" },
} as const;

type Lang = keyof typeof LANG_CONFIG;

const PROVINCES = [
  { id: "63", name: "Western" },
  { id: "64", name: "Central" },
  { id: "65", name: "Southern" },
  { id: "66", name: "Northern" },
  { id: "67", name: "Eastern" },
  { id: "68", name: "North-Western" },
  { id: "69", name: "North-Central" },
  { id: "70", name: "Uva" },
  { id: "71", name: "Sabaragamuwa" },
];

const HEADERS = {
  accept: "*/*",
  "accept-language": "en-GB,en;q=0.5",
  "cache-control": "no-cache",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  pragma: "no-cache",
  "sec-gpc": "1",
  "x-requested-with": "XMLHttpRequest",
};

interface Option {
  id: string;
  name: string;
}

interface VillageRow {
  gnDivision: string;
  locationCode: string;
  oldGndNumber: string;
  villageName: string;
}

interface GnRow {
  lifeCode: string;
  gnCode: string;
  nameSi: string;
  nameTa: string;
  nameEn: string;
  mpaCode: string;
  province: string;
  district: string;
  dsDivision: string;
}

interface GnTsvRow {
  lifeCode: string;
  gnCode: string;
  nameEn: string;
  nameSi: string;
  nameTa: string;
  mpaCode: string;
  provinceId: string;
  province: string;
  districtId: string;
  district: string;
  dsDivision: string;
}

interface TsvRow {
  provinceId: string;
  provinceEn: string;
  provinceSi: string;
  provinceTa: string;
  districtId: string;
  districtEn: string;
  districtSi: string;
  districtTa: string;
  dsDivisionId: string;
  dsDivisionEn: string;
  dsDivisionSi: string;
  dsDivisionTa: string;
  gnDivisionEn: string;
  gnDivisionSi: string;
  gnDivisionTa: string;
  locationCode: string;
  oldGndNumber: string;
  villageEn: string;
  villageSi: string;
  villageTa: string;
}

const INVISIBLE_CHARS = /[\u200E\u200F\uFEFF]/g;
const clean = (s: string) => s.replace(INVISIBLE_CHARS, "").trim();

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post(path: string, body: string, lang: Lang): Promise<string> {
  const config = LANG_CONFIG[lang];
  const url = `${BASE}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...HEADERS, referrer: `${BASE}/${config.referrer}` },
    body,
  });
  return res.text();
}

function parseOptions(html: string): Option[] {
  const $ = cheerio.load(html);
  const options: Option[] = [];
  $("option").each((_, el) => {
    const id = $(el).attr("value");
    const text = clean($(el).text());
    if (id && text && !text.startsWith("Select")) {
      options.push({ id, name: text.replace(/^\d+:\s*/, "") });
    }
  });
  return options;
}

function parseVillageTable(html: string): VillageRow[] {
  const $ = cheerio.load(html);
  const rows: VillageRow[] = [];
  $("table tbody tr").each((_, tr) => {
    const cells = $(tr)
      .find("td")
      .map((_, td) => clean($(td).text()))
      .get();
    if (cells.length >= 4) {
      rows.push({
        gnDivision: cells[0],
        locationCode: cells[1],
        oldGndNumber: cells[2],
        villageName: cells[3],
      });
    }
  });
  return rows;
}

function parseGnTable(html: string): GnRow[] {
  const $ = cheerio.load(html);
  const rows: GnRow[] = [];
  $("table tbody tr").each((_, tr) => {
    const cells = $(tr)
      .find("td")
      .map((_, td) => clean($(td).text()))
      .get();
    if (cells.length >= 9) {
      rows.push({
        lifeCode: cells[0],
        gnCode: cells[1],
        nameSi: cells[2],
        nameTa: cells[3],
        nameEn: cells[4],
        mpaCode: cells[5],
        province: cells[6],
        district: cells[7],
        dsDivision: cells[8],
      });
    }
  });
  return rows;
}

async function fetchOptions(action: string, queryId: string, lang: Lang): Promise<Option[]> {
  const config = LANG_CONFIG[lang];
  const raw = await post(config.fetch, `action=${action}&query=${queryId}`, lang);
  try {
    const json = JSON.parse(raw);
    return parseOptions(json.output);
  } catch {
    return parseOptions(raw);
  }
}

async function fetchVillages(provinceId: string, districtId: string, dsId: string, lang: Lang): Promise<VillageRow[]> {
  const config = LANG_CONFIG[lang];
  const raw = await post(config.village, `district=${districtId}&province=${provinceId}&ds=${dsId}`, lang);
  return parseVillageTable(raw);
}

async function fetchGnData(provinceId: string, districtId: string): Promise<GnRow[]> {
  const raw = await post(LANG_CONFIG.en.gn, `district=${districtId}&province=${provinceId}`, "en");
  return parseGnTable(raw);
}

async function main() {
  const tsvRows: TsvRow[] = [];
  const gnTsvRows: GnTsvRow[] = [];
  const langs: Lang[] = ["en", "si", "ta"];

  for (const province of PROVINCES) {
    console.log(`\n--- ${province.name} [${province.id}] ---`);

    const districtsByLang: Record<Lang, Option[]> = { en: [], si: [], ta: [] };
    for (const lang of langs) {
      districtsByLang[lang] = await fetchOptions("province", province.id, lang);
      await delay(100);
    }

    const enDistricts = districtsByLang.en;
    console.log(`  ${enDistricts.length} districts`);

    for (let di = 0; di < enDistricts.length; di++) {
      const district = enDistricts[di];
      const districtSi = districtsByLang.si[di]?.name ?? "";
      const districtTa = districtsByLang.ta[di]?.name ?? "";
      console.log(`  > ${district.name} [${district.id}]`);

      const gnRows = await fetchGnData(province.id, district.id);
      console.log(`    ${gnRows.length} GN divisions`);
      await delay(100);

      for (const gn of gnRows) {
        gnTsvRows.push({
          lifeCode: gn.lifeCode,
          gnCode: gn.gnCode,
          nameEn: gn.nameEn,
          nameSi: gn.nameSi,
          nameTa: gn.nameTa,
          mpaCode: gn.mpaCode,
          provinceId: province.id,
          province: gn.province,
          districtId: district.id,
          district: gn.district,
          dsDivision: gn.dsDivision,
        });
      }

      const dsByLang: Record<Lang, Option[]> = { en: [], si: [], ta: [] };
      for (const lang of langs) {
        dsByLang[lang] = await fetchOptions("district", district.id, lang);
        await delay(100);
      }

      const enDs = dsByLang.en;
      console.log(`    ${enDs.length} DS divisions`);

      for (let dsi = 0; dsi < enDs.length; dsi++) {
        const ds = enDs[dsi];
        const dsSi = dsByLang.si[dsi]?.name ?? "";
        const dsTa = dsByLang.ta[dsi]?.name ?? "";
        console.log(`    > ${ds.name} [${ds.id}]`);

        const villagesByLang: Record<Lang, VillageRow[]> = { en: [], si: [], ta: [] };
        for (const lang of langs) {
          villagesByLang[lang] = await fetchVillages(province.id, district.id, ds.id, lang);
          await delay(100);
        }

        const enVillages = villagesByLang.en;
        const siVillages = villagesByLang.si;
        const taVillages = villagesByLang.ta;

        console.log(`      ${enVillages.length} villages`);

        for (let vi = 0; vi < enVillages.length; vi++) {
          const v = enVillages[vi];
          tsvRows.push({
            provinceId: province.id,
            provinceEn: province.name,
            provinceSi: districtsByLang.si.length > 0 ? getProvinceName(province.id, "si") : "",
            provinceTa: districtsByLang.ta.length > 0 ? getProvinceName(province.id, "ta") : "",
            districtId: district.id,
            districtEn: district.name,
            districtSi,
            districtTa,
            dsDivisionId: ds.id,
            dsDivisionEn: ds.name,
            dsDivisionSi: dsSi,
            dsDivisionTa: dsTa,
            gnDivisionEn: v.gnDivision,
            gnDivisionSi: siVillages[vi]?.gnDivision ?? "",
            gnDivisionTa: taVillages[vi]?.gnDivision ?? "",
            locationCode: v.locationCode,
            oldGndNumber: v.oldGndNumber,
            villageEn: v.villageName,
            villageSi: siVillages[vi]?.villageName ?? "",
            villageTa: taVillages[vi]?.villageName ?? "",
          });
        }
      }
    }
  }

  mkdirSync("output", { recursive: true });

  const header = [
    "province_id",
    "province_en",
    "province_si",
    "province_ta",
    "district_id",
    "district_en",
    "district_si",
    "district_ta",
    "ds_division_id",
    "ds_division_en",
    "ds_division_si",
    "ds_division_ta",
    "gn_division_en",
    "gn_division_si",
    "gn_division_ta",
    "location_code",
    "old_gnd_number",
    "village_en",
    "village_si",
    "village_ta",
  ].join("\t");

  const lines = tsvRows.map((r) =>
    [
      r.provinceId,
      r.provinceEn,
      r.provinceSi,
      r.provinceTa,
      r.districtId,
      r.districtEn,
      r.districtSi,
      r.districtTa,
      r.dsDivisionId,
      r.dsDivisionEn,
      r.dsDivisionSi,
      r.dsDivisionTa,
      r.gnDivisionEn,
      r.gnDivisionSi,
      r.gnDivisionTa,
      r.locationCode,
      r.oldGndNumber,
      r.villageEn,
      r.villageSi,
      r.villageTa,
    ].join("\t"),
  );

  const tsv = [header, ...lines].join("\n");
  writeFileSync("output/villages.tsv", tsv, "utf-8");
  console.log(`\n${tsvRows.length} village rows written to output/villages.tsv`);

  const gnHeader = [
    "life_code",
    "gn_code",
    "name_en",
    "name_si",
    "name_ta",
    "mpa_code",
    "province_id",
    "province",
    "district_id",
    "district",
    "ds_division",
  ].join("\t");

  const gnLines = gnTsvRows.map((r) =>
    [
      r.lifeCode,
      r.gnCode,
      r.nameEn,
      r.nameSi,
      r.nameTa,
      r.mpaCode,
      r.provinceId,
      r.province,
      r.districtId,
      r.district,
      r.dsDivision,
    ].join("\t"),
  );

  const gnTsv = [gnHeader, ...gnLines].join("\n");
  writeFileSync("output/gn.tsv", gnTsv, "utf-8");
  console.log(`${gnTsvRows.length} GN rows written to output/gn.tsv`);

  console.log("\ndone!");
}

const provinceNameCache: Record<string, Record<Lang, string>> = {};

async function fetchProvinceNames() {
  for (const lang of ["si", "ta"] as Lang[]) {
    const config = LANG_CONFIG[lang];
    try {
      const res = await fetch(`${BASE}/${config.referrer}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      $("#province option").each((_, el) => {
        const id = $(el).attr("value");
        const text = $(el)
          .text()
          .trim()
          .replace(/^\d+:\s*/, "");
        const cleaned = clean(text);
        if (
          id &&
          cleaned &&
          !cleaned.startsWith("Select") &&
          !cleaned.includes("තෝරන්න") &&
          !cleaned.includes("தேர்ந்தெடு")
        ) {
          if (!provinceNameCache[id]) provinceNameCache[id] = { en: "", si: "", ta: "" };
          provinceNameCache[id][lang] = cleaned;
        }
      });
    } catch {
      console.warn(`  failed to get province names for ${lang}`);
    }
  }
}

function getProvinceName(id: string, lang: Lang): string {
  return provinceNameCache[id]?.[lang] ?? "";
}

(async () => {
  console.log("Starting MOHA Village Data Scraper...\n");
  console.log("Fetching province names in Sinhala & Tamil...");
  await fetchProvinceNames();
  await main();
})();
