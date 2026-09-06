// Programmatic seeder: creates real bcrypt password hashes, a roster of
// dummy marketplace sellers, and a full dummy product catalog with
// generated bulk-pricing tiers.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

const sellers = [
  { name: 'Atlas Textile Supply', location: 'Charlotte, NC', rating: 4.7, review_count: 1284, since_year: 2014 },
  { name: 'Northbridge Housewares', location: 'Grand Rapids, MI', rating: 4.5, review_count: 862, since_year: 2017 },
  { name: 'Coastal Bag & Canvas Co.', location: 'Savannah, GA', rating: 4.8, review_count: 2031, since_year: 2011 },
  { name: 'Vantage Electronics Trading', location: 'San Jose, CA', rating: 4.3, review_count: 540, since_year: 2019 },
  { name: 'Iron & Oak Tool Works', location: 'Pittsburgh, PA', rating: 4.6, review_count: 977, since_year: 2009 },
  { name: 'Prairie Paper & Packaging', location: 'Omaha, NE', rating: 4.4, review_count: 615, since_year: 2016 },
  { name: 'Summit Office Provisions', location: 'Denver, CO', rating: 4.2, review_count: 349, since_year: 2020 },
  { name: 'Redline Kitchen Supply', location: 'Austin, TX', rating: 4.9, review_count: 1560, since_year: 2013 },
  { name: 'Harborline Import Co.', location: 'Long Beach, CA', rating: 4.1, review_count: 208, since_year: 2021 },
];

