import { getProducts } from "@/lib/catalog";
import { buildSearchDoc } from "@/lib/search";

/** Built on the server and handed to the header as props. */
export async function getSearchIndex() {
  const products = await getProducts();
  return products.map(buildSearchDoc);
}
