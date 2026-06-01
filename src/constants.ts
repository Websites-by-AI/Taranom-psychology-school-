/**
 * تنظیمات سراسری پلتفرم ترنم مهر
 * تمام نام‌های تجاری و متن‌های ثابت در این فایل مدیریت می‌شوند.
 */

export const INSTITUTIONS = [
  {
    id: "taranom",
    name: "ترنم مهر",
    fullName: "آکادمی هوشمند ترنم مهر",
    slogan: "دستیار تخصصی موفقیت در کنکور سراسری",
    examProvider: "آزمون‌های شبیه‌ساز ترنم مهر",
    theme: "indigo"
  },
  {
    id: "gaj",
    name: "گاج",
    fullName: "انتشارات بین‌المللی گاج",
    slogan: "مدرن‌ترین سیستم آزمون‌های آزمایشی",
    examProvider: "آزمون‌های سراسری گاج",
    theme: "blue"
  },
  {
    id: "ghalamchi",
    name: "قلم‌چی",
    fullName: "بنیاد علمی آموزشی قلم‌چی",
    slogan: "برنامه‌ریزی و آزمون‌های برنامه‌ای",
    examProvider: "آزمون‌های راهبردی کانون",
    theme: "blue"
  }
];

export let BRAND_CONFIG = { ...INSTITUTIONS[0] };

export const setBrandById = (id: string) => {
  const brand = INSTITUTIONS.find(i => i.id === id);
  if (brand) {
    BRAND_CONFIG = { ...brand };
    // This will require a page reload or state sync in a real app,
    // but for this prototype, we'll use it as a reactive source if possible.
  }
};

/**
 * تابعی برای جایگذاری نام برند در متن‌ها
 * @param text متنی که قرار است نام برند در آن جای بگیرد
 * @returns متن اصلاح شده
 */
export const withBrand = (text: string) => {
  return text.replace(/چتر دانش/g, BRAND_CONFIG.name);
};