// sku, name (en/fr/ar), description (en/fr/ar), category, base_price, moq, stock, sellerIndex
const products = [
  // Apparel — Atlas Textile Supply
  { sku: 'WR-1001', name: { en: 'Cotton T-Shirt (Blank)', fr: 'T-shirt en coton (uni)', ar: 'تيشيرت قطني سادة' }, description: { en: 'Plain 100% cotton t-shirt, bulk pack, various sizes.', fr: 'T-shirt 100 % coton uni, en pack, tailles variées.', ar: 'تيشيرت 100% قطن سادة، عبوة بالجملة، مقاسات متنوعة.' }, category: 'Apparel', base_price: 4.50, moq: 50, stock: 5000, sellerIdx: 0, image: 'https://loremflickr.com/640/480/cotton,tshirt' },
  { sku: 'WR-1002', name: { en: 'Fleece Zip Hoodie (Blank)', fr: 'Sweat à capuche zippé en polaire (uni)', ar: 'هودي بولار بسحاب (سادة)' }, description: { en: 'Mid-weight fleece hoodie, ready for embroidery or print.', fr: 'Sweat à capuche en polaire mi-épaisseur, prêt pour broderie ou impression.', ar: 'هودي بولار متوسط السماكة، جاهز للتطريز أو الطباعة.' }, category: 'Apparel', base_price: 11.20, moq: 25, stock: 2200, sellerIdx: 0, image: 'https://loremflickr.com/640/480/fleece,hoodie' },
  { sku: 'WR-1003', name: { en: 'Cotton Crew Socks (12-pack)', fr: 'Chaussettes montantes en coton (pack de 12)', ar: 'جوارب قطنية طويلة (عبوة 12)' }, description: { en: 'Durable crew socks, bulk case packs.', fr: 'Chaussettes montantes résistantes, en cartons groupés.', ar: 'جوارب طويلة متينة، عبوات بالجملة.' }, category: 'Apparel', base_price: 1.35, moq: 100, stock: 9000, sellerIdx: 0, image: 'https://loremflickr.com/640/480/crew,socks' },
  { sku: 'WR-1004', name: { en: 'High-Vis Safety Vest', fr: 'Gilet de sécurité haute visibilité', ar: 'سترة سلامة عاكسة' }, description: { en: 'ANSI Class 2 reflective safety vest.', fr: 'Gilet de sécurité réfléchissant ANSI classe 2.', ar: 'سترة سلامة عاكسة من الفئة ANSI الثانية.' }, category: 'Apparel', base_price: 3.90, moq: 50, stock: 3000, sellerIdx: 0, image: 'https://loremflickr.com/640/480/safety,vest' },
  // Housewares — Northbridge Housewares
  { sku: 'WR-2001', name: { en: 'Ceramic Coffee Mug 11oz', fr: 'Mug en céramique 11oz', ar: 'كوب قهوة سيراميك 11 أونصة' }, description: { en: 'Standard white ceramic mug, sublimation-ready.', fr: 'Mug blanc standard en céramique, prêt pour sublimation.', ar: 'كوب سيراميك أبيض قياسي، جاهز للطباعة بالتسامي.' }, category: 'Housewares', base_price: 2.10, moq: 100, stock: 8000, sellerIdx: 1, image: 'https://loremflickr.com/640/480/ceramic,mug' },
  { sku: 'WR-2002', name: { en: 'Stainless Steel Water Bottle 750ml', fr: "Bouteille d'eau en acier inoxydable 750ml", ar: 'زجاجة ماء ستانلس ستيل 750مل' }, description: { en: 'Double-wall insulated bottle.', fr: 'Bouteille isotherme à double paroi.', ar: 'زجاجة معزولة بجدار مزدوج.' }, category: 'Housewares', base_price: 6.75, moq: 24, stock: 3000, sellerIdx: 1, image: 'https://loremflickr.com/640/480/steel,water-bottle' },
  { sku: 'WR-2003', name: { en: 'Cotton Bath Towel Set', fr: 'Ensemble de serviettes de bain en coton', ar: 'طقم مناشف حمام قطنية' }, description: { en: 'Set of 2, 100% combed cotton.', fr: 'Lot de 2, 100 % coton peigné.', ar: 'طقم من قطعتين، 100% قطن ممشط.' }, category: 'Housewares', base_price: 8.40, moq: 24, stock: 1800, sellerIdx: 1, image: 'https://loremflickr.com/640/480/bath,towel' },
  { sku: 'WR-2004', name: { en: 'Glass Storage Jar 32oz', fr: 'Bocal de conservation en verre 32oz', ar: 'برطمان تخزين زجاجي 32 أونصة' }, description: { en: 'Airtight glass jar with bamboo lid.', fr: 'Bocal en verre hermétique avec couvercle en bambou.', ar: 'برطمان زجاجي محكم الغلق بغطاء من الخيزران.' }, category: 'Housewares', base_price: 3.10, moq: 48, stock: 2600, sellerIdx: 1, image: 'https://loremflickr.com/640/480/glass,jar' },
  // Bags — Coastal Bag & Canvas Co.
  { sku: 'WR-3001', name: { en: 'Canvas Tote Bag', fr: 'Sac fourre-tout en toile', ar: 'حقيبة توتس قماشية' }, description: { en: 'Heavy-duty 12oz canvas tote.', fr: 'Sac fourre-tout robuste en toile 12oz.', ar: 'حقيبة قماشية متينة سعة 12 أونصة.' }, category: 'Bags', base_price: 3.20, moq: 50, stock: 4000, sellerIdx: 2, image: 'https://loremflickr.com/640/480/canvas,tote-bag' },
  { sku: 'WR-3002', name: { en: 'Drawstring Backpack', fr: 'Sac à dos à cordon', ar: 'حقيبة ظهر بحبل سحب' }, description: { en: 'Lightweight polyester cinch bag.', fr: 'Sac cordon léger en polyester.', ar: 'حقيبة خفيفة من البوليستر بحبل سحب.' }, category: 'Bags', base_price: 2.60, moq: 100, stock: 6000, sellerIdx: 2, image: 'https://loremflickr.com/640/480/drawstring,backpack' },
  { sku: 'WR-3003', name: { en: 'Insulated Lunch Cooler Bag', fr: 'Sac isotherme repas', ar: 'حقيبة تبريد معزولة للغداء' }, description: { en: 'Foil-lined cooler bag, folds flat.', fr: 'Sac isotherme doublé aluminium, pliable.', ar: 'حقيبة تبريد مبطنة بالألمنيوم، قابلة للطي.' }, category: 'Bags', base_price: 4.75, moq: 48, stock: 2400, sellerIdx: 2, image: 'https://loremflickr.com/640/480/cooler,bag' },
  { sku: 'WR-3004', name: { en: 'Duffel Gym Bag', fr: 'Sac de sport', ar: 'حقيبة رياضية' }, description: { en: '600D polyester duffel with shoe compartment.', fr: 'Sac de sport en polyester 600D avec compartiment chaussures.', ar: 'حقيبة رياضية من البوليستر 600D مع حجرة للأحذية.' }, category: 'Bags', base_price: 9.80, moq: 24, stock: 1400, sellerIdx: 2, image: 'https://loremflickr.com/640/480/duffel,gym-bag' },
  // Electronics — Vantage Electronics Trading
  { sku: 'WR-4001', name: { en: 'LED Desk Lamp', fr: 'Lampe de bureau LED', ar: 'مصباح مكتب LED' }, description: { en: 'Adjustable LED desk lamp, USB powered.', fr: 'Lampe de bureau LED réglable, alimentée par USB.', ar: 'مصباح مكتب LED قابل للتعديل، يعمل بمنفذ USB.' }, category: 'Electronics', base_price: 9.90, moq: 12, stock: 1500, sellerIdx: 3, image: 'https://loremflickr.com/640/480/led,desk-lamp' },
  { sku: 'WR-4002', name: { en: 'Wireless Charging Pad', fr: 'Chargeur sans fil', ar: 'لوحة شحن لاسلكية' }, description: { en: '10W Qi-certified charging pad.', fr: 'Chargeur sans fil 10W certifié Qi.', ar: 'لوحة شحن لاسلكية 10 واط معتمدة من Qi.' }, category: 'Electronics', base_price: 6.40, moq: 25, stock: 2000, sellerIdx: 3, image: 'https://loremflickr.com/640/480/wireless,charger' },
  { sku: 'WR-4003', name: { en: 'Bluetooth Earbuds (Bulk)', fr: 'Écouteurs Bluetooth (lot)', ar: 'سماعات بلوتوث (بالجملة)' }, description: { en: 'TWS earbuds with charging case.', fr: 'Écouteurs TWS avec boîtier de charge.', ar: 'سماعات TWS مع علبة شحن.' }, category: 'Electronics', base_price: 8.90, moq: 20, stock: 1600, sellerIdx: 3, image: 'https://loremflickr.com/640/480/bluetooth,earbuds' },
  { sku: 'WR-4004', name: { en: 'USB-C Power Bank 10000mAh', fr: 'Batterie externe USB-C 10000mAh', ar: 'بطارية محمولة USB-C سعة 10000 مللي أمبير' }, description: { en: 'Slim aluminum power bank.', fr: 'Batterie externe fine en aluminium.', ar: 'بطارية محمولة رفيعة من الألمنيوم.' }, category: 'Electronics', base_price: 12.50, moq: 15, stock: 900, sellerIdx: 3, image: 'https://loremflickr.com/640/480/power-bank' },
  // Tools — Iron & Oak Tool Works
  { sku: 'WR-5001', name: { en: '16oz Claw Hammer', fr: 'Marteau à panne fendue 16oz', ar: 'مطرقة مخلبية 16 أونصة' }, description: { en: 'Forged steel head, fiberglass handle.', fr: 'Tête en acier forgé, manche en fibre de verre.', ar: 'رأس من الفولاذ المطروق، مقبض من الألياف الزجاجية.' }, category: 'Tools', base_price: 7.20, moq: 24, stock: 1200, sellerIdx: 4, image: 'https://loremflickr.com/640/480/claw-hammer' },
  { sku: 'WR-5002', name: { en: '20pc Precision Screwdriver Set', fr: 'Jeu de tournevis de précision (20 pièces)', ar: 'طقم مفكات دقيقة (20 قطعة)' }, description: { en: 'Magnetic tips, rotating cap.', fr: 'Embouts magnétiques, capuchon rotatif.', ar: 'أطراف مغناطيسية، غطاء دوار.' }, category: 'Tools', base_price: 5.10, moq: 36, stock: 1800, sellerIdx: 4, image: 'https://loremflickr.com/640/480/screwdriver,set' },
  { sku: 'WR-5003', name: { en: 'Adjustable Wrench 10-inch', fr: 'Clé à molette 10 pouces', ar: 'مفتاح قابل للتعديل 10 بوصة' }, description: { en: 'Chrome-plated drop-forged steel.', fr: 'Acier chromé forgé.', ar: 'فولاذ مطروق مطلي بالكروم.' }, category: 'Tools', base_price: 6.60, moq: 24, stock: 1400, sellerIdx: 4, image: 'https://loremflickr.com/640/480/adjustable-wrench' },
  // Packaging — Prairie Paper & Packaging
  { sku: 'WR-6001', name: { en: 'Corrugated Shipping Box (Medium)', fr: "Carton d'expédition ondulé (moyen)", ar: 'صندوق شحن مضلع (متوسط)' }, description: { en: '14x10x8in, 200lb test.', fr: '14x10x8 po, résistance 200 lb.', ar: '14x10x8 بوصة، تحمل 200 رطل.' }, category: 'Packaging', base_price: 0.65, moq: 200, stock: 15000, sellerIdx: 5, image: 'https://loremflickr.com/640/480/cardboard,box' },
  { sku: 'WR-6002', name: { en: 'Kraft Packing Paper Roll', fr: "Rouleau de papier kraft d'emballage", ar: 'رول ورق تغليف كرافت' }, description: { en: '30in x 900ft void-fill paper.', fr: 'Papier de calage 30 po x 900 pi.', ar: 'ورق حشو 30 بوصة × 900 قدم.' }, category: 'Packaging', base_price: 14.00, moq: 10, stock: 600, sellerIdx: 5, image: 'https://loremflickr.com/640/480/kraft,paper-roll' },
  { sku: 'WR-6003', name: { en: 'Poly Mailers 10x13in', fr: 'Enveloppes plastiques 10x13in', ar: 'أظرف بريدية بلاستيكية 10×13 بوصة' }, description: { en: 'Self-seal water-resistant mailers.', fr: 'Enveloppes autoscellantes résistantes à l\'eau.', ar: 'أظرف ذاتية اللصق مقاومة للماء.' }, category: 'Packaging', base_price: 0.12, moq: 500, stock: 40000, sellerIdx: 5, image: 'https://loremflickr.com/640/480/poly-mailer,envelope' },
  // Office — Summit Office Provisions
  { sku: 'WR-7001', name: { en: 'Ballpoint Pens (Box of 50)', fr: 'Stylos à bille (boîte de 50)', ar: 'أقلام حبر جاف (علبة 50 قلم)' }, description: { en: 'Medium point, black ink.', fr: 'Pointe moyenne, encre noire.', ar: 'سن متوسط، حبر أسود.' }, category: 'Office Supplies', base_price: 4.20, moq: 20, stock: 1600, sellerIdx: 6, image: 'https://loremflickr.com/640/480/ballpoint,pens' },
  { sku: 'WR-7002', name: { en: 'Sticky Notes 3x3in (24-pack)', fr: 'Notes autocollantes 3x3in (paquet de 24)', ar: 'ملاحظات لاصقة 3×3 بوصة (عبوة 24)' }, description: { en: 'Assorted colors, 100 sheets each.', fr: 'Couleurs assorties, 100 feuilles chacune.', ar: 'ألوان متنوعة، 100 ورقة لكل عبوة.' }, category: 'Office Supplies', base_price: 9.60, moq: 15, stock: 1100, sellerIdx: 6, image: 'https://loremflickr.com/640/480/sticky-notes' },
  { sku: 'WR-7003', name: { en: 'Printer Paper Ream (Case of 10)', fr: "Ramette de papier imprimante (carton de 10)", ar: 'رزمة ورق طابعة (كرتون 10 رزم)' }, description: { en: '20lb, 92 bright letter size.', fr: '20 lb, blancheur 92, format lettre.', ar: '20 رطل، سطوع 92، مقاس رسالة.' }, category: 'Office Supplies', base_price: 32.00, moq: 5, stock: 400, sellerIdx: 6, image: 'https://loremflickr.com/640/480/printer-paper,ream' },
  // Kitchen — Redline Kitchen Supply
  { sku: 'WR-8001', name: { en: 'Stainless Steel Mixing Bowl Set', fr: 'Ensemble de bols à mélanger en acier inoxydable', ar: 'طقم أوعية خلط ستانلس ستيل' }, description: { en: 'Set of 5 nesting bowls.', fr: 'Lot de 5 bols gigognes.', ar: 'طقم من 5 أوعية متداخلة.' }, category: 'Kitchen', base_price: 10.90, moq: 12, stock: 700, sellerIdx: 7, image: 'https://loremflickr.com/640/480/mixing-bowl,steel' },
  { sku: 'WR-8002', name: { en: 'Chef Knife 8-inch', fr: 'Couteau de chef 8 pouces', ar: 'سكين شيف 8 بوصة' }, description: { en: 'High-carbon stainless steel blade.', fr: 'Lame en acier inoxydable haut carbone.', ar: 'نصل ستانلس ستيل عالي الكربون.' }, category: 'Kitchen', base_price: 7.80, moq: 24, stock: 950, sellerIdx: 7, image: 'https://loremflickr.com/640/480/chef-knife' },
  { sku: 'WR-8003', name: { en: 'Silicone Baking Mat Set', fr: 'Ensemble de tapis de cuisson en silicone', ar: 'طقم سجاد سيليكون للخبز' }, description: { en: 'Set of 2, non-stick, reusable.', fr: 'Lot de 2, antiadhésif, réutilisable.', ar: 'طقم من قطعتين، غير لاصق، قابل لإعادة الاستخدام.' }, category: 'Kitchen', base_price: 4.10, moq: 30, stock: 1300, sellerIdx: 7, image: 'https://loremflickr.com/640/480/silicone,baking-mat' },
];

