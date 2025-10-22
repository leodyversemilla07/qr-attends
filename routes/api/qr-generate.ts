// API route for QR code generation
import { define } from "../../utils.ts";
import QRCode from "qrcode";
import { uuidSchema, validateInput } from "../../middleware/validation.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const url = new URL(ctx.req.url);
    const eventId = url.searchParams.get("eventId");
    const orgId = url.searchParams.get("orgId") || "default-org";

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Event ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate UUID
    const validation = validateInput(uuidSchema, eventId);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Generate QR code data URL (contains the check-in URL)
      const checkInUrl =
        `${url.origin}/check-in?eventId=${validation.data}&orgId=${orgId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 512,
        margin: 4,
      });

      return new Response(
        JSON.stringify({
          qrCode: qrCodeDataUrl,
          checkInUrl,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate QR code: " +
            (err instanceof Error ? err.message : String(err)),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
