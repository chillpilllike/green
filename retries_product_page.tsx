import { GetServerSideProps } from "next";
import ProductTemplate from "@modules/products/templates";
import { getRegion, getProductByHandle } from "@lib/data/regions";

type Props = {
  region: any;
  product: any;
  countryCode: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { countryCode, handle } = context.params!;

  try {
    // Fetch the region based on the countryCode
    const region = await getRegion(countryCode as string);
    if (!region) {
      return { notFound: true };
    }

    // Fetch the product based on the handle and region
    const product = await getProductByHandle(handle as string, region.id);
    if (!product) {
      return { notFound: true };
    }

    return {
      props: {
        region,
        product,
        countryCode: countryCode as string,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch product or region: ${error instanceof Error ? error.message : error}`);
    return { notFound: true };
  }
};

export default function ProductPage({ region, product, countryCode }: Props) {
  return (
    <ProductTemplate
      product={product}
      region={region}
      countryCode={countryCode}
    />
  );
}
