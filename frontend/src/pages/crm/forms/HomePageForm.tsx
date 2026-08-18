import { useState } from "react";
import { Plus, Trash2, Save, Loader2, Upload } from "lucide-react";

interface HeroSection {
  mainHeader: string;
  subHeader: string;
  description: string;
  image: string;
}

interface ValueProp {
  title: string;
  description: string;
}

interface WhyKainaFreshSection {
  tag: string;
  heading: string;
  items: ValueProp[];
}

interface FeaturedProduct {
  name: string;
  category: string;
  price: string;
  badge: string;
}

interface FeaturedProductsSection {
  tag: string;
  heading: string;
  subheading: string;
  items: FeaturedProduct[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface CtaSection {
  heading: string;
  paragraph: string;
  primaryButton: string;
  secondaryButton: string;
}

interface HomePageData {
  hero: HeroSection;
  whyKainaFresh: WhyKainaFreshSection;
  featuredProducts: FeaturedProductsSection;
  faqs: FaqItem[];
  bottomCta: CtaSection;
}

const DEFAULTS: HomePageData = {
  hero: {
    mainHeader: "Farm Fresh Produce,",
    subHeader: "Delivered Direct to You.",
    description:
      "We grow it. We pack it. We deliver it — fresh, certified, and straight from our fields to your table.",
    image: "",
  },
  whyKainaFresh: {
    tag: "Why KainaFresh",
    heading: "Fresh Food, Done Right",
    items: [
      { title: "Organically Grown", description: "No synthetic chemicals. Every crop is grown using eco-friendly practices." },
      { title: "Fast Delivery", description: "Order today, receive tomorrow. Our cold-chain logistics ensure freshness." },
      { title: "Quality Guaranteed", description: "Every product is hand-inspected and graded before packing." },
      { title: "Bulk & Wholesale", description: "We supply restaurants, supermarkets, and exporters with certified bulk produce." },
    ],
  },
  featuredProducts: {
    tag: "Fresh Today",
    heading: "Featured Products",
    subheading: "Directly from our farm, available for order today.",
    items: [
      { name: "Fresh Green Beans", category: "Vegetables", price: "1200", badge: "Best Seller" },
      { name: "Organic Avocados", category: "Fruits", price: "800", badge: "New" },
    ],
  },
  faqs: [
    { question: "How do I place an order?", answer: "Browse our products, add to cart, and checkout." },
    { question: "Do you deliver to my area?", answer: "We deliver across Kigali and surrounding districts." },
  ],
  bottomCta: {
    heading: "Ready to taste farm-fresh produce?",
    paragraph: "Join over 350 households and businesses already ordering from KainaFresh.",
    primaryButton: "Start Shopping",
    secondaryButton: "Wholesale Inquiries",
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

export default function HomePageForm(props: { pageId: string }) {
  const [data, setData] = useState<HomePageData>(DEFAULTS);
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
      {/* Hero Section */}
      <SectionCard title="Hero Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Main Header">
            <TextInput
              value={data.hero.mainHeader}
              onChange={(v) => setData({ ...data, hero: { ...data.hero, mainHeader: v } })}
              placeholder="Farm Fresh Produce,"
            />
          </Field>
          <Field label="Sub Header">
            <TextInput
              value={data.hero.subHeader}
              onChange={(v) => setData({ ...data, hero: { ...data.hero, subHeader: v } })}
              placeholder="Delivered Direct to You."
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description">
            <TextArea
              value={data.hero.description}
              onChange={(v) => setData({ ...data, hero: { ...data.hero, description: v } })}
              placeholder="Describe your hero section..."
              rows={3}
            />
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

      {/* Why KainaFresh Section */}
      <SectionCard title="Why KainaFresh Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tag">
            <TextInput
              value={data.whyKainaFresh.tag}
              onChange={(v) => setData({ ...data, whyKainaFresh: { ...data.whyKainaFresh, tag: v } })}
            />
          </Field>
          <Field label="Heading">
            <TextInput
              value={data.whyKainaFresh.heading}
              onChange={(v) => setData({ ...data, whyKainaFresh: { ...data.whyKainaFresh, heading: v } })}
            />
          </Field>
        </div>
        <div className="mt-4 space-y-3">
          {data.whyKainaFresh.items.map((item, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const items = [...data.whyKainaFresh.items];
                    items[i] = { ...items[i], title: e.target.value };
                    setData({ ...data, whyKainaFresh: { ...data.whyKainaFresh, items } });
                  }}
                  placeholder="Title"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => {
                    const items = [...data.whyKainaFresh.items];
                    items[i] = { ...items[i], description: e.target.value };
                    setData({ ...data, whyKainaFresh: { ...data.whyKainaFresh, items } });
                  }}
                  placeholder="Description"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = data.whyKainaFresh.items.filter((_, j) => j !== i);
                  setData({ ...data, whyKainaFresh: { ...data.whyKainaFresh, items } });
                }}
                className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const items = [...data.whyKainaFresh.items, { title: "", description: "" }];
              setData({ ...data, whyKainaFresh: { ...data.whyKainaFresh, items } });
            }}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </SectionCard>

