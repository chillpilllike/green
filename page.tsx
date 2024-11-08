import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { sdk } from "@lib/config"

type Props = {
  params: { countryCode: string; handle: string }
}

export async function generateStaticParams() {
  try {
    // Fetch country codes
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat().filter(Boolean) as string[]
    )

    if (!countryCodes) {
      return []
    }

    // Fetch products for each country
    const products = await Promise.all(
      countryCodes.map((countryCode) => getProductsList({ countryCode }))
    ).then((responses) =>
      responses.map(({ response }) => response.products).flat()
    )

    // Generate static parameters for each country and product
    const staticParams = countryCodes
      .map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle,
        }))
      )
      .flat()
      .filter((param) => param.handle)

    return staticParams
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode, handle } = params
  const region = await getRegion(countryCode)

  if (!region) {
    console.error("Region not found:", countryCode)
    return { title: "Product Not Found" }
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    console.error("Product not found:", handle)
    return { title: "Product Not Found" }
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}
