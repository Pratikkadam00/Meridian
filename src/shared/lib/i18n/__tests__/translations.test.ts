import { resources } from "@/shared/lib/i18n/translations";

const en = resources.en.translation as Record<string, Record<string, unknown>>;
const ar = resources.ar.translation as Record<string, Record<string, unknown>>;

function flatKeys(tree: Record<string, Record<string, unknown>>): Set<string> {
  const out = new Set<string>();
  for (const ns of Object.keys(tree)) {
    for (const key of Object.keys(tree[ns])) {
      out.add(`${ns}.${key}`);
    }
  }
  return out;
}

describe("translations", () => {
  it("English and Arabic define identical key sets (no untranslated keys)", () => {
    const enKeys = flatKeys(en);
    const arKeys = flatKeys(ar);
    const missingArabic = [...enKeys].filter((k) => !arKeys.has(k));
    const missingEnglish = [...arKeys].filter((k) => !enKeys.has(k));
    expect({ missingArabic, missingEnglish }).toEqual({ missingArabic: [], missingEnglish: [] });
  });

  it("covers every screen namespace", () => {
    const namespaces = Object.keys(en);
    for (const ns of ["welcome", "account", "personalization", "permissions", "education", "deals", "deal", "newDeal", "reminders", "settings", "home", "error", "lock", "splash"]) {
      expect(namespaces).toContain(ns);
    }
  });
});