      {/* Featured Products Section */}
      <SectionCard title="Featured Products Section">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tag">
            <TextInput
              value={data.featuredProducts.tag}
              onChange={(v) => setData({ ...data, featuredProducts: { ...data.featuredProducts, tag: v } })}
            />
          </Field>
          <Field label="Heading">
            <TextInput
              value={data.featuredProducts.heading}
              onChange={(v) => setData({ ...data, featuredProducts: { ...data.featuredProducts, heading: v } })}
            />
          </Field>
          <Field label="Subheading">
            <TextInput
              value={data.featuredProducts.subheading}
              onChange={(v) => setData({ ...data, featuredProducts: { ...data.featuredProducts, subheading: v } })}
            />
          </Field>
        </div>
        <div className="mt-4 space-y-3">
          {data.featuredProducts.items.map((item, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const items = [...data.featuredProducts.items];
                    items[i] = { ...items[i], name: e.target.value };
                    setData({ ...data, featuredProducts: { ...data.featuredProducts, items } });
                  }}
                  placeholder="Product name"
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => {
                    const items = [...data.featuredProducts.items];
                    items[i] = { ...items[i], category: e.target.value };
                    setData({ ...data, featuredProducts: { ...data.featuredProducts, items } });
                  }}
                  placeholder="Category"
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => {
                    const items = [...data.featuredProducts.items];
                    items[i] = { ...items[i], price: e.target.value };
                    setData({ ...data, featuredProducts: { ...data.featuredProducts, items } });
                  }}
                  placeholder="Price"
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  value={item.badge}
                  onChange={(e) => {
                    const items = [...data.featuredProducts.items];
                    items[i] = { ...items[i], badge: e.target.value };
                    setData({ ...data, featuredProducts: { ...data.featuredProducts, items } });
                  }}
                  placeholder="Badge"
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const items = data.featuredProducts.items.filter((_, j) => j !== i);
                  setData({ ...data, featuredProducts: { ...data.featuredProducts, items } });
                }}
                className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const items = [...data.featuredProducts.items, { name: "", category: "", price: "", badge: "" }];
              setData({ ...data, featuredProducts: { ...data.featuredProducts, items } });
            }}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </SectionCard>

      {/* FAQs Section */}
      <SectionCard title="FAQs Section">
        <div className="space-y-3">
          {data.faqs.map((faq, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-gray-100 p-3 dark:border-white/5">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const faqs = [...data.faqs];
                    faqs[i] = { ...faqs[i], question: e.target.value };
                    setData({ ...data, faqs });
                  }}
                  placeholder="Question"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const faqs = [...data.faqs];
                    faqs[i] = { ...faqs[i], answer: e.target.value };
                    setData({ ...data, faqs });
                  }}
                  placeholder="Answer"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setData({ ...data, faqs: data.faqs.filter((_, j) => j !== i) })}
                className="self-start rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setData({ ...data, faqs: [...data.faqs, { question: "", answer: "" }] })}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 dark:border-white/10"
          >
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>
      </SectionCard>

      {/* Bottom CTA Section */}
      <SectionCard title="Bottom CTA Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading">
            <TextInput
              value={data.bottomCta.heading}
              onChange={(v) => setData({ ...data, bottomCta: { ...data.bottomCta, heading: v } })}
            />
          </Field>
          <Field label="Paragraph">
            <TextInput
              value={data.bottomCta.paragraph}
              onChange={(v) => setData({ ...data, bottomCta: { ...data.bottomCta, paragraph: v } })}
            />
          </Field>
          <Field label="Primary Button Text">
            <TextInput
              value={data.bottomCta.primaryButton}
              onChange={(v) => setData({ ...data, bottomCta: { ...data.bottomCta, primaryButton: v } })}
            />
          </Field>
          <Field label="Secondary Button Text">
            <TextInput
              value={data.bottomCta.secondaryButton}
              onChange={(v) => setData({ ...data, bottomCta: { ...data.bottomCta, secondaryButton: v } })}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-green-600">Changes saved successfully.</span>}
      </div>
    </div>
  );
}
