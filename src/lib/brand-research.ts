import { compactText } from "@/lib/utils";

type BrandResearchOptions = {
  brandName?: string | null;
  website?: string | null;
  socialHandle?: string | null;
};

export type BrandResearchResult = {
  promptContext: string | null;
  sources: {
    website?: string;
    instagram?: string;
  };
  suggestions: {
    tagline?: string;
    phone?: string;
    officeAddress?: string;
    instagramHandle?: string;
  };
  warnings: string[];
};

const requestHeaders = {
  "user-agent":
    "Mozilla/5.0 (compatible; BrandPosterAI/1.0; +https://image-generator-sparkos.onrender.com)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
};

function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`).toString();
  } catch {
    return null;
  }
}

function normalizeInstagramUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("@")) {
    return `https://www.instagram.com/${trimmed.slice(1).replace(/\/+$/, "")}/`;
  }

  if (!trimmed.includes("instagram.com")) {
    return null;
  }

  return normalizeUrl(trimmed);
}

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getAttribute(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? decodeHtml(match[1].trim()) : null;
}

function getMeta(html: string, names: string[]) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const name = getAttribute(tag, "name") || getAttribute(tag, "property");

    if (name && names.includes(name.toLowerCase())) {
      return getAttribute(tag, "content");
    }
  }

  return null;
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : null;
}

function htmlToText(html: string) {
  return decodeHtml(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractPhone(text: string) {
  const match = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  return match ? match[0].replace(/\s+/g, " ").trim() : undefined;
}

function extractAddress(text: string) {
  const addressMatch = text.match(
    /(?:address|office|visit us|location)\s*:?\s*([^|]{20,160})/i,
  );
  const candidate = addressMatch?.[1].replace(/\s+/g, " ").trim();

  if (
    !candidate ||
    !/(road|rd\.|street|st\.|avenue|ave|lane|floor|tower|building|bypass|junction)/i.test(candidate)
  ) {
    return undefined;
  }

  return compactText(candidate, 120);
}

function extractInstagramUrl(html: string) {
  const links = Array.from(html.matchAll(/href=["']([^"']*instagram\.com[^"']*)["']/gi))
    .map((match) => decodeHtml(match[1]))
    .map((url) => normalizeUrl(url))
    .filter((url): url is string => Boolean(url));

  return links.find((url) => !/\/(p|reel|tv|stories)\//i.test(url));
}

function instagramHandleFromUrl(url?: string | null) {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    const handle = parsed.pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : undefined;
  } catch {
    return undefined;
  }
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

function analyzeWebsite(html: string) {
  const title = getMeta(html, ["og:title", "twitter:title"]) || getTitle(html);
  const description =
    getMeta(html, ["description", "og:description", "twitter:description"]) || null;
  const keywords = getMeta(html, ["keywords"]);
  const text = htmlToText(html);
  const visibleSummary = compactText(text, 260);
  const instagram = extractInstagramUrl(html);

  return {
    title: title ? compactText(title, 120) : null,
    description: description ? compactText(description, 220) : null,
    keywords: keywords ? compactText(keywords, 160) : null,
    visibleSummary,
    phone: extractPhone(text),
    officeAddress: extractAddress(text),
    instagram,
  };
}

function analyzeInstagram(html: string) {
  const title = getMeta(html, ["og:title", "twitter:title"]) || getTitle(html);
  const description =
    getMeta(html, ["description", "og:description", "twitter:description"]) || null;

  return {
    title: title ? compactText(title, 120) : null,
    description: description ? compactText(description, 220) : null,
  };
}

export async function scrapeBrandResearch(options: BrandResearchOptions): Promise<BrandResearchResult> {
  const sources: BrandResearchResult["sources"] = {};
  const suggestions: BrandResearchResult["suggestions"] = {};
  const warnings: string[] = [];
  const contextLines: string[] = [];
  const websiteUrl = normalizeUrl(options.website);
  let instagramUrl = normalizeInstagramUrl(options.socialHandle);

  if (websiteUrl) {
    sources.website = websiteUrl;

    try {
      const html = await fetchHtml(websiteUrl);
      const website = analyzeWebsite(html);

      if (website.title) {
        contextLines.push(`Website title: ${website.title}`);
      }

      if (website.description) {
        contextLines.push(`Website description: ${website.description}`);
        suggestions.tagline = website.description;
      }

      if (website.keywords) {
        contextLines.push(`Website keywords: ${website.keywords}`);
      }

      if (website.visibleSummary) {
        contextLines.push(`Website visible copy themes: ${website.visibleSummary}`);
      }

      if (website.phone) {
        suggestions.phone = website.phone;
      }

      if (website.officeAddress) {
        suggestions.officeAddress = website.officeAddress;
      }

      if (!instagramUrl && website.instagram) {
        instagramUrl = website.instagram;
      }
    } catch (error) {
      warnings.push(
        `Website scan failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  if (instagramUrl) {
    sources.instagram = instagramUrl;
    suggestions.instagramHandle = instagramHandleFromUrl(instagramUrl);

    try {
      const html = await fetchHtml(instagramUrl);
      const instagram = analyzeInstagram(html);

      if (instagram.title) {
        contextLines.push(`Instagram title: ${instagram.title}`);
      }

      if (instagram.description) {
        contextLines.push(`Instagram profile description: ${instagram.description}`);
      }
    } catch (error) {
      warnings.push(
        `Instagram scan limited: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  return {
    promptContext: contextLines.length > 0 ? contextLines.join("\n") : null,
    sources,
    suggestions,
    warnings,
  };
}
