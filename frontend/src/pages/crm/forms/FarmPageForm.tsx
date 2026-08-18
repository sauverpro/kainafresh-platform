import { useState } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface HeroSection {
  tag: string;
  heading: string;
  description: string;
  stats: { value: string; label: string }[];
}

interface Benefit {
  title: string;
  description: string;
}

interface BenefitsSection {
  tag: string;
  heading: string;
  subheading: string;
  items: Benefit[];
}

interface ProductCategory {
  name: string;
  examples: string;
  minOrder: string;
}

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

interface FarmPageData {
  hero: HeroSection;
  benefits: BenefitsSection;
  productCategories: ProductCategory[];
  exportDestinations: string[];
  processSteps: ProcessStep[];
}

const DEFAULTS: FarmPageData = {
  hero: {
    tag: "Wholesale & Exports",
    heading: "Fresh Produce at Scale. Direct from Our Farm.",
    description:
      "Supplying restaurants, supermarkets, distributors, and exporters across East Africa and beyond.",
    stats: [
      { value: "50+", label: "Wholesale clients" },
      { value: "6", label: "Export destinations" },
      { value: "20+", label: "Product varieties" },
    ],
  },
  benefits: {
    tag: "Why KainaFresh",
    heading: "The Smart Choice for Bulk Buyers",
    subheading: "We make large-scale procurement simple, reliable, and cost-effective.",
    items: [
      { title: "Bulk Pricing", description: "Competitive tiered pricing for large volume orders." },
      { title: "Reliable Delivery", description: "Scheduled, on-time delivery with cold-chain logistics." },
      { title: "Export Ready", description: "Certified and packaged to meet international export standards." },
      { title: "Consistent Supply", description: "Year-round availability on most produce lines." },
    ],
  },
  productCategories: [
    { name: "Fresh Vegetables", examples: "Tomatoes, Peppers, Onions, Carrots", minOrder: "50 kg" },
    { name: "Tropical Fruits", examples: "Avocados, Mangoes, Pineapples", minOrder: "30 kg" },
    { name: "Root Crops", examples: "Potatoes, Sweet Potatoes, Cassava", minOrder: "100 kg" },
  ],
  exportDestinations: ["Kenya", "Uganda", "Tanzania", "DRC Congo", "Burundi", "Europe"],
  processSteps: [
    { number: "01", title: "Submit an Inquiry", description: "Fill in the inquiry form or email us directly." },
    { number: "02", title: "Get a Custom Quote", description: "Our team sends a tailored pricing proposal within 24 hours." },
    { number: "03", title: "Confirm & Sign", description: "Review the quote, agree on terms, and sign a supply agreement." },
    { number: "04", title: "Harvest, Pack & Deliver", description: "We harvest to your schedule and dispatch with full tracking." },
  ],
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
      <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
    />
  );
}

