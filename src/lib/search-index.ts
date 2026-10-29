import { products } from "@/lib/products";
import { buildSearchDoc } from "@/lib/search";

/** Built on the server and handed to the header as props. */
export const searchIndex = products.map(buildSearchDoc);
