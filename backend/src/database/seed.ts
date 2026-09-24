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
      image_url: '/pickle_jar_hero.jpg',
      icon_name: 'Sparkles',
      is_active: true,
      display_order: 1,
    },
    {
      id: 'cat_nonveg',
      name: 'Non-Vegetarian Pickles',
      slug: 'non-veg-pickles',
      description: 'Fiery and delectable boneless meat, chicken, prawn and seafood pickles slow-cooked in traditional Telugu culinary style.',
      image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
      icon_name: 'Flame',
      is_active: true,
      display_order: 2,
    },
  ];
  db.setStore('categories', categories);

  // 15 VEG PICKLES
  const vegPickles = [
    {
      id: 'prod_veg_01',
      name: 'Avakaya (Mango Pickle)',
      telugu_name: 'ఆవకాయ',
      slug: 'avakaya-mango-pickle',
      description: 'The monarch of Andhra pickles. Crisp tender green raw mango chunks seasoned with pungently fragrant stone-ground mustard powder (Aava Pindi), sun-dried fiery Guntur chillies, and cold-pressed virgin sesame oil.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
      image: '/pickle_jar_hero.jpg',
    },
    {
      id: 'prod_veg_02',
      name: 'Gongura Pickle',
      telugu_name: 'గోంగూర పచ్చడి',
      slug: 'gongura-pickle',
      description: 'Andhra Pradesh’s crown culinary jewel. Freshly plucked sour red sorrel leaves slow-roasted in cold-pressed gingelly oil, seasoned with crushed garlic cloves and roasted red chillies.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_03',
      name: 'Magaya (Dried Mango Pickle)',
      telugu_name: 'మాగాయ',
      slug: 'magaya-dried-mango-pickle',
      description: 'Traditional peeled raw mango strips sun-dried to perfection, steeped in fenugreek (Menthi) powder and virgin sesame oil for an earthy, sour-tangy gourmet taste.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 170, 500: 320, 750: 470, 1000: 620 },
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_04',
      name: 'Dosakaya Pickle',
      telugu_name: 'దోసకాయ పచ్చడి',
      slug: 'dosakaya-pickle',
      description: 'Crunchy yellow cucumber cubes preserved with fresh ground mustard paste, lemon juice, turmeric, and sizzling curry leaf tempering.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 150, 500: 280, 750: 410, 1000: 540 },
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_05',
      name: 'Gongura Garlic Pickle',
      telugu_name: 'గోంగూర వెల్లుల్లి పచ్చడి',
      slug: 'gongura-garlic-pickle',
      description: 'An exquisite combination of tart Gongura leaves blended with whole plump desi garlic cloves aged in aromatic cold-pressed oil.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 170, 500: 320, 750: 470, 1000: 620 },
      image: 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_06',
      name: 'Lemon Pickle',
      telugu_name: 'నిమ్మకాయ పచ్చడి',
      slug: 'lemon-pickle',
      description: 'Juicy Kagzi lemons aged under natural hot sunlight with pure rock salt, turmeric, and bright red chilli powder for an authentic tangy punch.',
      spice_level: 'medium',
      spice_rating: 3,
      prices: { 250: 140, 500: 260, 750: 380, 1000: 500 },
      image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_07',
      name: 'Amla Pickle',
      telugu_name: 'ఉసిరికాయ పచ్చడి',
      slug: 'amla-pickle',
      description: 'Whole wild Indian gooseberries (Usirikaya) slow-steeped in cold-pressed sesame oil, roasted fenugreek powder, and mustard seeds.',
      spice_level: 'medium',
      spice_rating: 3,
      prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_08',
      name: 'Green Chilli Pickle',
      telugu_name: 'పచ్చిమిరపకాయ పచ్చడి',
      slug: 'green-chilli-pickle',
      description: 'Slit fresh green farm chillies marinated in tangy lime juice, roasted mustard powder, and sea salt. Unmistakably hot and appetizing.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 150, 500: 280, 750: 410, 1000: 540 },
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_09',
      name: 'Pandu Mirapakaya Pickle',
      telugu_name: 'పండు మిరపకాయ పచ్చడి',
      slug: 'pandu-mirapakaya-pickle',
      description: 'Ripe crimson Guntur chillies stone-pounded with sour country tamarind, salt, and garlic. A deep, spicy traditional staple.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 170, 500: 320, 750: 470, 1000: 620 },
      image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_10',
      name: 'Tomato Pickle',
      telugu_name: 'టమాటా పచ్చడి',
      slug: 'tomato-pickle',
      description: 'Ripe country tomatoes slow-simmered with thick tamarind extract, Guntur red chilli powder, and crunchy garlic cloves in gingelly oil.',
      spice_level: 'medium',
      spice_rating: 3,
      prices: { 250: 150, 500: 280, 750: 410, 1000: 540 },
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_11',
      name: 'Tamarind Pickle',
      telugu_name: 'చింతకాయ పచ్చడి',
      slug: 'tamarind-pickle',
      description: 'Tender raw green tamarind pods stone-ground with sea salt and roasted cumin-mustard spices. Pure sour and spicy indulgence.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_12',
      name: 'Garlic Pickle',
      telugu_name: 'వెల్లుల్లి పచ్చడి',
      slug: 'garlic-pickle',
      description: 'Whole peeled desi garlic pods braised in cold-pressed mustard and sesame oil with roasted fenugreek and lemon juice.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 180, 500: 340, 750: 500, 1000: 660 },
      image: 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_13',
      name: 'Mango Thokku',
      telugu_name: 'మామిడికాయ తొక్కు',
      slug: 'mango-thokku',
      description: 'Finely grated sour green raw mango simmered in virgin sesame oil with freshly ground mustard seeds and roasted red chillies.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 160, 500: 300, 750: 440, 1000: 580 },
      image: '/pickle_jar_hero.jpg',
    },
    {
      id: 'prod_veg_14',
      name: 'Brinjal Pickle',
      telugu_name: 'వంకాయ పచ్చడి',
      slug: 'brinjal-pickle',
      description: 'Tender purple baby eggplants slow-cooked in thick tamarind and spice reduction with a hint of jaggery and mustard tempering.',
      spice_level: 'medium',
      spice_rating: 3,
      prices: { 250: 150, 500: 280, 750: 410, 1000: 540 },
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_veg_15',
      name: 'Dondakaya Pickle',
      telugu_name: 'దొండకాయ పచ్చడి',
      slug: 'dondakaya-pickle',
      description: 'Crisp fresh ivy gourd (Tindora) cured with stone-ground mustard paste, sea salt, and aromatic curry leaf tempering.',
      spice_level: 'medium',
      spice_rating: 3,
      prices: { 250: 150, 500: 280, 750: 410, 1000: 540 },
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // 15 NON-VEG PICKLES
  const nonVegPickles = [
    {
      id: 'prod_nonveg_01',
      name: 'Chicken Pickle',
      telugu_name: 'చికెన్ పచ్చడి',
      slug: 'chicken-pickle',
      description: 'Boneless tender chicken bites fried to a golden crisp and immersed in roasted ginger-garlic paste, Guntur chilli masala, and wood-pressed oil.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 290, 500: 560, 750: 820, 1000: 1080 },
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_02',
      name: 'Mutton Pickle',
      telugu_name: 'మటన్ పచ్చడి',
      slug: 'mutton-pickle',
      description: 'Succulent tender mutton pieces slow-cooked with rich ground garam masala, ginger, garlic, and cold-pressed oil for an intensely flavorful feast.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 420, 500: 800, 750: 1180, 1000: 1550 },
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_03',
      name: 'Prawn Pickle',
      telugu_name: 'రొయ్యల పచ్చడి',
      slug: 'prawn-pickle',
      description: 'Fresh coastal prawns flash-fried crisp and matured in garlic-infused fiery Andhra spice gravy and wood-pressed gingelly oil.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 360, 500: 690, 750: 1020, 1000: 1340 },
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_04',
      name: 'Fish Pickle',
      telugu_name: 'చేపల పచ్చడి',
      slug: 'fish-pickle',
      description: 'Boneless fresh catch fillets seasoned with turmeric, flash-fried and preserved in mustard-fenugreek spice oil with green chillies.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 310, 500: 590, 750: 870, 1000: 1150 },
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_05',
      name: 'Chicken Gongura Pickle',
      telugu_name: 'చికెన్ గోంగూర పచ్చడి',
      slug: 'chicken-gongura-pickle',
      description: 'The supreme Andhra pairing: Crispy chicken bites cooked into a tangy, spicy sorrel leaf (Gongura) reduction with garlic and ground coriander.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 310, 500: 600, 750: 880, 1000: 1160 },
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_06',
      name: 'Mutton Gongura Pickle',
      telugu_name: 'మటన్ గోంగూర పచ్చడి',
      slug: 'mutton-gongura-pickle',
      description: 'Tender lamb chunks braised with sour red Gongura leaves, whole garlic cloves, and freshly roasted masala paste.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 440, 500: 840, 750: 1240, 1000: 1620 },
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_07',
      name: 'Gongura Prawn Pickle',
      telugu_name: 'గోంగూర రొయ్యల పచ్చడి',
      slug: 'gongura-prawn-pickle',
      description: 'Sweet coastal prawns simmered with tart Gongura leaves, roasted red chillies, and garlic pods in pure gingelly oil.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 380, 500: 730, 750: 1080, 1000: 1420 },
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_08',
      name: 'Chicken Garlic Pickle',
      telugu_name: 'చికెన్ వెల్లుల్లి పచ్చడి',
      slug: 'chicken-garlic-pickle',
      description: 'Golden fried chicken chunks heavily laden with whole roasted garlic cloves and spiced pickling gravy.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 300, 500: 580, 750: 850, 1000: 1120 },
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_09',
      name: 'Mutton Garlic Pickle',
      telugu_name: 'మటన్ వెల్లుల్లి పచ్చడి',
      slug: 'mutton-garlic-pickle',
      description: 'Tender mutton cubes infused with whole browned garlic cloves, roasted black pepper, and stone-ground spices.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 430, 500: 820, 750: 1210, 1000: 1580 },
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_10',
      name: 'Garlic Prawn Pickle',
      telugu_name: 'వెల్లుల్లి రొయ్యల పచ్చడి',
      slug: 'garlic-prawn-pickle',
      description: 'Succulent prawns tossed with abundant roasted desi garlic, curry leaves, and sour lime-chilli pickling oil.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 370, 500: 710, 750: 1050, 1000: 1380 },
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_11',
      name: 'Gongura Fish Pickle',
      telugu_name: 'గోంగూర చేపల పచ్చడి',
      slug: 'gongura-fish-pickle',
      description: 'Boneless fish fillets steeped in tangy red sorrel Gongura gravy with ground mustard and roasted fenugreek.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 330, 500: 630, 750: 930, 1000: 1220 },
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_12',
      name: 'Dry Fish Pickle',
      telugu_name: 'ఎండు చేపల పచ్చడి',
      slug: 'dry-fish-pickle',
      description: 'Sun-dried sea fish crisped in oil and pickled in hot Guntur chilli paste with garlic and crushed mustard.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 280, 500: 540, 750: 790, 1000: 1040 },
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_13',
      name: 'Dry Prawn Pickle',
      telugu_name: 'ఎండు రొయ్యల పచ్చడి',
      slug: 'dry-prawn-pickle',
      description: 'Crunchy sun-dried baby prawns tossed in cold-pressed oil with roasted spices, chilli flakes, and tangy lemon juice.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 320, 500: 610, 750: 900, 1000: 1180 },
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_14',
      name: 'Crab Pickle',
      telugu_name: 'పీతల పచ్చడి',
      slug: 'crab-pickle',
      description: 'Hand-picked tender crab meat simmered in fiery coastal Telugu spices, crushed ginger, and aromatic mustard oil.',
      spice_level: 'extra-spicy',
      spice_rating: 5,
      prices: { 250: 450, 500: 860, 750: 1270, 1000: 1660 },
      image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod_nonveg_15',
      name: 'Chicken Liver Pickle',
      telugu_name: 'చికెన్ లివర్ పచ్చడి',
      slug: 'chicken-liver-pickle',
      description: 'Rich, soft chicken liver cubes sautéed with black pepper, roasted coriander powder, and red chilli masala.',
      spice_level: 'spicy',
      spice_rating: 4,
      prices: { 250: 270, 500: 520, 750: 760, 1000: 990 },
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
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
      subtitle: `${item.telugu_name} | Authentic Handmade Telugu Recipe`,
      description: item.description,
      regional_style: item.dietary_type === 'veg' ? 'Andhra Traditional' : 'Telangana & Coastal Andhra',
      dietary_type: item.dietary_type,
      spice_level: item.spice_level,
      spice_rating: item.spice_rating,
      oil_type: 'Cold-Pressed Virgin Sesame & Mustard Oil',
      base_price: basePrice,
      base_mrp: basePrice,
      discount_percentage: 0,
      is_featured: index < 4,
      is_bestseller: index < 6,
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
        ? 'Fresh vegetable/fruit chunks, Cold-Pressed Gingelly (Sesame) Oil, Pure Guntur Red Chilli Powder, Rock Salt, Stone-ground Mustard Powder, Fenugreek Powder, Garlic, Turmeric.'
        : 'Fresh meat/seafood cuts, Cold-Pressed Gingelly & Groundnut Oil, Ginger-Garlic Paste, Guntur Red Chilli Powder, Rock Salt, Roasted Coriander, Cumin, Mustard, Cloves, Cardamom, Lemon Extract.',
      allergens_info: item.dietary_type === 'non-veg' ? 'Contains Seafood/Meat, Sesame. Prepared in facility handling mustard.' : 'Contains Sesame, Mustard.',
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
      product_id: 'prod_veg_01',
      user_id: 'usr_cust_001',
      user_name: 'Ramesh Reddy',
      rating: 5,
      headline: 'Authentic Avakaya Taste - Just like Grandma made!',
      comment: 'The cold-pressed sesame oil aroma hit me as soon as I opened the seal. Mango pieces are crisp and spicy. Pairs heavenly with hot rice and ghee.',
      image_url: '/pickle_jar_hero.jpg',
      is_verified_purchase: true,
      is_approved: true,
      helpful_votes: 42,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'rev_002',
      product_id: 'prod_nonveg_01',
      user_id: 'usr_cust_001',
      user_name: 'Ramesh Reddy',
      rating: 5,
      headline: 'Best chicken pickle - juicy & perfectly spiced',
      comment: 'Boneless chicken bites cooked to perfection. Oil level is balanced and the spices are fresh. Truly authentic Telugu taste.',
      image_url: null,
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
      image_url: '/pickle_jar_hero.jpg',
      button_text: 'Shop Pickles',
      destination_url: '/products',
      start_date: new Date().toISOString(),
      end_date: null,
      is_active: true,
      display_order: 1,
    },
  ];
  db.setStore('banners', banners);

  console.log(`✅ Database successfully seeded with 30 authentic ASHOK PICKLES items (15 Veg, 15 Non-Veg), variants, and Telugu names.`);
}
