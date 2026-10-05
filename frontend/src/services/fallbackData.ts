import { Product, Category, Banner } from '../types';

export const fallbackCategories: Category[] = [
  {
    id: 'cat_veg',
    name: 'Vegetarian Pickles',
    slug: 'veg-pickles',
    description: 'Authentic 100% vegetarian Indian pickles handcrafted with wood-pressed virgin sesame oil and traditional stone-ground spices.',
    image_url: '/images/mamidi_pachadi.jpg',
    icon_name: 'Leaf',
    product_count: 6,
  },
  {
    id: 'cat_nonveg',
    name: 'Non-Vegetarian Pickles',
    slug: 'non-veg-pickles',
    description: 'Rich, fiery non-vegetarian Telugu chicken pickle slow-cooked in traditional Telugu culinary style.',
    image_url: '/images/chicken_pachadi.jpg',
    icon_name: 'Flame',
    product_count: 1,
  },
];

export const fallbackBanners: Banner[] = [
  {
    id: 'ban_001',
    title: 'Grandma’s Secret Recipe',
    subtitle: '100% Traditional Handcrafted Telugu Pickles',
    button_text: 'Explore Pickles',
    destination_url: '#pickle-catalog-section',
    image_url: '/images/mamidi_pachadi.jpg',
    badge_text: 'FSSAI Certified',
  },
];

interface RawItem {
  id: string;
  name: string;
  telugu_name: string;
  slug: string;
  description: string;
  dietary_type: 'veg' | 'non-veg';
  spice_level: 'mild' | 'medium' | 'spicy' | 'extra-spicy';
  spice_rating: number;
  prices: { 250: number; 500: number; 750: number; 1000: number };
  image: string;
}

const rawVegItems: RawItem[] = [
  {
    id: 'prod_veg_01',
    name: 'ఏలకాయ పచ్చడి (Elakay Pachadi)',
    telugu_name: 'ఏలకాయ పచ్చడి',
    slug: 'elakay-pachadi',
    description: 'A traditional Andhra heirloom delicacy crafted with fresh green cardamom pods, stone-ground spices, rock salt, and aromatic cold-pressed sesame oil. A fragrant, digestive-friendly culinary specialty.',
    dietary_type: 'veg',
    spice_level: 'medium',
    spice_rating: 3,
    prices: { 250: 180, 500: 340, 750: 500, 1000: 660 },
    image: '/images/elakay_pachadi.jpg',
  },
  {
    id: 'prod_veg_02',
    name: 'బీరకాయ పచ్చడి (Beerakaya Pachadi)',
    telugu_name: 'బీరకాయ పచ్చడి',
    slug: 'beerakaya-pachadi',
    description: 'Authentic Andhra Ridge Gourd (Beerakaya) pickle slow-cooked with roasted Guntur red chillies, crushed garlic, cumin, and virgin gingelly oil. Uniquely flavorful with a signature tender texture.',
    dietary_type: 'veg',
    spice_level: 'spicy',
    spice_rating: 4,
    prices: { 250: 150, 500: 280, 750: 410, 1000: 540 },
    image: '/images/beerakaya_pachadi.jpg',
  },
  {
    id: 'prod_veg_03',
    name: 'మునగ ఆకు పచ్చడి (Munaga Aaku Pachadi)',
    telugu_name: 'మునగ ఆకు పచ్చడి',
    slug: 'munaga-aaku-pachadi',
    description: 'Nutrient-rich fresh Moringa (Drumstick leaves) slow-roasted in cold-pressed sesame oil, blended with tamarind, roasted lentils, and sun-dried chillies. A healthy, heritage Andhra immunity booster.',
    dietary_type: 'veg',
    spice_level: 'medium',
    spice_rating: 3,
    prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
    image: '/images/munaga_aaku_pachadi.jpg',
  },
  {
    id: 'prod_veg_04',
    name: 'కరివేపాకు పచ్చడి (Karivepaku Pachadi)',
    telugu_name: 'కరివేపాకు పచ్చడి',
    slug: 'karivepaku-pachadi',
    description: 'Fragrant fresh farm curry leaves stone-ground with roasted red chillies, tamarind, garlic, and cumin in wood-pressed gingelly oil. Renowned across South India for its rich aroma and authentic taste.',
    dietary_type: 'veg',
    spice_level: 'spicy',
    spice_rating: 4,
    prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
    image: '/images/karivepaku_pachadi.jpg',
  },
  {
    id: 'prod_veg_05',
    name: 'కాకరకాయ పచ్చడి (Kakarakaya Pachadi)',
    telugu_name: 'కాకరకాయ పచ్చడి',
    slug: 'kakarakaya-pachadi',
    description: 'Crispy bitter gourd slices sun-cured and slow-cooked in thick tamarind and Guntur chilli masala, harmonized with organic jaggery and mustard tempering. A sublime balance of tangy, spicy, and mild bitterness.',
    dietary_type: 'veg',
    spice_level: 'spicy',
    spice_rating: 4,
    prices: { 250: 170, 500: 320, 750: 470, 1000: 620 },
    image: '/images/kakarakaya_pachadi.jpg',
  },
  {
    id: 'prod_veg_06',
    name: 'మామిడి పచ్చడి (Mamidi Pachadi)',
    telugu_name: 'మామిడి పచ్చడి',
    slug: 'mamidi-pachadi',
    description: 'The undisputed king of Telugu pickles. Firm, sour country raw mango chunks marinated in freshly ground mustard seed powder, vibrant red Guntur chillies, and pure cold-pressed sesame oil.',
    dietary_type: 'veg',
    spice_level: 'extra-spicy',
    spice_rating: 5,
    prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
    image: '/images/mamidi_pachadi.jpg',
  },
];

