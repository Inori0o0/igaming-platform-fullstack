import type { Product } from "@/src/shop/types";

export const shopProducts: Product[] = [
  {
    id: "vacant-logo-tee",
    name: "vAcAnt Logo Tee",
    priceVac: 2900,
    category: "apparel",
    imageSrc: "/games/slots/vacant-classic/vc_card.png",
    description: "經典品牌短T，日常穿搭與直播出鏡都好搭配。",
    stock: 120,
  },
  {
    id: "neon-horse-hoodie",
    name: "Neon Horse Hoodie",
    priceVac: 5900,
    category: "apparel",
    imageSrc: "/games/slots/vacant-classic/vc_banner.png",
    description: "內刷毛連帽外套，胸前霓虹馬圖樣。",
    stock: 60,
  },
  {
    id: "brainrot-varsity-jacket",
    name: "Brainrot Varsity Jacket",
    priceVac: 8800,
    category: "apparel",
    imageSrc: "/games/slots/italian-brainrot/ib_banner.png",
    description: "Italian Brainrot 聯名棒球外套，限量批次釋出。",
    stock: 35,
  },
  {
    id: "lucky-wheel-cap",
    name: "Lucky Wheel Cap",
    priceVac: 2200,
    category: "apparel",
    imageSrc: "/games/lottery/lucky_wheel_card.png",
    description: "彎帽簷帽款，刺繡 Lucky Wheel 標誌。",
    stock: 80,
  },
  {
    id: "vip-membership-30d",
    name: "VIP Membership (30 Days)",
    priceVac: 9900,
    category: "digital",
    imageSrc: "/games/chip_card/chip_5000.png",
    description: "30 天 VIP 會員資格，含專屬稱號與活動優先權。",
    stock: null,
  },
  {
    id: "exclusive-avatar-pack",
    name: "Exclusive Avatar Pack (12款)",
    priceVac: 1500,
    category: "digital",
    imageSrc: "/games/slots/italian-brainrot/ib-symbol/ib_tralalero_tralala.png",
    description: "12 款限定頭像，支援個人資料與聊天室顯示。",
    stock: null,
  },
  {
    id: "animated-profile-frame-neon",
    name: "Animated Profile Frame - Neon",
    priceVac: 1200,
    category: "digital",
    imageSrc: "/games/chip_card/chip_1000.png",
    description: "霓虹動態外框，強化個人頁辨識度。",
    stock: null,
  },
  {
    id: "limited-horse-statue-mini",
    name: "Limited Horse Statue (Mini)",
    priceVac: 12500,
    category: "collectible",
    imageSrc: "/games/blackjack/bj_card.png",
    description: "霓虹馬迷你雕像，附序號卡與收藏盒。",
    stock: 20,
  },
  {
    id: "signed-art-poster-brainrot-cast",
    name: "Signed Art Poster - Brainrot Cast",
    priceVac: 4500,
    category: "collectible",
    imageSrc: "/games/lottery/scratch_card_card.png",
    description: "角色群像海報，限量簽名版本。",
    stock: 50,
  },
  {
    id: "collector-chip-set-50pcs",
    name: "Collector Chip Set (50 pcs)",
    priceVac: 7200,
    category: "collectible",
    imageSrc: "/games/chip_card/chip_500.png",
    description: "金屬質感收藏籌碼組，含展示盒。",
    stock: 40,
  },
];

export function getProductById(productId: string) {
  return shopProducts.find((product) => product.id === productId);
}

