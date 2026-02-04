import HomeHeroSection from "@/components/Home/HomeHeroSection";
import HomeProductSection from "@/components/Home/HomeProductSection";

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
    images: ["/sharee.png", "/candle.png"],

    sizes: ["S", "M", "L", "XL"],

    colors: [
      {
        name: "Blue",
        hex: "#2563EB",
        images: ["/sharee.png", "/candle.png"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["/sharee.png", "/candle.png"],
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
    images: ["/sharee.png", "/candle.png"],

    colors: [
      {
        name: "Brown",
        hex: "#7C3E0F",
        images: ["/sharee.png", "/candle.png"],
      },
      {
        name: "Cream",
        hex: "#F5EDE2",
        images: ["/sharee.png", "/candle.png"],
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
    images: ["/sharee.png", "/candle.png"],

    colors: [
      {
        name: "Silver",
        hex: "#CBD5E1",
        images: ["/sharee.png", "/candle.png"],
      },
      {
        name: "Black",
        hex: "#111827",
        images: ["/sharee.png", "/candle.png"],
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
    images: ["/sharee.png", "/candle.png"],

    sizes: ["4Y", "6Y", "8Y", "10Y"],

    colors: [
      {
        name: "Red",
        hex: "#EF4444",
        images: ["/sharee.png", "/candle.png"],
      },
      {
        name: "Gray",
        hex: "#9CA3AF",
        images: ["/sharee.png", "/candle.png"],
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
    images: ["/sharee.png", "/candle.png"],

    sizes: ["39", "40", "41", "42", "43"],

    colors: [
      {
        name: "White",
        hex: "#FFFFFF",
        images: ["/sharee.png", "/candle.png"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["/sharee.png", "/candle.png"],
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
    images: ["/sharee.png", "/candle.png"],

    colors: [
      {
        name: "Black",
        hex: "#000000",
        images: ["/sharee.png", "/candle.png"],
      },
      {
        name: "Gold",
        hex: "#D4AF37",
        images: ["/sharee.png", "/candle.png"],
      },
    ],

    status: "active",
  },
];


export default function Home() {
  return (
    <>
      <HomeHeroSection />
      <HomeProductSection products={dummyProducts} />
    </>
  );
}
