import bcrypt from 'bcryptjs';
import { db } from './db';

export async function seedDatabase() {
  await db.initialize();

  // 1. Password hashes for users
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);

  const users = [
    {
      id: 'usr_admin_001',
      name: 'Ashok Pickles Admin',
      email: 'admin@ashokpickles.in',
      phone: '9876543200',
      password_hash: passwordHash,
      role: 'admin',
      referral_code: 'ASHOK2026',
      referred_by: null,
      wallet_balance: 500.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_cust_001',
      name: 'Ramesh Reddy',
      email: 'customer@ashokpickles.in',
      phone: '9876543210',
      password_hash: customerHash,
      role: 'customer',
      referral_code: 'RAMESH100',
      referred_by: null,
      wallet_balance: 100.0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
  db.setStore('users', users);

  // Admins
  const admins = [
    {
      id: 'adm_001',
      user_id: 'usr_admin_001',
      role_level: 'superadmin',
      permissions: ['*'],
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];
  db.setStore('admins', admins);

  // Addresses
  const addresses = [
    {
      id: 'addr_001',
      user_id: 'usr_cust_001',
      full_name: 'Ramesh Reddy',
      phone: '9876543210',
      house_flat: 'Flat 402, Sri Nilayam',
      street: 'Road No. 10, Banjara Hills',
      landmark: 'Near Taj Krishna',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      address_type: 'Home',
      is_default: true,
      created_at: new Date().toISOString(),
    },
  ];
  db.setStore('addresses', addresses);

  // Sellers
  const sellers = [
    {
      id: 'sel_001',
      seller_name: 'Ashok Pickles Master Kitchens',
      brand_name: 'ASHOK PICKLES',
      contact_email: 'support@ashokpickles.in',
      contact_phone: '+91 98765 43210',
      fssai_license_no: '10021042000889',
      gstin: '36AAACP1234M1Z5',
      registered_address: 'Plot 45, Heritage Food Park, Gachibowli, Hyderabad, Telangana - 500032',
      state: 'Telangana',
      is_verified: true,
      created_at: new Date().toISOString(),
    },
  ];
  db.setStore('seller_information', sellers);

  // Categories: Veg and Non-Veg
  const categories = [
    {
      id: 'cat_veg',
      name: 'Vegetarian Pickles',
      slug: 'veg-pickles',
      description: 'Authentic 100% vegetarian Indian pickles handcrafted with wood-pressed virgin sesame oil and traditional stone-ground spices.',
      image_url: '/images/mamidi_pachadi.jpg',
      icon_name: 'Sparkles',
      is_active: true,
      display_order: 1,
    },
    {
      id: 'cat_nonveg',
      name: 'Non-Vegetarian Pickles',
      slug: 'non-veg-pickles',
      description: 'Fiery and delectable boneless chicken pickle slow-cooked in traditional Telugu culinary style.',
      image_url: '/images/chicken_pachadi.jpg',
      icon_name: 'Flame',
      is_active: true,
      display_order: 2,
    },
  ];
  db.setStore('categories', categories);

  // 6 VEG PICKLES
  const vegPickles = [
    {
      id: 'prod_veg_01',
      name: 'ఏలకాయ పచ్చడి (Elakay Pachadi)',
      telugu_name: 'ఏలకాయ పచ్చడి',
      slug: 'elakay-pachadi',
      description: 'A traditional Andhra heirloom delicacy crafted with fresh green cardamom pods, stone-ground spices, rock salt, and aromatic cold-pressed sesame oil. A fragrant, digestive-friendly culinary specialty.',
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
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
      image: '/images/mamidi_pachadi.jpg',
    },
  ];

  // 1 NON-VEG PICKLE
  const nonVegPickles = [
    {
      id: 'prod_nonveg_01',
      name: 'చికెన్ పచ్చడి (Chicken Pachadi)',
      telugu_name: 'చికెన్ పచ్చడి',
      slug: 'chicken-pachadi',
      description: 'Succulent boneless tender chicken bites fried to a golden crisp and immersed in freshly pounded ginger-garlic paste, fiery Andhra chilli masala, curry leaves, and wood-pressed oil.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 290, 500: 560, 750: 820, 1000: 1080 },
      image: '/images/chicken_pachadi.jpg',
    },
  ];

  const allItems = [
    ...vegPickles.map(p => ({ ...p, category_id: 'cat_veg', dietary_type: 'veg' as const })),
    ...nonVegPickles.map(p => ({ ...p, category_id: 'cat_nonveg', dietary_type: 'non-veg' as const })),
  ];

  const products: any[] = [];
  const variants: any[] = [];
  const images: any[] = [];
  const inventory: any[] = [];
  const complianceList: any[] = [];

  const weightKeys = [
    { label: '250g', grams: 250, key: 250, default: false },
    { label: '500g', grams: 500, key: 500, default: true },
    { label: '750g', grams: 750, key: 750, default: false },
    { label: '1kg', grams: 1000, key: 1000, default: false },
  ] as const;

  allItems.forEach((item, index) => {
    const basePrice = item.prices[500];

    products.push({
      id: item.id,
      category_id: item.category_id,
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
      is_bestseller: index < 3,
      is_new: false,
      is_active: true,
      rating: 4.8 + (index % 3) * 0.1,
      review_count: 85 + (index * 13) % 250,
      created_at: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    });

    // 4 Variants: 250g, 500g, 750g, 1kg
    weightKeys.forEach(w => {
      const varId = `var_${item.id}_${w.label}`;
      const varPrice = item.prices[w.key];

      variants.push({
        id: varId,
        product_id: item.id,
        weight_label: w.label,
        weight_in_grams: w.grams,
        sku: `AP-${item.id.toUpperCase()}-${w.label}`,
        price: varPrice,
        mrp: varPrice,
        discount_percentage: 0,
        is_default: w.default,
      });

      inventory.push({
        id: `inv_${varId}`,
        variant_id: varId,
        stock_quantity: 150,
        low_stock_threshold: 15,
      });
    });

    // Images
    images.push({
      id: `img_${item.id}_1`,
      product_id: item.id,
      image_url: item.image,
      is_primary: true,
      display_order: 1,
    });

    // Compliance Info
    complianceList.push({
      id: `comp_${item.id}`,
      product_id: item.id,
      fssai_license_no: '10021042000889',
      ingredients: item.dietary_type === 'veg'
        ? 'Fresh vegetables/leaves, Cold-Pressed Gingelly (Sesame) Oil, Pure Guntur Red Chilli Powder, Rock Salt, Stone-ground Mustard Powder, Fenugreek Powder, Garlic, Turmeric.'
        : 'Fresh boneless chicken cuts, Cold-Pressed Gingelly & Groundnut Oil, Ginger-Garlic Paste, Guntur Red Chilli Powder, Rock Salt, Roasted Coriander, Cumin, Mustard, Curry Leaves, Cloves, Lemon Extract.',
      allergens_info: item.dietary_type === 'non-veg' ? 'Contains Chicken, Sesame. Prepared in facility handling mustard.' : 'Contains Sesame, Mustard.',
      storage_instructions: 'Store in a cool, dry place. Keep immersed in oil layer. Always use a clean, dry spoon. Do not refrigerate.',
      shelf_life: item.dietary_type === 'veg' ? '12 Months from Manufacturing' : '6 Months from Manufacturing',
      country_of_origin: 'India',
      manufacturing_details: 'ASHOK PICKLES, Plot 45, Food Park, Gachibowli, Hyderabad, Telangana - 500032',
      customer_care_details: 'support@ashokpickles.in | +91 98765 43210',
    });
  });

  db.setStore('products', products);
  db.setStore('product_variants', variants);
  db.setStore('product_images', images);
  db.setStore('inventory', inventory);
  db.setStore('compliance_information', complianceList);

  // Delivery settings
  const deliverySettings = [
    {
      id: 'del_001',
      free_shipping_threshold: 499.0,
      standard_delivery_fee: 50.0,
      express_delivery_fee: 99.0,
      is_cod_available: true,
      max_cod_amount: 3000.0,
      cod_fee: 0.0,
    },
  ];
  db.setStore('delivery_settings', deliverySettings);

  // Serviceable Pincodes
  const pincodes = [
    { pincode: '500034', city: 'Hyderabad', state: 'Telangana', is_serviceable: true, estimated_days: 1 },
    { pincode: '500081', city: 'Hyderabad', state: 'Telangana', is_serviceable: true, estimated_days: 1 },
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', is_serviceable: true, estimated_days: 2 },
    { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', is_serviceable: true, estimated_days: 2 },
    { pincode: '520001', city: 'Vijayawada', state: 'Andhra Pradesh', is_serviceable: true, estimated_days: 1 },
    { pincode: '530001', city: 'Visakhapatnam', state: 'Andhra Pradesh', is_serviceable: true, estimated_days: 2 },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', is_serviceable: true, estimated_days: 3 },
    { pincode: '110001', city: 'New Delhi', state: 'Delhi', is_serviceable: true, estimated_days: 3 },
  ];
  db.setStore('serviceable_pincodes', pincodes);

  // Verified Reviews
  const reviews = [
    {
      id: 'rev_001',
      product_id: 'prod_veg_06',
      user_id: 'usr_cust_001',
      user_name: 'Ramesh Reddy',
      rating: 5,
      headline: 'Authentic మామిడి పచ్చడి (Mamidi Pachadi) - Just like Grandma made!',
      comment: 'The cold-pressed sesame oil aroma hit me as soon as I opened the seal. Mango pieces are crisp and spicy. Pairs heavenly with hot rice and ghee.',
      image_url: '/images/mamidi_pachadi.jpg',
      is_verified_purchase: true,
      is_approved: true,
      helpful_votes: 42,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'rev_002',
      product_id: 'prod_nonveg_01',
      user_id: 'usr_cust_001',
      user_name: 'Suresh Kumar',
      rating: 5,
      headline: 'Best చికెన్ పచ్చడి (Chicken Pachadi) - juicy & perfectly spiced',
      comment: 'Boneless chicken bites cooked to perfection. Oil level is balanced and the spices are fresh. Truly authentic Telugu taste.',
      image_url: '/images/chicken_pachadi.jpg',
      is_verified_purchase: true,
      is_approved: true,
      helpful_votes: 28,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
  db.setStore('reviews', reviews);

  // Hero Banners
  const banners = [
    {
      id: 'ban_001',
      title: 'ASHOK PICKLES',
      subtitle: 'Traditional Telugu recipes. Cold-pressed virgin oils. 100% Homemade goodness.',
      badge_text: 'FSSAI Certified & Freshly Prepared',
      image_url: '/images/mamidi_pachadi.jpg',
      button_text: 'Shop Pickles',
      destination_url: '/products',
      start_date: new Date().toISOString(),
      end_date: null,
      is_active: true,
      display_order: 1,
    },
  ];
  db.setStore('banners', banners);

  console.log(`✅ Database successfully initialized with 7 new pickle items (6 Veg, 1 Non-Veg).`);
}
