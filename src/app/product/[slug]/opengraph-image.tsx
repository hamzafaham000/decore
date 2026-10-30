import { ImageResponse } from "next/og";

import { formatPKR } from "@/lib/money";
import { getProduct } from "@/lib/products";

export const alt = "A piece by Decore, made to order in Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = getProduct((await params).slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f3ee",
          color: "#171614",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#6f6a61",
          }}
        >
          <div style={{ display: "flex" }}>Decore</div>
          <div style={{ display: "flex" }}>{product?.line ?? "Shop"}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 70, lineHeight: 1.05, letterSpacing: -2, fontWeight: 500 }}>
            {product?.name ?? "The shop"}
          </div>
          {product && (
            <div style={{ marginTop: 22, fontSize: 28, color: "#6f6a61", maxWidth: 900 }}>
              {product.tagline}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #dfdbd2",
            paddingTop: 24,
            fontSize: 22,
            color: "#171614",
          }}
        >
          <div style={{ display: "flex", fontWeight: 600 }}>
            {product ? formatPKR(product.price) : "Made to order"}
          </div>
          <div style={{ display: "flex", color: "#6f6a61" }}>
            {product
              ? `Made to order in ${product.leadTimeWeeks} weeks · Delivered across Pakistan`
              : "Delivered across Pakistan"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
