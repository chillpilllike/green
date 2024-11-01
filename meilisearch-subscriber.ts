import { EventBusService } from "@medusajs/medusa";
import { MeiliSearch } from "meilisearch";
export default MeiliSearchSubscriber;

class MeiliSearchSubscriber {
  private eventBus_: EventBusService;
  private meiliClient: MeiliSearch;

  constructor({ eventBusService }: { eventBusService: EventBusService }) {
    this.eventBus_ = eventBusService;
    this.meiliClient = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST!,
      apiKey: process.env.MEILISEARCH_API_KEY!,
    });

    // Subscribe to product events
    this.eventBus_.subscribe("product.created", this.indexProduct.bind(this));
    this.eventBus_.subscribe("product.updated", this.indexProduct.bind(this));
    this.eventBus_.subscribe("product.deleted", this.removeProduct.bind(this));
  }

  // Helper to format and index product data
  async indexProduct(product) {
    const formattedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      variant_sku: product.variants ? product.variants.map((v: any) => v.sku) : [],
      thumbnail: product.thumbnail,
      handle: product.handle,
    };

    try {
      await this.meiliClient.index("products").addDocuments([formattedProduct]);
      console.log(`Indexed product ${product.id}`);
    } catch (error) {
      console.error(`Error indexing product ${product.id}:`, error);
    }
  }

  // Remove product from Meilisearch index
  async removeProduct(data) {
    try {
      await this.meiliClient.index("products").deleteDocument(data.id);
      console.log(`Removed product ${data.id} from index`);
    } catch (error) {
      console.error(`Error removing product ${data.id}:`, error);
    }
  }
}

export default MeiliSearchSubscriber;
