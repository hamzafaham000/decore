"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import type { Detail } from "@/lib/catalog-types";

import type { ProductFormState } from "./actions";

type ProductFormProduct = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  price: number;
  tagline: string;
  description: string;
  finishes: string[];
  materials: Detail[];
  dimensions: Detail[];
  leadTimeWeeks: number;
  glyph: string;
  surfaces: string[];
  published: boolean;
  featured: boolean;
  position: number;
  images: string[];
};

const initial: ProductFormState = {};

const glyphOptions = [
  { value: "seating", label: "Seating" },
  { value: "table", label: "Table" },
  { value: "lighting", label: "Lighting" },
  { value: "workspace", label: "Workspace" },
  { value: "object", label: "Decor object" },
];

function linesOf(details: Detail[]) {
  return details.map((detail) => `${detail.label}: ${detail.value}`).join("\n");
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="a-label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] leading-relaxed text-[#657069]">{hint}</span>}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="a-card p-5">
      <h2 className="text-[13px] font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-xl text-[11.5px] leading-relaxed text-[#657069]">{description}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: { id: string; label: string }[];
  product?: ProductFormProduct;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [urlDraft, setUrlDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setUploadError(null);

    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);

        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const result = (await response.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "That image could not be uploaded.");
        }

        setImages((current) => [...current, result.url!]);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    setImages((current) => [...current, url]);
    setUrlDraft("");
  }

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      {images.map((url) => (
        <input key={url} type="hidden" name="image" value={url} />
      ))}

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-[#edcfc8] bg-[#fbedea] px-4 py-3 text-sm text-[#a03d2c]"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-5">
          <Section title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input
                  name="name"
                  required
                  defaultValue={product?.name}
                  className="field mt-1.5"
                  placeholder="Suhbat Stacked Sculpture"
                />
              </Field>

              <Field label="Category">
                <select
                  name="categoryId"
                  required
                  defaultValue={product?.categoryId ?? ""}
                  className="field mt-1.5"
                >
                  <option value="" disabled>
                    Choose one
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Tagline" hint="One sentence. It sits under the name on cards and search.">
              <input
                name="tagline"
                required
                defaultValue={product?.tagline}
                className="field mt-1.5"
                placeholder="Two arms of cast stone, holding a single sphere of brass."
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                required
                rows={6}
                defaultValue={product?.description}
                className="field mt-1.5 resize-y leading-relaxed"
              />
            </Field>

            <Field
              label="Web address"
              hint={`Shown as /product/${product?.slug ?? "your-product"}. Leave blank to build it from the name.`}
            >
              <input
                name="slug"
                defaultValue={product?.slug}
                className="field mt-1.5"
                placeholder="suhbat-stacked-sculpture"
                spellCheck={false}
              />
            </Field>
          </Section>

          <Section
            title="Details"
            description="One per line, as Label: Value. These become the specification list on the product page."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Materials">
                <textarea
                  name="materials"
                  rows={6}
                  defaultValue={product ? linesOf(product.materials) : ""}
                  className="field mt-1.5 resize-y font-mono text-xs leading-relaxed"
                  placeholder={"Frame: Solid walnut\nFinish: Hardwax oil"}
                />
              </Field>

              <Field label="Dimensions">
                <textarea
                  name="dimensions"
                  rows={6}
                  defaultValue={product ? linesOf(product.dimensions) : ""}
                  className="field mt-1.5 resize-y font-mono text-xs leading-relaxed"
                  placeholder={"Width: 64 cm\nDepth: 68 cm\nHeight: 72 cm"}
                />
              </Field>
            </div>

            <Field label="Finishes" hint="One per line. Shown as a count on cards.">
              <textarea
                name="finishes"
                rows={4}
                defaultValue={product?.finishes.join("\n")}
                className="field mt-1.5 resize-y font-mono text-xs leading-relaxed"
                placeholder={"Natural walnut\nSmoked oak\nBlackened brass"}
              />
            </Field>
          </Section>

          <Section title="Photography" description="The first image is the cover. Use the arrows to reorder.">
            {images.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((url, index) => (
                  <li
                    key={`${url}-${index}`}
                    className="overflow-hidden rounded-lg border border-[#e2e7e3] bg-[#f3f5f3]"
                  >
                    <div
                      role="img"
                      aria-label={index === 0 ? "Cover image" : `Image ${index + 1}`}
                      className="aspect-square bg-cover bg-center"
                      style={{ backgroundImage: `url("${url.replace(/"/g, "%22")}")` }}
                    />
                    <div className="flex items-center justify-between gap-1 border-t border-[#e2e7e3] bg-white px-2 py-1.5">
                      <span className="text-[10px] font-medium text-[#657069]">
                        {index === 0 ? "Cover" : index + 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Move earlier"
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                          className="rounded px-1 text-sm text-[#5e6963] disabled:opacity-30"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          aria-label="Move later"
                          disabled={index === images.length - 1}
                          onClick={() => move(index, 1)}
                          className="rounded px-1 text-sm text-[#5e6963] disabled:opacity-30"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                          className="rounded px-1 text-sm text-[#a03d2c]"
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#657069]">
                No photographs yet. The shop draws a placeholder until you add one.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={(event) => upload(event.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`a-btn a-btn-secondary ${uploading ? "pointer-events-none opacity-50" : ""}`}
              >
                {uploading ? "Uploading…" : "Upload images"}
              </label>
              <span className="text-[11px] text-[#657069]">JPEG, PNG, WebP or AVIF, up to 10 MB each.</span>
            </div>

            {uploadError && <p className="text-sm text-[#a03d2c]">{uploadError}</p>}

            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="a-label">Or add by URL</span>
                <input
                  value={urlDraft}
                  onChange={(event) => setUrlDraft(event.target.value)}
                  className="field mt-1.5"
                  placeholder="https://… or /products/name.avif"
                  spellCheck={false}
                />
              </label>
              <button type="button" onClick={addUrl} className="a-btn a-btn-secondary">
                Add
              </button>
            </div>
          </Section>
        </div>

        <div className="min-w-0 space-y-5">
          <Section title="Price & making">
            <Field label="Price (PKR)" hint="Whole rupees, no decimals.">
              <input
                name="price"
                type="number"
                min={1}
                step={1}
                required
                defaultValue={product?.price}
                className="field mt-1.5 tabular-nums"
              />
            </Field>

            <Field label="Lead time (weeks)">
              <input
                name="leadTimeWeeks"
                type="number"
                min={1}
                max={52}
                step={1}
                defaultValue={product?.leadTimeWeeks ?? 4}
                className="field mt-1.5 tabular-nums"
              />
            </Field>

            <Field label="Shape" hint="Used by the drawn placeholder before photography exists.">
              <select name="glyph" defaultValue={product?.glyph ?? "object"} className="field mt-1.5">
                {glyphOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <fieldset>
              <legend className="a-label">For</legend>
              <div className="mt-2 flex gap-5 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="surface"
                    value="home"
                    defaultChecked={product ? product.surfaces.includes("home") : true}
                    className="h-4 w-4"
                  />
                  Home
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="surface"
                    value="office"
                    defaultChecked={product?.surfaces.includes("office")}
                    className="h-4 w-4"
                  />
                  Office
                </label>
              </div>
            </fieldset>
          </Section>

          <Section title="Publishing">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={product ? product.published : true}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                Live on the shop
                <span className="mt-0.5 block text-[11px] text-[#657069]">
                  Off keeps it a draft only you can see.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                Feature on the home page
                <span className="mt-0.5 block text-[11px] text-[#657069]">
                  One at a time. The first featured product wins.
                </span>
              </span>
            </label>

            <Field label="Order in the shop" hint="Lower numbers come first.">
              <input
                name="position"
                type="number"
                min={0}
                step={1}
                defaultValue={product?.position ?? 0}
                className="field mt-1.5 tabular-nums"
              />
            </Field>
          </Section>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={pending || uploading}
              className="a-btn a-btn-primary w-full"
            >
              {pending ? "Saving…" : submitLabel}
            </button>
            <Link href="/admin/products" className="a-btn a-btn-quiet w-full">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
