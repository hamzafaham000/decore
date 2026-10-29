import { ImageResponse } from "next/og";

export const alt = "Decore — furniture and objects, made to order in Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card that shows up when the store is shared on WhatsApp, Instagram or X. */
export default function OpengraphImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#171614" }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Decore
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 82, lineHeight: 1.02, letterSpacing: -3, fontWeight: 500 }}>
            Fewer things,
          </div>
          <div
            style={{
              fontSize: 82,
              lineHeight: 1.02,
              letterSpacing: -3,
              fontWeight: 500,
              color: "#1d3b31",
              fontStyle: "italic",
            }}
          >
            made properly.
          </div>
          <div style={{ marginTop: 30, fontSize: 27, color: "#6f6a61" }}>
            Furniture and objects, made to order in Pakistan.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #dfdbd2",
            paddingTop: 24,
            fontSize: 18,
            letterSpacing: 3,
            color: "#6f6a61",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>decore.pk</div>
          <div style={{ display: "flex" }}>Hand-finished · Delivered nationwide</div>
        </div>
      </div>
    ),
    size,
  );
}
