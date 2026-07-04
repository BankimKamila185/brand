export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

// Streetwear categories
export const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Oversized Tees", slug: "oversized-t-shirts", description: "Heavyweight drop shoulder t-shirts" },
  { id: "cat-2", name: "Cargos & Pants", slug: "cargos-pants", description: "Parachute, cargo and Korean trousers" },
  { id: "cat-3", name: "Co-ord Sets", slug: "co-ord-sets", description: "Matched streetwear sets" },
  { id: "cat-4", name: "Crochet Shirts", slug: "crochet-shirts", description: "Premium hand-knit open collar shirts" },
  { id: "cat-5", name: "Outerwear", slug: "outerwear", description: "Puffer jackets, hoodies and zip-ups" }
];

// Streetwear collections
export const MOCK_COLLECTIONS = [
  { id: "col-1", name: "Bestsellers", handle: "bestsellers", description: "Community-favorite designs", sortOrder: 1 },
  { id: "col-2", name: "New Arrivals", handle: "whats-new", description: "Latest drops from the studio", sortOrder: 2 },
  { id: "col-3", name: "Retro Futura", handle: "retro-clothing", description: "90s streetwear meets cyberpunk styling", sortOrder: 3 },
  { id: "col-4", name: "Koala K-aracter", handle: "koala-k-aracter", description: "Limited graphic mascot collection", sortOrder: 4 }
];

// Core Product type mapping to Prisma & UI needs
export interface DashboardProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  categoryName: string;
  collectionName: string;
  brand: string;
  tags: string[];
  price: number;
  comparePrice: number;
  costPrice: number;
  sku: string;
  barcode: string;
  inventory: number;
  sizes: string[];
  colors: string[];
  weight: number; // in grams
  images: string[];
  seoTitle: string;
  seoDescription: string;
  isActive: boolean; // Publish status
  createdAt: string;
}

