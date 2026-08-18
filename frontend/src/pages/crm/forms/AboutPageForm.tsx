import { useState } from "react";
import { Plus, Trash2, Save, Loader2, Upload } from "lucide-react";

interface HeroSection {
  tag: string;
  heading: string;
  description: string;
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

interface StorySection {
  tag: string;
  heading: string;
  paragraphs: string[];
}

interface Value {
  title: string;
  description: string;
}

interface ValuesSection {
  tag: string;
  heading: string;
  subheading: string;
  items: Value[];
}

interface TeamMember {
  name: string;
  role: string;
}

interface CtaSection {
  heading: string;
  paragraph: string;
  primaryButton: string;
  secondaryButton: string;
}

interface AboutPageData {
  hero: HeroSection;
  stats: Stat[];
  story: StorySection;
  values: ValuesSection;
  team: TeamMember[];
  cta: CtaSection;
}

const DEFAULTS: AboutPageData = {
  hero: {
    tag: "Kigali, Rwanda",
    heading: "Growing Fresh. Building Community.",
    description:
      "KainaFresh is a Rwanda-based farm dedicated to producing premium, organic agricultural produce — from our fields directly to your table.",
    image: "",
  },
  stats: [
    { value: "350+", label: "Happy Customers" },
    { value: "5+", label: "Years Farming" },
    { value: "100%", label: "Organic Certified" },
    { value: "20+", label: "Produce Varieties" },
  ],
  story: {
    tag: "Our Story",
    heading: "From a small plot of land to a thriving farm.",
    paragraphs: [
      "KainaFresh started with a simple belief: that Rwandans deserve access to food that is genuinely fresh, honestly grown, and responsibly delivered.",
      "Today, we manage over 20 varieties of produce — from tomatoes and avocados to seasonal greens and tropical fruits.",
    ],
  },
  values: {
    tag: "What We Stand For",
    heading: "Our Mission & Values",
    subheading: "Everything we do is guided by a commitment to freshness and sustainability.",
    items: [
      { title: "Sustainable Farming", description: "We use eco-friendly practices that protect the soil and biodiversity." },
      { title: "Quality & Safety", description: "Every product is inspected and handled under strict quality standards." },
      { title: "Community First", description: "We work directly with local communities, creating fair employment." },
      { title: "Farm Transparency", description: "From seed to delivery, you deserve to know where your food comes from." },
    ],
  },
  team: [
    { name: "Jean-Pierre Uwimana", role: "Founder & Farm Director" },
    { name: "Amina Keza", role: "Head of Operations" },
    { name: "David Mugisha", role: "Export & Logistics Manager" },
  ],
  cta: {
    heading: "Ready to taste the difference?",
    paragraph: "Order fresh produce from KainaFresh or get in touch to learn more about our farm.",
    primaryButton: "Shop Now",
    secondaryButton: "Contact Us",
  },
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

export default function AboutPageForm(props: { pageId: string }) {
  const [data, setData] = useState<AboutPageData>(DEFAULTS);
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
        <div className="mt-4">
          <Field label="Hero Image">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-white/10 dark:bg-gray-800">
                {data.hero.image ? (
                  <img src={data.hero.image} alt="Hero" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                value={data.hero.image}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, image: e.target.value } })}
                placeholder="Image URL or upload..."
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Stats Bar */}
      <SectionCard title="Stats Bar">
        <div className="space-y-3">
          {data.stats.map((stat, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input
                type="text"
                value={stat.value}
                onChange={(e) => {
                  const stats = [...data.stats];
                  stats[i] = { ...stats[i], value: e.target.value };
                  setData({ ...data, stats });
                }}
                placeholder="Value"
                className="w-28 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => {
                  const stats = [...data.stats];
                  stats[i] = { ...stats[i], label: e.target.value };
                  setData({ ...data, stats });
                }}
                placeholder="Label"
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
              />
              <button type="button" onClick={() => setData({ ...data, stats: data.stats.filter((_, j) => j !== i) })} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, stats: [...data.stats, { value: "", label: "" }] })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Stat
          </button>
        </div>
      </SectionCard>

      {/* Our Story */}
      <SectionCard title="Our Story Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tag">
            <TextInput value={data.story.tag} onChange={(v) => setData({ ...data, story: { ...data.story, tag: v } })} />
          </Field>
          <Field label="Heading">
            <TextInput value={data.story.heading} onChange={(v) => setData({ ...data, story: { ...data.story, heading: v } })} />
          </Field>
        </div>
        <div className="mt-4 space-y-3">
          {data.story.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-3">
              <TextArea value={p} onChange={(v) => { const paragraphs = [...data.story.paragraphs]; paragraphs[i] = v; setData({ ...data, story: { ...data.story, paragraphs } }); }} rows={3} placeholder={`Paragraph ${i + 1}`} />
              <button type="button" onClick={() => setData({ ...data, story: { ...data.story, paragraphs: data.story.paragraphs.filter((_, j) => j !== i) } })} className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, story: { ...data.story, paragraphs: [...data.story.paragraphs, ""] } })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Paragraph
          </button>
        </div>
      </SectionCard>

      {/* Mission & Values */}
      <SectionCard title="Mission & Values Section">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tag">
            <TextInput value={data.values.tag} onChange={(v) => setData({ ...data, values: { ...data.values, tag: v } })} />
          </Field>
          <Field label="Heading">
            <TextInput value={data.values.heading} onChange={(v) => setData({ ...data, values: { ...data.values, heading: v } })} />
          </Field>
          <Field label="Subheading">
            <TextInput value={data.values.subheading} onChange={(v) => setData({ ...data, values: { ...data.values, subheading: v } })} />
          </Field>
        </div>
        <div className="mt-4 space-y-3">
          {data.values.items.map((item, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <div className="flex-1 space-y-2">
                <input type="text" value={item.title} onChange={(e) => { const items = [...data.values.items]; items[i] = { ...items[i], title: e.target.value }; setData({ ...data, values: { ...data.values, items } }); }} placeholder="Title" className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
                <textarea value={item.description} onChange={(e) => { const items = [...data.values.items]; items[i] = { ...items[i], description: e.target.value }; setData({ ...data, values: { ...data.values, items } }); }} placeholder="Description" rows={2} className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              </div>
              <button type="button" onClick={() => setData({ ...data, values: { ...data.values, items: data.values.items.filter((_, j) => j !== i) } })} className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, values: { ...data.values, items: [...data.values.items, { title: "", description: "" }] } })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Value
          </button>
        </div>
      </SectionCard>

      {/* Team */}
      <SectionCard title="Team Section">
        <div className="space-y-3">
          {data.team.map((member, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input type="text" value={member.name} onChange={(e) => { const team = [...data.team]; team[i] = { ...team[i], name: e.target.value }; setData({ ...data, team }); }} placeholder="Name" className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              <input type="text" value={member.role} onChange={(e) => { const team = [...data.team]; team[i] = { ...team[i], role: e.target.value }; setData({ ...data, team }); }} placeholder="Role" className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white" />
              <button type="button" onClick={() => setData({ ...data, team: data.team.filter((_, j) => j !== i) })} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setData({ ...data, team: [...data.team, { name: "", role: "" }] })} className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10">
            <Plus className="h-4 w-4" /> Add Team Member
          </button>
        </div>
      </SectionCard>

      {/* CTA */}
      <SectionCard title="Bottom CTA Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading">
            <TextInput value={data.cta.heading} onChange={(v) => setData({ ...data, cta: { ...data.cta, heading: v } })} />
          </Field>
          <Field label="Paragraph">
            <TextInput value={data.cta.paragraph} onChange={(v) => setData({ ...data, cta: { ...data.cta, paragraph: v } })} />
          </Field>
          <Field label="Primary Button">
            <TextInput value={data.cta.primaryButton} onChange={(v) => setData({ ...data, cta: { ...data.cta, primaryButton: v } })} />
          </Field>
          <Field label="Secondary Button">
            <TextInput value={data.cta.secondaryButton} onChange={(v) => setData({ ...data, cta: { ...data.cta, secondaryButton: v } })} />
          </Field>
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
