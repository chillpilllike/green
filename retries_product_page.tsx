import { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductTemplate from "@modules/products/templates";
import { getRegion, listRegions } from "@lib/data/regions";
import { getProductByHandle } from "@lib/data/products";
import { sdk } from "@lib/config";

type Props = {
  params: { countryCode: string; handle: string };
};

// Define a type for the fetch function
type FetchFunction<T> = (...args: any[]) => Promise<T>;

// Utility function for retries
async function fetchWithRetries<T>(
  fetchFn: FetchFunction<T>,
  args: any[] = [],
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn(...args);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${(error as Error).message}`);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("All retries failed.");
}

export async function generateStaticParams() {
  try {
    const countryCodes = await fetchWithRetries(listRegions, []).then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    );

    if (!countryCodes) {
      return [];
    }

    const { products } = await fetchWithRetries(
      sdk.store.product.list,
      [{ fields: "handle" }, { next: { tags: ["products"] } }]
    );

    return countryCodes
      .map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle,
        }))
      )
      .flat()
      .filter((param) => param.handle);
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    );
    return [];
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, handle } = props.params;

  const region = await fetchWithRetries(getRegion, [countryCode]);
  if (!region) {
    notFound();
  }

  const product = await fetchWithRetries(getProductByHandle, [handle, region.id]);
  if (!product) {
    notFound();
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default async function ProductPage(props: Props) {
  const { countryCode, handle } = props.params;

  const region = await fetchWithRetries(getRegion, [countryCode]);
  if (!region) {
    notFound();
  }

  const pricedProduct = await fetchWithRetries(getProductByHandle, [handle, region.id]);
  if (!pricedProduct) {
    notFound();
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={countryCode}
    />
  );
}
