// src/subscribers/product-subscriber.ts

import { MedusaEventHandlerParams } from "@medusajs/types";
import { EntityManager } from "typeorm";
import MeiliSearch from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const INDEX_NAME = "products";

export default async function productSubscriber({
  event,
  entityManager,
  data,
}: MedusaEventHandlerParams) {
  // Ensure the products index exists
  await client.index(INDEX_NAME).updateIndex();

  const index = client.index(INDEX_NAME);

  switch (event) {
    case "product.created":
    case "product.updated": {
      const product = data;
      await index.addDocuments([product]);
      break;
    }
    case "product.deleted": {
      const { id } = data;
      await index.deleteDocument(id);
      break;
    }
  }
}
