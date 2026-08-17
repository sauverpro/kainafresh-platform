# KainaFresh CMS API Contract

This document outlines the exact data structure the frontend expects to receive from the backend CMS endpoints.

## Base Endpoint
**GET `/api/pages/slug/{slug}`**

The frontend will call this endpoint to get all the sections for a specific page.

**Expected Response Shape:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Home",
    "slug": "home",
    "status": "published",
    "sections": [
      {
        "id": 101,
        "type": "hero",
        "title": "Home Hero",
        "content": { ... },
        "position": 0
      },
      // ... other sections
    ]
  }
}
```

---

## 1. Home Page (`slug: "home"`)

### Section Type: `hero`
```json
"content": {
  "badge": "100% Organic · Farm to Table",
  "heading": "Elevate Your Health with Our Proven",
  "headingAccent": "Organic",
  "headingAccentSecondary": "Farming!",
  "subheading": "Our expert team crafts tailored strategies, executes effective farming, and drives sustainable growth for your family's nutrition.",
  "primaryCta": { "label": "Shop Now", "to": "/products" },
  "secondaryCta": { "label": "Watch videos", "to": "/wholesale" }
}
```

### Section Type: `value_props`
```json
"content": {
  "tag": "Why KainaFresh",
  "heading": "Fresh Food, Done Right",
  "items": [
    {
      "iconName": "Leaf", // Frontend maps this to lucide-react icon
      "title": "Organically Grown",
      "description": "No synthetic chemicals. Every crop is grown using eco-friendly practices."
    }
    // ... 3 more items
  ]
}
```

### Section Type: `featured_products`
> **Note:** The actual products are NOT stored in the CMS page sections. Products are managed separately by the Sales Manager. This CMS section only controls the text surrounding the products.
```json
"content": {
  "tag": "Fresh Today",
  "heading": "Featured Products",
  "subheading": "Directly from our farm, available for order today."
}
```
*(The frontend will call `GET /api/products?featured=true` to fetch the actual product cards to display here).*

### Section Type: `faqs`
```json
"content": {
  "tag": "Got Questions?",
  "heading": "Frequently Asked Questions",
  "subheading": "Everything you need to know about ordering from KainaFresh.",
  "items": [
    {
      "question": "How do I place an order?",
      "answer": "Browse our products, add your items to the cart, and checkout..."
    }
  ]
}
```

---

## 2. About Page (`slug: "about"`)

### Section Type: `hero`
```json
"content": {
  "location": "Kigali, Rwanda",
  "heading": "Growing Fresh.",
  "headingHighlight": "Building Community.",
  "description": "KainaFresh is a Rwanda-based farm dedicated to producing premium, organic agricultural produce...",
  "cta": { "label": "Get in Touch", "to": "/contact" }
}
```

### Section Type: `stats_bar`
```json
"content": {
  "items": [
    { "value": "350+", "label": "Happy Customers" },
    { "value": "100%", "label": "Organic Certified" }
  ]
}
```

### Section Type: `story`
```json
"content": {
  "tag": "Our Story",
  "heading": "From a small plot of land to a thriving farm.",
  "paragraphs": [
    "KainaFresh started with a simple belief...",
    "Today, we manage over 20 varieties of produce..."
  ]
}
```

### Section Type: `values`
```json
"content": {
  "tag": "What We Stand For",
  "heading": "Our Mission & Values",
  "subheading": "Everything we do is guided by a commitment to freshness, sustainability, and the communities...",
  "items": [
    {
      "iconName": "ShieldCheck",
      "title": "Quality & Safety",
      "description": "Every product is inspected, packed, and handled under strict quality standards."
    }
  ]
}
```

### Section Type: `team`
```json
"content": {
  "tag": "The People Behind the Farm",
  "heading": "Meet Our Team",
  "members": [
    {
      "name": "Jean-Pierre Uwimana",
      "role": "Founder & Farm Director",
      "initials": "JU"
    }
  ]
}
```

### Section Type: `cta`
```json
"content": {
  "heading": "Ready to taste the difference?",
  "subheading": "Order fresh produce from KainaFresh or get in touch to learn more about our farm.",
  "primaryCta": { "label": "Shop Now", "to": "/products" },
  "secondaryCta": { "label": "Contact Us", "to": "/contact" }
}
```

---

## 3. Wholesale Page (`slug: "wholesale"`)

### Section Type: `hero`
```json
"content": {
  "badge": "B2B & Exports",
  "heading": "Partner with",
  "headingAccent": "KainaFresh",
  "description": "We supply premium, organic produce in bulk to restaurants, supermarkets, and international exporters...",
  "primaryCta": { "label": "Request a Quote", "to": "#quote-form" },
  "secondaryCta": { "label": "Download Catalog", "to": "/catalog.pdf" }
}
```

### Section Type: `benefits`
```json
"content": {
  "tag": "Why KainaFresh",
  "heading": "The Wholesale Advantage",
  "items": [
    {
      "iconName": "Scale",
      "title": "Consistent Volume",
      "description": "We manage large-scale cultivation to ensure you never run out of supply."
    }
  ]
}
```

### Section Type: `process`
```json
"content": {
  "tag": "How It Works",
  "heading": "Our Export & Wholesale Process",
  "steps": [
    {
      "stepNumber": "01",
      "title": "Inquiry & Quotation",
      "description": "Contact us with your volume requirements and preferred schedule."
    }
  ]
}
```

### Section Type: `form_info`
```json
"content": {
  "heading": "Become a Partner",
  "description": "Fill out the form below to request our wholesale pricing catalog or to schedule a farm visit.",
  "contactEmail": "wholesale@kainafresh.rw",
  "contactPhone": "+250 788 123 456"
}
```
