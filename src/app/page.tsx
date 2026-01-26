import HomeHeroSection from "@/components/Home/HomeHeroSection";
import HomeProductSection from "@/components/Home/HomeProductSection";

export default function Home() {

 const dummyProducts = [
  {
    _id: "1",
    name: "Premium Men's Casual Shirt",
    slug: "premium-mens-casual-shirt",
    description: "High quality cotton casual shirt for men.",
    basePrice: 1590,
    discountPrice: 1290,
    finalPrice: 1290,
    sku: "SKU-MEN-001",
    stock: 25,
    commissionPercent: 10,
    category: "65fabc1234567890abcd1111",
    tags: ["fashion", "men"],
    images: ["/images/products/shirt-1.jpg"],

    sizes: ["S", "M", "L", "XL"],

    colors: [
      {
        name: "Blue",
        hex: "#2563EB",
        images: ["/images/products/shirt-blue.jpg"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["/images/products/shirt-black.jpg"],
      },
    ],

    status: "active",
  },

  {
    _id: "2",
    name: "Stylish Women's Handbag",
    slug: "stylish-womens-handbag",
    description: "Premium leather handbag for women.",
    basePrice: 2490,
    discountPrice: 1990,
    finalPrice: 1990,
    sku: "SKU-WOMEN-002",
    stock: 12,
    commissionPercent: 15,
    category: "65fabc1234567890abcd2222",
    tags: ["fashion", "bags"],
    images: ["/images/products/bag-1.jpg"],

    colors: [
      {
        name: "Brown",
        hex: "#7C3E0F",
        images: ["/images/products/bag-brown.jpg"],
      },
      {
        name: "Cream",
        hex: "#F5EDE2",
        images: ["/images/products/bag-cream.jpg"],
      },
    ],

    status: "active",
  },

  {
    _id: "3",
    name: "Smart Watch Series 9",
    slug: "smart-watch-series-9",
    description: "Latest smart watch with health tracking features.",
    basePrice: 4990,
    discountPrice: 4490,
    finalPrice: 4490,
    sku: "SKU-TECH-003",
    stock: 18,
    commissionPercent: 12,
    category: "65fabc1234567890abcd3333",
    tags: ["electronics", "watch"],
    images: ["/images/products/watch-1.jpg"],

    colors: [
      {
        name: "Silver",
        hex: "#CBD5E1",
        images: ["/images/products/watch-silver.jpg"],
      },
      {
        name: "Black",
        hex: "#111827",
        images: ["/images/products/watch-black.jpg"],
      },
    ],

    status: "active",
  },

  {
    _id: "4",
    name: "Kids Trendy Hoodie",
    slug: "kids-trendy-hoodie",
    description: "Soft and warm hoodie for kids.",
    basePrice: 1490,
    discountPrice: 1190,
    finalPrice: 1190,
    sku: "SKU-KIDS-004",
    stock: 0,
    commissionPercent: 8,
    category: "65fabc1234567890abcd4444",
    tags: ["kids", "fashion"],
    images: ["/images/products/hoodie-1.jpg"],

    sizes: ["4Y", "6Y", "8Y", "10Y"],

    colors: [
      {
        name: "Red",
        hex: "#EF4444",
        images: ["/images/products/hoodie-red.jpg"],
      },
      {
        name: "Gray",
        hex: "#9CA3AF",
        images: ["/images/products/hoodie-gray.jpg"],
      },
    ],

    status: "active",
  },

  {
    _id: "5",
    name: "Running Sneakers",
    slug: "running-sneakers",
    description: "Lightweight running shoes for daily use.",
    basePrice: 3490,
    discountPrice: 2990,
    finalPrice: 2990,
    sku: "SKU-SHOES-005",
    stock: 30,
    commissionPercent: 10,
    category: "65fabc1234567890abcd5555",
    tags: ["shoes", "sports"],
    images: ["/images/products/shoes-1.jpg"],

    sizes: ["39", "40", "41", "42", "43"],

    colors: [
      {
        name: "White",
        hex: "#FFFFFF",
        images: ["/images/products/shoes-white.jpg"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["/images/products/shoes-black.jpg"],
      },
    ],

    status: "active",
  },

  {
    _id: "6",
    name: "Luxury Sunglasses",
    slug: "luxury-sunglasses",
    description: "Stylish UV-protected sunglasses.",
    basePrice: 1990,
    discountPrice: 1690,
    finalPrice: 1690,
    sku: "SKU-ACCESS-006",
    stock: 15,
    commissionPercent: 14,
    category: "65fabc1234567890abcd6666",
    tags: ["accessories"],
    images: ["/images/products/sunglasses-1.jpg"],

    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: ["/images/products/sunglasses-black.jpg"],
      },
      {
        name: "Gold",
        hex: "#D4AF37",
        images: ["/images/products/sunglasses-gold.jpg"],
      },
    ],

    status: "active",
  },
];

  return (
    <>
      <HomeHeroSection />
      <HomeProductSection products={dummyProducts} />
    </>
  );
}