export default function FarmPageForm(props: { pageId: string }) {
  const [data, setData] = useState<FarmPageData>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    void props.pageId;
    // TODO: apiPut(`/api/pages/${props.pageId}`, { content: data })
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <SectionCard title="Hero Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tag">
            <TextInput value={data.hero.tag} onChange={(v) => setData({ ...data, hero: { ...data.hero, tag: v } })} />
          </Field>
          <Field label="Heading">
            <TextInput value={data.hero.heading} onChange={(v) => setData({ ...data, hero: { ...data.hero, heading: v } })} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description">
            <TextArea value={data.hero.description} onChange={(v) => setData({ ...data, hero: { ...data.hero, description: v } })} rows={3} />
          </Field>
        </div>
        <div className="mt-4 space-y-3">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Hero Stats</label>
          {data.hero.stats.map((stat, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input type="text" value={stat.value} onChange={(e) => { const stats = [...data.hero.stats]; stats[i] = { ...stats[i], value: e.target.value }; setData({ ...data, hero: { ...data.hero, stats } }); }} placeholder="Value" className="w-28 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              <input type="text" value={stat.label} onChange={(e) => { const stats = [...data.hero.stats]; stats[i] = { ...stats[i], label: e.target.value }; setData({ ...data, hero: { ...data.hero, stats } }); }} placeholder="Label" className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              <button type="button" onClick={() => setData({ ...data, hero: { ...data.hero, stats: data.hero.stats.filter((_, j) => j !== i) } })} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, hero: { ...data.hero, stats: [...data.hero.stats, { value: "", label: "" }] } })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Stat
          </button>
        </div>
      </SectionCard>

      {/* Benefits */}
      <SectionCard title="Benefits Section">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tag">
            <TextInput value={data.benefits.tag} onChange={(v) => setData({ ...data, benefits: { ...data.benefits, tag: v } })} />
          </Field>
          <Field label="Heading">
            <TextInput value={data.benefits.heading} onChange={(v) => setData({ ...data, benefits: { ...data.benefits, heading: v } })} />
          </Field>
          <Field label="Subheading">
            <TextInput value={data.benefits.subheading} onChange={(v) => setData({ ...data, benefits: { ...data.benefits, subheading: v } })} />
          </Field>
        </div>
        <div className="mt-4 space-y-3">
          {data.benefits.items.map((item, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <div className="flex-1 space-y-2">
                <input type="text" value={item.title} onChange={(e) => { const items = [...data.benefits.items]; items[i] = { ...items[i], title: e.target.value }; setData({ ...data, benefits: { ...data.benefits, items } }); }} placeholder="Title" className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
                <textarea value={item.description} onChange={(e) => { const items = [...data.benefits.items]; items[i] = { ...items[i], description: e.target.value }; setData({ ...data, benefits: { ...data.benefits, items } }); }} placeholder="Description" rows={2} className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              </div>
              <button type="button" onClick={() => setData({ ...data, benefits: { ...data.benefits, items: data.benefits.items.filter((_, j) => j !== i) } })} className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, benefits: { ...data.benefits, items: [...data.benefits.items, { title: "", description: "" }] } })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Benefit
          </button>
        </div>
      </SectionCard>

      {/* Product Categories */}
      <SectionCard title="Product Categories Section">
        <div className="space-y-3">
          {data.productCategories.map((cat, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <input type="text" value={cat.name} onChange={(e) => { const productCategories = [...data.productCategories]; productCategories[i] = { ...productCategories[i], name: e.target.value }; setData({ ...data, productCategories }); }} placeholder="Name" className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
                <input type="text" value={cat.examples} onChange={(e) => { const productCategories = [...data.productCategories]; productCategories[i] = { ...productCategories[i], examples: e.target.value }; setData({ ...data, productCategories }); }} placeholder="Examples" className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
                <input type="text" value={cat.minOrder} onChange={(e) => { const productCategories = [...data.productCategories]; productCategories[i] = { ...productCategories[i], minOrder: e.target.value }; setData({ ...data, productCategories }); }} placeholder="Min order" className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              </div>
              <button type="button" onClick={() => setData({ ...data, productCategories: data.productCategories.filter((_, j) => j !== i) })} className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, productCategories: [...data.productCategories, { name: "", examples: "", minOrder: "" }] })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </SectionCard>

      {/* Export Destinations */}
      <SectionCard title="Export Destinations">
        <div className="space-y-3">
          {data.exportDestinations.map((dest, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input type="text" value={dest} onChange={(e) => { const exportDestinations = [...data.exportDestinations]; exportDestinations[i] = e.target.value; setData({ ...data, exportDestinations }); }} placeholder="Destination" className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              <button type="button" onClick={() => setData({ ...data, exportDestinations: data.exportDestinations.filter((_, j) => j !== i) })} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, exportDestinations: [...data.exportDestinations, ""] })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Destination
          </button>
        </div>
      </SectionCard>

      {/* Process Steps */}
      <SectionCard title="Process Steps Section">
        <div className="space-y-3">
          {data.processSteps.map((step, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <input type="text" value={step.number} onChange={(e) => { const processSteps = [...data.processSteps]; processSteps[i] = { ...processSteps[i], number: e.target.value }; setData({ ...data, processSteps }); }} placeholder="#" className="w-16 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              <div className="flex-1 space-y-2">
                <input type="text" value={step.title} onChange={(e) => { const processSteps = [...data.processSteps]; processSteps[i] = { ...processSteps[i], title: e.target.value }; setData({ ...data, processSteps }); }} placeholder="Title" className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
                <textarea value={step.description} onChange={(e) => { const processSteps = [...data.processSteps]; processSteps[i] = { ...processSteps[i], description: e.target.value }; setData({ ...data, processSteps }); }} placeholder="Description" rows={2} className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              </div>
              <button type="button" onClick={() => setData({ ...data, processSteps: data.processSteps.filter((_, j) => j !== i) })} className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, processSteps: [...data.processSteps, { number: String(data.processSteps.length + 1).padStart(2, "0"), title: "", description: "" }] })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Step
          </button>
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
        <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-green-600">Changes saved successfully.</span>}
      </div>
    </div>
  );
}
