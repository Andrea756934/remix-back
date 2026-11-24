import { productModel } from "./prodotti.model";
import { Product, ProductList, imageUploadSignature } from "./prodotti.entity";
import { addProductDTO, updateProductDTO, ListProductDTO, ListMineDTO, ChangeStatusDTO } from "./prodotti.dto";
import { NotFoundError } from "../../errors/not-found.error";
import cloudinary from "../../utils/cloudinary/cloudinary";
import { ProductNotAvailableError } from "../../errors/product-not-available.error";

export class productService {
    async find(filters: ListProductDTO): Promise<ProductList> {
        return this.listBy(filters, { status: 'active' });
    }

    async findMine(idSeller: string, filters: ListMineDTO): Promise<ProductList> {
        const { status, ...rest } = filters;
        return this.listBy(rest, { idSeller, ...(status && { status }) });
    }

    async findBySeller(idSeller: string, filters: ListProductDTO): Promise<ProductList> {
        if (!/^[0-9a-fA-F]{24}$/.test(idSeller)) {
            throw new NotFoundError();
        }
        return this.listBy(filters, { idSeller, status: 'active' });
    }

    async findById(id: string): Promise<Product> {
        const product = await productModel.findById(id);

        if (!product) {
            throw new NotFoundError()
        }

        return this.productResponse(product);
    }

    async add(data: addProductDTO, idSeller: string): Promise<Product> {
        const product = await productModel.create({ ...data, idSeller })
        return this.productResponse(product);
    }

    async update(id: string, data: updateProductDTO, idSeller: string): Promise<Product> {
        const product = await productModel.findOne({ _id: id, idSeller });

        if (!product) {
            throw new NotFoundError();
        }

        Object.assign(product, data);
        await product.save();

        return this.productResponse(product);
    }

    async remove(id: string, idSeller: string): Promise<void> {
        const product = await productModel.findOne({ _id: id, idSeller });

        if (!product) {
            throw new NotFoundError();
        }

        await product.deleteOne();
    }

    async changeStatus(id: string, data: ChangeStatusDTO, idSeller: string): Promise<Product> {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new NotFoundError();
        }

        const product = await productModel.findOne({ _id: id, idSeller });

        if (!product) {
            throw new NotFoundError();
        }

        // un prodotto venduto non si riattiva
        if (product.status === 'sold') {
            throw new ProductNotAvailableError();
        }

        product.status = data.status;
        await product.save();

        return this.productResponse(product);
    }

    async signImage(userId: string): Promise<imageUploadSignature> {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = `vinted/products/${userId}`;

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET as string
        );

        return {
            signature,
            timestamp,
            folder,
            apiKey: process.env.CLOUDINARY_API_KEY as string,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME as string
        };
    }

    async category(): Promise<string[]> {
        const categories = await productModel.distinct('category', { status: 'active' });
        return categories.sort((a, b) => a.localeCompare(b));
    }

    private priceFilter(min?: number, max?: number) {
        if (min === undefined && max === undefined) {
            return {};
        }

        return {
            price: {
                ...(min !== undefined && { $gte: min }),
                ...(max !== undefined && { $gte: max })
            }
        };
    }

    private productResponse(product: any): Product {
        return product.toObject() as Product
    }

    private async listBy(filters: ListProductDTO, base: Record<string, any>): Promise<ProductList> {
        const { search, category, condition, minPrice, maxPrice, sort = 'newest' } = filters;
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;

        const filter = {
            status: 'active',
            ...(search && { $text: { $search: search } }),
            ...(category && { category }),
            ...(condition && { condition }),
            ...this.priceFilter(minPrice, maxPrice)
        };

        const sortOptions = {
            newest: { createdAt: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 }
        } as const

        const sortBy = search && !filters.sort
            ? { score: { $meta: 'textScore' } }
            : sortOptions[sort];

        const query = productModel.find(filter)
            .sort(sortBy as any)
            .skip((page - 1) * limit)
            .limit(limit);

        if (search) {
            query.select({ score: { $meta: 'textScore' } });
        }

        const [products, total] = await Promise.all([
            query,
            productModel.countDocuments(filter)
        ]);

        return {
            items: products.map(product => this.productResponse(product)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
}

export default new productService();