// Generates 3 bulk-pricing tiers per product: MOQ tier, a mid tier at ~4x
// MOQ (8% off), and a top tier at ~10x MOQ (18% off base price).
function generateTiers(basePrice, moq) {
  const round2 = (n) => Math.round(n * 100) / 100;
  return [
    { min_quantity: moq, unit_price: round2(basePrice) },
    { min_quantity: moq * 4, unit_price: round2(basePrice * 0.92) },
    { min_quantity: moq * 10, unit_price: round2(basePrice * 0.82) },
  ];
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    const adminHash = await bcrypt.hash('Admin123!', 10);
    const buyerHash = await bcrypt.hash('Buyer123!', 10);

    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM pricing_tiers');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM sellers');
    await client.query('DELETE FROM users');

    await client.query(
      `INSERT INTO users (company_name, contact_name, email, password_hash, role, payment_terms, credit_limit, status)
       VALUES ($1,$2,$3,$4,'admin','prepaid',0,'approved')`,
      ['Admin Co', 'Admin User', 'admin@example.com', adminHash]
    );

    const buyerRes = await client.query(
      `INSERT INTO users (company_name, contact_name, email, password_hash, role, payment_terms, credit_limit, status)
       VALUES ($1,$2,$3,$4,'buyer','net_30',10000,'approved') RETURNING id`,
      ['Acme Retail LLC', 'Jane Buyer', 'buyer@example.com', buyerHash]
    );
    console.log('Created demo buyer id', buyerRes.rows[0].id);

    const sellerIds = [];
    for (const s of sellers) {
      const res = await client.query(
        `INSERT INTO sellers (name, location, rating, review_count, since_year, verified)
         VALUES ($1,$2,$3,$4,$5, true) RETURNING id`,
        [s.name, s.location, s.rating, s.review_count, s.since_year]
      );
      sellerIds.push(res.rows[0].id);
    }
    console.log(`Created ${sellerIds.length} sellers.`);

    for (const p of products) {
      const res = await client.query(
        `INSERT INTO products (seller_id, sku, name, description, name_fr, name_ar, description_fr, description_ar, category, base_price, moq, stock_quantity, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [sellerIds[p.sellerIdx], p.sku, p.name.en, p.description.en, p.name.fr, p.name.ar, p.description.fr, p.description.ar, p.category, p.base_price, p.moq, p.stock, p.image]
      );
      const productId = res.rows[0].id;
      for (const tier of generateTiers(p.base_price, p.moq)) {
        await client.query(
          `INSERT INTO pricing_tiers (product_id, min_quantity, unit_price) VALUES ($1,$2,$3)`,
          [productId, tier.min_quantity, tier.unit_price]
        );
      }
    }
    console.log(`Created ${products.length} products with bulk pricing tiers.`);

    console.log('Seed complete.');
    console.log('Admin login: admin@example.com / Admin123!');
    console.log('Buyer login: buyer@example.com / Buyer123!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
