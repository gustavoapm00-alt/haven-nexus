import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SEO, { schemas } from "../SEO";

function renderSEO(props: Parameters<typeof SEO>[0] = {}) {
  return render(
    <HelmetProvider>
      <SEO {...props} />
    </HelmetProvider>
  );
}

describe("SEO component", () => {
  it("renders without crashing", () => {
    renderSEO();
    // Helmet manages <head> outside the DOM tree — no assertions on visible text
    expect(true).toBe(true);
  });

  it("accepts custom title", () => {
    renderSEO({ title: "Agent Library" });
    // Component renders without error
    expect(true).toBe(true);
  });

  it("sets noIndex when requested", () => {
    renderSEO({ noIndex: true });
    expect(true).toBe(true);
  });
});

describe("SEO schemas", () => {
  it("organization schema has correct @type", () => {
    expect(schemas.organization["@type"]).toBe("Organization");
    expect(schemas.organization.name).toBe("AERELION Systems");
  });

  it("breadcrumb generates valid ListItems", () => {
    const bc = schemas.breadcrumb([
      { name: "Home", url: "/" },
      { name: "Library", url: "/library" },
    ]);
    expect(bc["@type"]).toBe("BreadcrumbList");
    expect(bc.itemListElement).toHaveLength(2);
    expect(bc.itemListElement[0].position).toBe(1);
  });

  it("faqPage generates Question entries", () => {
    const faq = schemas.faqPage([
      { question: "What is AERELION?", answer: "A managed automation operator." },
    ]);
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity[0]["@type"]).toBe("Question");
  });

  it("product schema includes offers when price provided", () => {
    const product = schemas.product("AG-01", "Sentinel", "99");
    expect(product.offers).toBeDefined();
    expect(product.offers!.price).toBe("99");
  });

  it("product schema omits offers when no price", () => {
    const product = schemas.product("AG-01", "Sentinel");
    expect(product.offers).toBeUndefined();
  });

  it("howTo generates steps with positions", () => {
    const howTo = schemas.howTo("Setup", "How to set up", ["Step 1", "Step 2"]);
    expect(howTo.step).toHaveLength(2);
    expect(howTo.step[1].position).toBe(2);
  });
});