const rawNonVegItems: RawItem[] = [
  {
    id: 'prod_nonveg_01',
    name: 'చికెన్ పచ్చడి (Chicken Pachadi)',
    telugu_name: 'చికెన్ పచ్చడి',
    slug: 'chicken-pachadi',
    description: 'Succulent boneless tender chicken bites fried to a golden crisp and immersed in freshly pounded ginger-garlic paste, fiery Andhra chilli masala, curry leaves, and wood-pressed oil.',
    dietary_type: 'non-veg',
    spice_level: 'spicy',
    spice_rating: 4,
    prices: { 250: 290, 500: 560, 750: 820, 1000: 1080 },
    image: '/images/chicken_pachadi.jpg',
  },
];

const weights = [
  { label: '250g', grams: 250, key: 250 as const, isDefault: false },
  { label: '500g', grams: 500, key: 500 as const, isDefault: true },
  { label: '750g', grams: 750, key: 750 as const, isDefault: false },
  { label: '1kg', grams: 1000, key: 1000 as const, isDefault: false },
];

function transformRawItem(item: RawItem, idx: number): Product {
  const basePrice = item.prices[500];
  const variants = weights.map(w => ({
    id: `var_${item.id}_${w.label}`,
    product_id: item.id,
    weight_label: w.label,
    weight_in_grams: w.grams,
    sku: `AP-${item.id.toUpperCase()}-${w.label}`,
    price: item.prices[w.key],
    mrp: item.prices[w.key],
    discount_percentage: 0,
    is_default: w.isDefault,
    stock_quantity: 50,
    is_in_stock: true,
  }));

  return {
    id: item.id,
    category_id: item.dietary_type === 'veg' ? 'cat_veg' : 'cat_nonveg',
    seller_id: 'sel_001',
    name: item.name,
    telugu_name: item.telugu_name,
    slug: item.slug,
    subtitle: `${item.name} | Authentic Handmade Telugu Recipe`,
    description: item.description,
    regional_style: item.dietary_type === 'veg' ? 'Andhra Traditional' : 'Telangana & Coastal Andhra',
    dietary_type: item.dietary_type,
    spice_level: item.spice_level,
    spice_rating: item.spice_rating,
    oil_type: 'Cold-Pressed Virgin Sesame & Mustard Oil',
    base_price: basePrice,
    base_mrp: basePrice,
    discount_percentage: 0,
    is_featured: true,
    is_bestseller: idx < 3,
    is_new: false,
    is_active: true,
    rating: Number((4.8 + (idx % 2) * 0.1).toFixed(1)),
    review_count: 90 + (idx * 17) % 200,
    primary_image: item.image,
    images: [{ id: `img_${item.id}`, product_id: item.id, image_url: item.image, is_primary: true }],
    variants,
  };
}

export const fallbackProducts: Product[] = [
  ...rawVegItems.map(transformRawItem),
  ...rawNonVegItems.map(transformRawItem),
];
