import { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductTemplate from "@modules/products/templates";
import { getRegion, listRegions } from "@lib/data/regions";
import { getProductByHandle } from "@lib/data/products";
import { sdk } from "@lib/config";

type Props = {
  params: Promise<{ countryCode: string; handle: string }>;
};

// Utility function for retries
async function fetchWithRetries(fetchFn, args = [], retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn(...args);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

export async function generateStaticParams() {
  try {
    const countryCodes = await fetchWithRetries(listRegions, [], 3, 1000).then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    );

    if (!countryCodes) {
      return [];
    }

    const { products } = await fetchWithRetries(
      sdk.store.product.list,
      [{ fields: "handle" }, { next: { tags: ["products"] } }],
      3,
      1000
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
  const params = await props.params;
  const { handle } = params;

  const region = await fetchWithRetries(getRegion, [params.countryCode], 3, 1000);
  if (!region) {
    notFound();
  }

  const product = await fetchWithRetries(getProductByHandle, [handle, region.id], 3, 1000);
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
  const params = await props.params;

  const region = await fetchWithRetries(getRegion, [params.countryCode], 3, 1000);
  if (!region) {
    notFound();
  }

  const pricedProduct = await fetchWithRetries(
    getProductByHandle,
    [params.handle, region.id],
    3,
    1000
  );
  if (!pricedProduct) {
    notFound();
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  );
}
