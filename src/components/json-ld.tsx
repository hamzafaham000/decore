/**
 * Structured data is not executable code, so a native script tag is correct here.
 * Escaping `<` keeps catalogue copy from ever closing the tag early.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
