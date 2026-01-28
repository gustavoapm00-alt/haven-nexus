import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  structuredData?: object | object[];
  noIndex?: boolean;
}

const BASE_URL = 'https://aerelion.systems';
const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.png`;
const SITE_NAME = 'AERELION Systems';
const DEFAULT_DESCRIPTION = 'AERELION is a managed automation operator for professional services firms. We configure, host, operate, and maintain business automation systems—no code, no infrastructure, no technical work required.';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = 'managed automation, automation operator, hosted automation, business automation services, professional services automation, compliance automation, government contractor automation, workflow automation, operational efficiency',
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  structuredData,
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title 
    ? title.includes('AERELION') ? title : `${title} | ${SITE_NAME}`
    : `${SITE_NAME} – Managed Automation Operator`;
  
  const fullCanonicalUrl = canonicalUrl 
    ? `${BASE_URL}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}` 
    : BASE_URL;

  const structuredDataArray = structuredData 
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="AERELION Systems" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredDataArray.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

// Pre-built structured data schemas
export const schemas = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AERELION Systems",
    "alternateName": "AERELION",
    "url": "https://aerelion.systems",
    "logo": "https://aerelion.systems/logo.png",
    "description": "AERELION is a managed automation operator for professional services firms and compliance-driven organizations. We configure, host, operate, and maintain automation systems.",
    "foundingDate": "2024",
    "email": "contact@aerelion.systems",
    "areaServed": "Worldwide",
    "serviceType": ["Managed Automation", "Business Process Automation", "Workflow Automation"],
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@aerelion.systems",
      "contactType": "customer service",
      "availableLanguage": ["English"]
    }
  },
  
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "AERELION Systems",
    "description": "Managed automation operator for professional services firms",
    "url": "https://aerelion.systems",
    "email": "contact@aerelion.systems",
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-18:00"
  },
  
  breadcrumb: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://aerelion.systems${item.url}`
    }))
  }),
  
  faqPage: (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }),
  
  service: (name: string, description: string, url?: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": name,
    "provider": {
      "@type": "Organization",
      "name": "AERELION Systems",
      "url": "https://aerelion.systems"
    },
    "description": description,
    "areaServed": "Worldwide",
    "url": url ? `https://aerelion.systems${url}` : "https://aerelion.systems"
  }),
  
  webPage: (name: string, description: string, url: string) => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": `https://aerelion.systems${url}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "AERELION Systems",
      "url": "https://aerelion.systems"
    }
  }),
  
  product: (name: string, description: string, price?: string, currency: string = 'USD') => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": "AERELION Systems"
    },
    ...(price && {
      "offers": {
        "@type": "Offer",
        "price": price,
        "priceCurrency": currency,
        "availability": "https://schema.org/InStock"
      }
    })
  }),

  howTo: (name: string, description: string, steps: string[]) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "text": step
    }))
  })
};