export const MOCK_PRODUCTS: DashboardProduct[] = [
  {
    id: "prod-1",
    title: "Ghost Heavyweight Oversized Tee",
    handle: "ghost-heavyweight-tee",
    description: "320 GSM 100% premium French Terry cotton drop shoulder tee. Minimal puff print detail on chest with high-density print on back. Pre-shrunk and silicone washed for a soft feel.",
    categoryName: "Oversized Tees",
    collectionName: "Bestsellers",
    brand: "House of Koala",
    tags: ["heavyweight", "oversized", "graphic-tee", "vintage-wash"],
    price: 1899,
    comparePrice: 2499,
    costPrice: 620,
    sku: "TOS-TSH-GHS-01",
    barcode: "890127394101",
    inventory: 142,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Off-White", "Phantom Black"],
    weight: 350,
    images: [
      "https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/tee-front.jpg",
      "https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/tee-back.jpg"
    ],
    seoTitle: "Ghost Heavyweight Oversized Streetwear Tee | House of Koala",
    seoDescription: "Shop the Ghost Heavyweight Tee. 320 GSM French Terry drop shoulder t-shirt in phantom black and off-white.",
    isActive: true,
    createdAt: "2026-05-12T14:32:00.000Z"
  },
  {
    id: "prod-2",
    title: "Tactical Parachute Cargos",
    handle: "tactical-parachute-cargos",
    description: "Ultra-wide fit parachute pants with 6 pocket detailing, knee pleats for volume, adjustable toggles at waist and cuffs. Made from water-resistant micro-ripstop nylon.",
    categoryName: "Cargos & Pants",
    collectionName: "Bestsellers",
    brand: "House of Koala",
    tags: ["parachute", "cargos", "techwear", "gorpcore"],
    price: 2999,
    comparePrice: 3999,
    costPrice: 950,
    sku: "TOS-CAR-TAC-02",
    barcode: "890127394102",
    inventory: 18, // Low stock
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Sage Green", "Matte Black", "Cobalt Blue"],
    weight: 480,
    images: ["https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/cargo-front.jpg"],
    seoTitle: "Tactical Parachute Streetwear Cargos | House of Koala",
    seoDescription: "High-performance techwear parachute cargos. Wide fit, multi-pocket, adjustable cuffs.",
    isActive: true,
    createdAt: "2026-06-01T09:15:00.000Z"
  },
  {
    id: "prod-3",
    title: "Aura Crochet Knit Shirt",
    handle: "aura-crochet-knit-shirt",
    description: "Handcrafted open-weave crochet shirt with classic camp collar and pearl buttons. Lightweight, breathable mesh-like construction, designed to drop naturally on the body.",
    categoryName: "Crochet Shirts",
    collectionName: "New Arrivals",
    brand: "House of Koala",
    tags: ["crochet", "knitwear", "lace", "resortwear"],
    price: 3499,
    comparePrice: 4499,
    costPrice: 1100,
    sku: "TOS-SHT-AUR-03",
    barcode: "890127394103",
    inventory: 64,
    sizes: ["M", "L", "XL"],
    colors: ["Ecru", "Midnight Navy"],
    weight: 410,
    images: ["https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/crochet-front.jpg"],
    seoTitle: "Aura Premium Crochet Camp Collar Shirt | House of Koala",
    seoDescription: "Elevate your wardrobe with the handcrafted Aura Crochet Shirt in ivory ecru.",
    isActive: true,
    createdAt: "2026-06-20T18:00:00.000Z"
  },
  {
    id: "prod-4",
    title: "Core Heavyweight Zip Hoodie",
    handle: "core-heavyweight-zip-hoodie",
    description: "450 GSM luxury brushed back cotton hoodie. Two-way metal zip, double lined hood without drawstrings, kangaroo pocket, ribbed cuffs and hem. Relaxed boxy fit.",
    categoryName: "Outerwear",
    collectionName: "Retro Futura",
    brand: "House of Koala",
    tags: ["hoodie", "outerwear", "heavyweight", "boxy-fit"],
    price: 3899,
    comparePrice: 4999,
    costPrice: 1350,
    sku: "TOS-HOD-COR-04",
    barcode: "890127394104",
    inventory: 82,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Heather Gray", "Carbon Black"],
    weight: 980,
    images: ["https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/hoodie-front.jpg"],
    seoTitle: "450 GSM Heavyweight Zip-Up Hoodie | House of Koala",
    seoDescription: "Boxy fit, heavyweight brushed cotton fleece hoodie. Double-lined construction.",
    isActive: true,
    createdAt: "2026-04-10T11:20:00.000Z"
  },
  {
    id: "prod-5",
    title: "Liquid Metal Co-ord Set",
    handle: "liquid-metal-co-ord",
    description: "Structured utility set featuring matching overshirt and cargo shorts. Crafted from a high-sheen satin-blend tech fabric. Water-repellent and featuring modular utility clips.",
    categoryName: "Co-ord Sets",
    collectionName: "Koala K-aracter",
    brand: "House of Koala",
    tags: ["co-ord", "matching-set", "liquid-sheen", "utility"],
    price: 5499,
    comparePrice: 6999,
    costPrice: 1950,
    sku: "TOS-CRD-LIQ-05",
    barcode: "890127394105",
    inventory: 5, // Extremely low stock
    sizes: ["S", "M", "L"],
    colors: ["Gunmetal Chrome"],
    weight: 750,
    images: ["https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/coord-set.jpg"],
    seoTitle: "Liquid Metal Utility Overshirt & Shorts Co-ord | House of Koala",
    seoDescription: "Limited edition chrome satin utility streetwear matching set.",
    isActive: false, // Draft / Unpublished
    createdAt: "2026-07-01T15:45:00.000Z"
  }
];

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
    sku: string;
    image?: string;
  }[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  timeline: {
    status: OrderStatus | "CREATED" | "REFUND_REQUESTED" | "REFUNDED_DONE";
    description: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export const MOCK_ORDERS: DashboardOrder[] = [
  {
    id: "ord-1",
    orderNumber: "TOS-2026-9812",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    items: [
      { title: "Ghost Heavyweight Oversized Tee", variant: "Phantom Black / L", quantity: 1, price: 1899, sku: "TOS-TSH-GHS-01-PB-L" },
      { title: "Tactical Parachute Cargos", variant: "Sage Green / M", quantity: 1, price: 2999, sku: "TOS-CAR-TAC-02-SG-M" }
    ],
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "Razorpay (UPI)",
    subtotal: 4898,
    discount: 500, // KOALA10 coupon
    shippingCharge: 0,
    tax: 440,
    total: 4838,
    notes: "Please leave package with the security guard.",
    trackingNumber: "DEL-89210491-IND",
    shippingAddress: {
      name: "Aarav Sharma",
      phone: "+91 9876543210",
      line1: "Apt 402, Signature Towers",
      line2: "Sector 56",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122011",
      country: "India"
    },
    timeline: [
      { status: "CREATED", description: "Order created successfully via storefront checkout.", timestamp: "2026-07-02T10:14:00.000Z" },
      { status: "CONFIRMED", description: "Payment verified. Order confirmed for processing.", timestamp: "2026-07-02T10:15:30.000Z" },
      { status: "PROCESSING", description: "Items picked and packed at Mumbai Main Warehouse.", timestamp: "2026-07-02T14:40:00.000Z" },
      { status: "SHIPPED", description: "Handed over to Delhivery logistics. Tracking link generated.", timestamp: "2026-07-02T18:20:00.000Z" },
      { status: "DELIVERED", description: "Delivered to customer. Signature recorded.", timestamp: "2026-07-04T11:30:00.000Z" }
    ],
    createdAt: "2026-07-02T10:14:00.000Z"
  },
  {
    id: "ord-2",
    orderNumber: "TOS-2026-9813",
    customerName: "Rohan Verma",
    customerEmail: "rohan.v@example.com",
    items: [
      { title: "Aura Crochet Knit Shirt", variant: "Ecru / XL", quantity: 2, price: 3499, sku: "TOS-SHT-AUR-03-EC-XL" }
    ],
    status: "PROCESSING",
    paymentStatus: "PAID",
    paymentMethod: "Razorpay (Credit Card)",
    subtotal: 6998,
    discount: 0,
    shippingCharge: 150, // Express shipping
    tax: 630,
    total: 7778,
    shippingAddress: {
      name: "Rohan Verma",
      phone: "+91 9911223344",
      line1: "Flat 12B, Ocean Crest Heights",
      line2: "Carter Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      country: "India"
    },
    timeline: [
      { status: "CREATED", description: "Order created.", timestamp: "2026-07-03T16:45:00.000Z" },
      { status: "CONFIRMED", description: "Payment captured successfully.", timestamp: "2026-07-03T16:46:12.000Z" },
      { status: "PROCESSING", description: "Order being packed in luxury streetwear sleeve box.", timestamp: "2026-07-04T09:00:00.000Z" }
    ],
    createdAt: "2026-07-03T16:45:00.000Z"
  },
  {
    id: "ord-3",
    orderNumber: "TOS-2026-9814",
    customerName: "Kavya Iyer",
    customerEmail: "kavya.iyer@example.com",
    items: [
      { title: "Core Heavyweight Zip Hoodie", variant: "Heather Gray / S", quantity: 1, price: 3899, sku: "TOS-HOD-COR-04-HG-S" }
    ],
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "Razorpay (Net Banking)",
    subtotal: 3899,
    discount: 0,
    shippingCharge: 0,
    tax: 350,
    total: 4249,
    shippingAddress: {
      name: "Kavya Iyer",
      phone: "+91 9888776655",
      line1: "42, Shanti Nilayam",
      line2: "Indiranagar 2nd Stage",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      country: "India"
    },
    timeline: [
      { status: "CREATED", description: "Order created. Awaiting bank clearance confirmation.", timestamp: "2026-07-04T15:20:00.000Z" }
    ],
    createdAt: "2026-07-04T15:20:00.000Z"
  },
  {
    id: "ord-4",
    orderNumber: "TOS-2026-9815",
    customerName: "Aditya Roy",
    customerEmail: "aditya.roy@example.com",
    items: [
      { title: "Ghost Heavyweight Oversized Tee", variant: "Off-White / M", quantity: 1, price: 1899, sku: "TOS-TSH-GHS-01-OW-M" }
    ],
    status: "CANCELLED",
    paymentStatus: "FAILED",
    paymentMethod: "Razorpay (UPI)",
    subtotal: 1899,
    discount: 0,
    shippingCharge: 0,
    tax: 170,
    total: 2069,
    notes: "User abandoned payment screen.",
    shippingAddress: {
      name: "Aditya Roy",
      phone: "+91 9777665544",
      line1: "Sector 3, Pocket C-9",
      line2: "Vasant Kunj",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110070",
      country: "India"
    },
    timeline: [
      { status: "CREATED", description: "Order initiated.", timestamp: "2026-07-04T11:00:00.000Z" },
      { status: "CANCELLED", description: "System cancelled order due to payment failure timeout.", timestamp: "2026-07-04T11:15:00.000Z" }
    ],
    createdAt: "2026-07-04T11:00:00.000Z"
  }
];

export interface DashboardCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalOrdersCount: number;
  totalSpent: number;
  notes: string;
  addresses: {
    label: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  }[];
  wishlist: {
    productTitle: string;
    addedAt: string;
  }[];
  orderIds: string[];
}

export const MOCK_CUSTOMERS: DashboardCustomer[] = [
  {
    id: "cust-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 9876543210",
    loyaltyPoints: 480,
    totalOrdersCount: 4,
    totalSpent: 16890,
    notes: "Prefers oversized shirts in L. Active Instagram promoter. Send early access collection drops.",
    addresses: [
      { label: "Home", line1: "Apt 402, Signature Towers, Sector 56", city: "Gurugram", state: "Haryana", pincode: "122011" }
    ],
    wishlist: [
      { productTitle: "Aura Crochet Knit Shirt", addedAt: "2026-06-25" },
      { productTitle: "Core Heavyweight Zip Hoodie", addedAt: "2026-07-01" }
    ],
    orderIds: ["ord-1"]
  },
  {
    id: "cust-2",
    name: "Rohan Verma",
    email: "rohan.v@example.com",
    phone: "+91 9911223344",
    loyaltyPoints: 770,
    totalOrdersCount: 2,
    totalSpent: 14500,
    notes: "High value customer. Prefers express courier services only.",
    addresses: [
      { label: "Office", line1: "Ocean Crest Heights, Carter Road, Bandra W", city: "Mumbai", state: "Maharashtra", pincode: "400050" }
    ],
    wishlist: [],
    orderIds: ["ord-2"]
  },
  {
    id: "cust-3",
    name: "Kavya Iyer",
    email: "kavya.iyer@example.com",
    phone: "+91 9888776655",
    loyaltyPoints: 120,
    totalOrdersCount: 1,
    totalSpent: 4249,
    notes: "First time customer. Reached via referral link from Aarav Sharma.",
    addresses: [
      { label: "Home", line1: "42, Shanti Nilayam, Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: "560038" }
    ],
    wishlist: [
      { productTitle: "Ghost Heavyweight Oversized Tee", addedAt: "2026-07-04" }
    ],
    orderIds: ["ord-3"]
  }
];

export interface DashboardReview {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

export const MOCK_REVIEWS: DashboardReview[] = [
  {
    id: "rev-1",
    productName: "Ghost Heavyweight Oversized Tee",
    customerName: "Tushar G.",
    rating: 5,
    title: "Best heavy tee in the Indian market",
    body: "Literally 320 GSM feels super premium and boxy. Wash quality is amazing, prints didn't fade at all after 3 washes. House of Koala is unmatched.",
    approved: true,
    createdAt: "2026-07-03T18:30:00.000Z"
  },
  {
    id: "rev-2",
    productName: "Tactical Parachute Cargos",
    customerName: "Nehal K.",
    rating: 4,
    title: "Insane fit but long",
    body: "The pleats make it look super voluminous, which I love. Waist toggles are premium. Standard length is slightly long for 5'8 but stacking looks dope.",
    approved: true,
    createdAt: "2026-07-02T12:00:00.000Z"
  },
  {
    id: "rev-3",
    productName: "Aura Crochet Knit Shirt",
    customerName: "Kabir S.",
    rating: 5,
    title: "Luxury resort look",
    body: "Premium materials. Feels extremely airy. Love the button choice. Pair it with loose trousers and you have the perfect summer streetwear look.",
    approved: false, // Pending moderation
    createdAt: "2026-07-04T14:15:00.000Z"
  }
];

export interface DashboardCoupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  value: number;
  minOrderValue?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export const MOCK_COUPONS: DashboardCoupon[] = [
  { id: "cop-1", code: "KOALA10", description: "10% off for verified community members", discountType: "PERCENTAGE", value: 10, minOrderValue: 1500, usedCount: 384, isActive: true, expiresAt: "2026-12-31" },
  { id: "cop-2", code: "HEAVYFIT", description: "Flat ₹500 off on purchasing outerwear sets", discountType: "FLAT", value: 500, minOrderValue: 4000, usedCount: 192, isActive: true, expiresAt: "2026-09-30" },
  { id: "cop-3", code: "STUDIO30", description: "30% off for family & streetwear creators", discountType: "PERCENTAGE", value: 30, usedCount: 22, isActive: true, expiresAt: "2026-08-15" }
];

export interface DashboardActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export const MOCK_ACTIVITY_LOGS: DashboardActivityLog[] = [
  { id: "log-1", user: "Vikram Rathore (Owner)", role: "Owner", action: "COUPON_CREATE", details: "Created code STUDIO30 (30% discount)", ipAddress: "103.45.201.12", timestamp: "2026-07-04T17:20:00Z" },
  { id: "log-2", user: "Maya Sen (Marketing)", role: "Marketing", action: "EMAIL_CAMPAIGN_SEND", details: "Dispatched 'Heavyweight Drop #4' newsletter to 8,240 subscribers", ipAddress: "192.168.1.45", timestamp: "2026-07-04T15:10:00Z" },
  { id: "log-3", user: "Rohan D. (Warehouse)", role: "Warehouse", action: "STOCK_UPDATE", details: "Restocked SKU TOS-CAR-TAC-02 by +50 units", ipAddress: "103.45.201.19", timestamp: "2026-07-04T12:05:00Z" },
  { id: "log-4", user: "Sarah Khan (Support)", role: "Support", action: "ORDER_REFUND", details: "Initiated refund for order TOS-2026-9799 (₹2,069)", ipAddress: "103.45.201.14", timestamp: "2026-07-04T10:45:00Z" }
];
