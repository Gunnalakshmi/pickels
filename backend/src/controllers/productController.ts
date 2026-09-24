import { Request, Response } from 'express';
import { db } from '../database/db';

export class ProductController {
  public async getProducts(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        dietary, // 'veg' | 'non-veg'
        spice, // 'mild' | 'medium' | 'spicy' | 'extra-spicy'
        region, // 'Andhra', 'Kerala', etc.
        minPrice,
        maxPrice,
        inStockOnly,
        sort = 'popular',
        page = '1',
        limit = '20',
      } = req.query;

      let products = [...db.getStore('products')].filter(p => p.is_active);
      const categories = db.getStore('categories');
      const variants = db.getStore('product_variants');
      const images = db.getStore('product_images');
      const inventory = db.getStore('inventory');

      // 1. Search (name, description, ingredients, regional style, category name)
      if (search && typeof search === 'string') {
        const q = search.trim().toLowerCase();
        products = products.filter(p => {
          const cat = categories.find(c => c.id === p.category_id);
          return (
            p.name.toLowerCase().includes(q) ||
            (p.telugu_name && p.telugu_name.toLowerCase().includes(q)) ||
            p.description.toLowerCase().includes(q) ||
            p.regional_style.toLowerCase().includes(q) ||
            (cat && cat.name.toLowerCase().includes(q))
          );
        });
      }

      // 2. Category Filter
      if (category && typeof category === 'string') {
        const cat = categories.find(c => c.slug === category || c.id === category);
        if (cat) {
          products = products.filter(p => p.category_id === cat.id);
        }
      }

      // 3. Dietary Filter
      if (dietary && typeof dietary === 'string' && dietary !== 'all') {
        products = products.filter(p => p.dietary_type === dietary.toLowerCase());
      }

      // 4. Spice Filter
      if (spice && typeof spice === 'string' && spice !== 'all') {
        products = products.filter(p => p.spice_level === spice.toLowerCase());
      }

      // 5. Regional Filter
      if (region && typeof region === 'string' && region !== 'all') {
        products = products.filter(p =>
          p.regional_style.toLowerCase().includes(region.toLowerCase())
        );
      }

      // 6. Price Range Filter
      if (minPrice) {
        products = products.filter(p => Number(p.base_price) >= Number(minPrice));
      }
      if (maxPrice) {
        products = products.filter(p => Number(p.base_price) <= Number(maxPrice));
      }

      // 7. In Stock filter
      if (inStockOnly === 'true') {
        products = products.filter(p => {
          const prodVariants = variants.filter(v => v.product_id === p.id);
          return prodVariants.some(v => {
            const inv = inventory.find(i => i.variant_id === v.id);
            return inv && inv.stock_quantity > 0;
          });
        });
      }

      // 8. Sorting
      if (sort === 'price-asc') {
        products.sort((a, b) => Number(a.base_price) - Number(b.base_price));
      } else if (sort === 'price-desc') {
        products.sort((a, b) => Number(b.base_price) - Number(a.base_price));
      } else if (sort === 'rating') {
        products.sort((a, b) => Number(b.rating) - Number(a.rating));
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        // 'popular' / 'bestseller'
        products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0) || Number(b.review_count) - Number(a.review_count));
      }

      // Pagination
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 20;
      const totalCount = products.length;
      const totalPages = Math.ceil(totalCount / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

      // Attach variants & primary images
      const enriched = paginatedProducts.map(p => {
        const prodVariants = variants.filter(v => v.product_id === p.id);
        const prodImages = images.filter(img => img.product_id === p.id);
        const cat = categories.find(c => c.id === p.category_id);
        const primaryImg = prodImages.find(img => img.is_primary)?.image_url || prodImages[0]?.image_url;

        return {
          ...p,
          category_name: cat?.name || 'Pickle',
          category_slug: cat?.slug || 'pickles',
          primary_image: primaryImg,
          images: prodImages,
          variants: prodVariants.map(v => {
            const inv = inventory.find(i => i.variant_id === v.id);
            return {
              ...v,
              stock_quantity: inv ? inv.stock_quantity : 0,
              is_in_stock: inv ? inv.stock_quantity > 0 : false,
            };
          }),
        };
      });

      return res.json({
        success: true,
        products: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getProductBySlugOrId(req: Request, res: Response) {
    try {
      const { identifier } = req.params;
      const products = db.getStore('products');
      const product = products.find(p => p.slug === identifier || p.id === identifier);

      if (!product || !product.is_active) {
        return res.status(404).json({ success: false, message: 'Pickle product not found.' });
      }

      const categories = db.getStore('categories');
      const sellers = db.getStore('seller_information');
      const variants = db.getStore('product_variants').filter(v => v.product_id === product.id);
      const images = db.getStore('product_images').filter(img => img.product_id === product.id);
      const inventory = db.getStore('inventory');
      const complianceList = db.getStore('compliance_information');
      const compliance = complianceList.find(c => c.product_id === product.id);
      const reviews = db.getStore('reviews').filter(r => r.product_id === product.id && r.is_approved);

      const category = categories.find(c => c.id === product.category_id);
      const seller = sellers.find(s => s.id === product.seller_id);

      const variantsWithStock = variants.map(v => {
        const inv = inventory.find(i => i.variant_id === v.id);
        return {
          ...v,
          stock_quantity: inv ? inv.stock_quantity : 0,
          is_in_stock: inv ? inv.stock_quantity > 0 : false,
        };
      });

      // Related pickles from same category or region
      const related = products
        .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.regional_style === product.regional_style))
        .slice(0, 4)
        .map(p => {
          const rImgs = db.getStore('product_images').filter(i => i.product_id === p.id);
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            base_price: p.base_price,
            base_mrp: p.base_mrp,
            discount_percentage: p.discount_percentage,
            rating: p.rating,
            primary_image: rImgs[0]?.image_url,
            regional_style: p.regional_style,
            dietary_type: p.dietary_type,
          };
        });

      return res.json({
        success: true,
        product: {
          ...product,
          category,
          seller,
          images,
          variants: variantsWithStock,
          compliance,
          reviews,
          related,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getCategories(req: Request, res: Response) {
    try {
      const categories = db.getStore('categories').filter(c => c.is_active);
      const products = db.getStore('products');

      const enriched = categories.map(cat => {
        const count = products.filter(p => p.category_id === cat.id && p.is_active).length;
        return {
          ...cat,
          product_count: count,
        };
      });

      return res.json({ success: true, categories: enriched });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getBestsellers(req: Request, res: Response) {
    try {
      const products = db.getStore('products').filter(p => p.is_active && p.is_bestseller);
      const images = db.getStore('product_images');
      const variants = db.getStore('product_variants');

      const enriched = products.map(p => ({
        ...p,
        primary_image: images.find(img => img.product_id === p.id && img.is_primary)?.image_url || images.find(img => img.product_id === p.id)?.image_url,
        variants: variants.filter(v => v.product_id === p.id),
      }));

      return res.json({ success: true, products: enriched });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getBanners(req: Request, res: Response) {
    try {
      const banners = db.getStore('banners').filter(b => b.is_active);
      return res.json({ success: true, banners });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const productController = new ProductController();
