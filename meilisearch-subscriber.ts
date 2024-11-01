import { BaseService } from "medusa-interfaces";
import { ProductService } from "@medusajs/medusa/dist/services";
import MeiliSearch from 'meilisearch';

class MeiliSearchSubscriber extends BaseService {
  private productService_: ProductService;
  private meiliClient_: MeiliSearch;

  constructor({ productService }: { productService: ProductService }) {
    super();

    this.productService_ = productService;
    this.meiliClient_ = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_API_KEY,
    });

    // Event Subscriptions
    this.subscribe("product.created", this.handleProductCreated.bind(this));
    this.subscribe("product.updated", this.handleProductUpdated.bind(this));
    this.subscribe("product.deleted", this.handleProductDeleted.bind(this));
  }

  async handleProductCreated({ id }: { id: string }) {
    const product = await this.productService_.retrieve(id);
    await this.meiliClient_.index("products").addDocuments([{
      id: product.id,
      title: product.title,
      description: product.description,
      variant_sku: product.variants.map(v => v.sku),
      thumbnail: product.thumbnail,
      handle: product.handle,
    }]);
  }

  async handleProductUpdated({ id }: { id: string }) {
    const product = await this.productService_.retrieve(id);
    await this.meiliClient_.index("products").updateDocuments([{
      id: product.id,
      title: product.title,
      description: product.description,
      variant_sku: product.variants.map(v => v.sku),
      thumbnail: product.thumbnail,
      handle: product.handle,
    }]);
  }

  async handleProductDeleted({ id }: { id: string }) {
    await this.meiliClient_.index("products").deleteDocument(id);
  }
}

export default MeiliSearchSubscriber;
