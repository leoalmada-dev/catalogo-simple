import { describe, it, expect } from "vitest";
import { buildWaTrackingUrl, buildWaMessage } from "@/lib/whatsapp";

describe("buildWaTrackingUrl", () => {
    it("arma la URL con pid, vid y source", () => {
        const url = buildWaTrackingUrl({
            productId: "p1",
            productSlug: "producto-x",
            source: "product",
            variantId: "v1",
            productName: "Producto X",
            variantLabel: "Rojo",
        });

        expect(url).toContain("/w?");
        expect(url).toContain("pid=p1");
        expect(url).toContain("vid=v1");
        expect(url).toContain("src=product");
        expect(url).toContain("pslug=producto-x");
    });
});

describe("buildWaMessage", () => {
    it("incluye nombre de producto y variante si se pasa", () => {
        const msg = buildWaMessage({
            productName: "Producto X",
            productSlug: "producto-x",
            variantLabel: "Rojo",
            siteUrl: "https://ejemplo.com",
        });

        expect(msg).toContain("Producto X");
        expect(msg).toContain("Variante: Rojo");
        expect(msg).toContain("https://ejemplo.com/producto/producto-x");
    });
});
