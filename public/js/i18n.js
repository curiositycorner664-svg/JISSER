// BINA i18n — English / French / Arabic
// Static UI strings live in the dictionaries below. Product/seller data
// coming from the database (names, descriptions, categories) is not
// translated — that would require a translation service on the backend.

const I18N = {
  en: {
    dir: 'ltr',
    nav_all_products: 'All Products',
    nav_my_orders: 'My Orders',
    nav_log_in: 'Log In',
    nav_register: 'Register',
    nav_log_out: 'Log Out',
    nav_search_placeholder: 'Search the catalog...',
    nav_search_btn: 'Search',
    tagline: 'YOUR TRUSTED ONLINE STORE',
    footer: 'BINA — Your Trusted Online Store.',

    home_hero_badge: 'Bulk Deal',
    home_hero_title: 'Cotton tees, 1000+ units, $3.40 each.',
    home_hero_body: 'Every SKU in this catalog ships with a quantity break — the more crates you take, the less you pay per unit. Browse the full manifest below.',
    home_hero_cta: 'View bulk pricing',
    home_hero_stat_label: 'off unit price at the top tier',
    search_placeholder: 'Search products...',
    all_categories: 'All categories',
    all_sellers: 'All sellers',
    loading_products: 'Loading products...',
    no_products_found: 'No wares match that search. Try a different term, category, or seller.',
    no_image: 'No image',
    per_unit_at_moq: '/ unit at MOQ',
    moq_in_stock: '{moq} MOQ · {stock} in stock',
    sold_by: 'Sold by',
    verified_seller: 'Verified seller',
    view_and_order: 'View & Order',
    result_count: '{n} item',
    result_count_plural: '{n} items',

    loading: 'Loading...',
    cart_title: 'Your Crate',
    packing_slip: 'Packing Slip',
    packing_slip_count: 'Packing Slip — {n} item',
    packing_slip_count_plural: 'Packing Slip — {n} items',
    crate_empty: 'Your crate is empty.',
    browse_catalog_link: 'Browse the catalog',
    remove: 'Remove',
    moq_label: 'MOQ {moq}',
    proceed_checkout: 'Proceed to Checkout',
    final_pricing_note: 'Final pricing applies bulk-tier discounts at checkout.',
    est_total: 'Est. total: ${amount}',

    checkout_title: 'Checkout',
    must_log_in: 'You must be logged in to check out.',
    log_in_link: 'Log in',
    order_notes: 'Order notes (optional)',
    place_order: 'Place Order',
    payment_terms_label: 'payment terms',
    prepaid_note: 'Prepaid account — no credit limit applies.',
    credit_summary: 'Credit limit ${limit} · used ${used} · available ${available}',
    server_recalc_note: 'Server recalculates exact bulk-tier pricing on submit.',
    order_placed: 'Order #{id} placed — total ${total}.',

    login_title: 'Account Log In',
    login_subtitle: 'For approved wholesale buyers.',
    email_label: 'Email',
    password_label: 'Password',
    log_in_btn: 'Log In',
    no_account_yet: "Don't have an account?",
    register_link: 'Register',
    demo_login_note: 'Demo: buyer@example.com / Buyer123! (after running the seed script)',

    register_title: 'Open a B2B Account',
    register_subtitle: "New accounts are reviewed before ordering — we'll set your credit terms on approval.",
    company_name_label: 'Company Name',
    contact_name_label: 'Contact Name',
    password_hint_label: 'Password (min 8 characters)',
    register_btn: 'Register',
    already_have_account: 'Already have an account?',

    orders_title: 'Order Manifest',
    please_log_in_orders: 'Please log in to view your orders.',
    no_orders_yet: "No orders yet — your manifest is empty.",
    th_order: 'Order',
    th_date: 'Date',
    th_status: 'Status',
    th_terms: 'Terms',
    th_total: 'Total',

    product_all_products_crumb: 'All Products',
    product_no_description: 'No description provided.',
    product_no_image: 'No image on file',
    product_base_price: '/ unit (base price)',
    product_out_of_stock: 'Out of stock',
    product_units_in_stock: '{n} units in stock',
    product_reviews: '({n} reviews)',
    product_since: 'Selling since {year}',
    product_save_pct: 'save {pct}%',
    product_qty_label: 'Quantity (MOQ {moq})',
    product_add_to_cart: 'Add to Cart',
    product_added: 'Added to cart.',
    product_bulk_note: 'Sold in bulk to approved B2B accounts. Sign in for net-terms checkout.',
    product_uncategorized: 'Uncategorized',
    product_tier_units: '{n}+ units',
    product_tier_unit_price: '${price}/unit',
    admin_delete_product: 'Delete Product (Admin)',
    admin_delete_confirm: 'Remove this product from the catalog? This cannot be undone from the UI.',
    admin_delete_success: 'Product removed.',

    status_pending: 'Pending',
    status_confirmed: 'Confirmed',
    status_shipped: 'Shipped',
    status_paid: 'Paid',
    status_cancelled: 'Cancelled',
    terms_prepaid: 'Prepaid',
    terms_net_15: 'Net 15',
    terms_net_30: 'Net 30',
    terms_net_60: 'Net 60',

    category_apparel: 'Apparel',
    category_housewares: 'Housewares',
    category_bags: 'Bags',
    category_electronics: 'Electronics',
    category_tools: 'Tools',
    category_packaging: 'Packaging',
    category_office_supplies: 'Office Supplies',
    category_kitchen: 'Kitchen',
  },

  fr: {
    dir: 'ltr',
    nav_all_products: 'Tous les produits',
    nav_my_orders: 'Mes commandes',
    nav_log_in: 'Connexion',
    nav_register: 'Créer un compte',
    nav_log_out: 'Déconnexion',
    nav_search_placeholder: 'Rechercher dans le catalogue...',
    nav_search_btn: 'Rechercher',
    tagline: 'VOTRE BOUTIQUE EN LIGNE DE CONFIANCE',
    footer: 'BINA — Votre boutique en ligne de confiance.',

    home_hero_badge: 'Offre en gros',
    home_hero_title: 'T-shirts en coton, 1000+ unités, 3,40 $ chacun.',
    home_hero_body: 'Chaque référence de ce catalogue bénéficie de paliers de quantité — plus vous commandez de caisses, moins vous payez à l\'unité. Parcourez le catalogue complet ci-dessous.',
    home_hero_cta: 'Voir les tarifs en gros',
    home_hero_stat_label: 'de réduction au palier le plus élevé',
    search_placeholder: 'Rechercher des produits...',
    all_categories: 'Toutes les catégories',
    all_sellers: 'Tous les vendeurs',
    loading_products: 'Chargement des produits...',
    no_products_found: 'Aucun produit ne correspond à cette recherche. Essayez un autre terme, une autre catégorie ou un autre vendeur.',
    no_image: 'Pas d\'image',
    per_unit_at_moq: '/ unité à la quantité minimale',
    moq_in_stock: 'MOQ {moq} · {stock} en stock',
    sold_by: 'Vendu par',
    verified_seller: 'Vendeur vérifié',
    view_and_order: 'Voir et commander',
    result_count: '{n} article',
    result_count_plural: '{n} articles',

    loading: 'Chargement...',
    cart_title: 'Votre panier',
    packing_slip: 'Bon de livraison',
    packing_slip_count: 'Bon de livraison — {n} article',
    packing_slip_count_plural: 'Bon de livraison — {n} articles',
    crate_empty: 'Votre panier est vide.',
    browse_catalog_link: 'Parcourir le catalogue',
    remove: 'Retirer',
    moq_label: 'MOQ {moq}',
    proceed_checkout: 'Passer à la caisse',
    final_pricing_note: 'Le tarif final applique les remises par palier lors de la validation.',
    est_total: 'Total estimé : {amount} $',

    checkout_title: 'Paiement',
    must_log_in: 'Vous devez être connecté pour valider la commande.',
    log_in_link: 'Se connecter',
    order_notes: 'Remarques sur la commande (facultatif)',
    place_order: 'Valider la commande',
    payment_terms_label: 'conditions de paiement',
    prepaid_note: 'Compte prépayé — aucune limite de crédit ne s\'applique.',
    credit_summary: 'Limite de crédit {limit} $ · utilisé {used} $ · disponible {available} $',
    server_recalc_note: 'Le serveur recalcule le tarif exact par palier lors de la validation.',
    order_placed: 'Commande n° {id} passée — total {total} $.',

    login_title: 'Connexion au compte',
    login_subtitle: 'Réservé aux acheteurs grossistes approuvés.',
    email_label: 'E-mail',
    password_label: 'Mot de passe',
    log_in_btn: 'Connexion',
    no_account_yet: "Vous n'avez pas de compte ?",
    register_link: 'Créer un compte',
    demo_login_note: 'Démo : buyer@example.com / Buyer123! (après avoir exécuté le script de seed)',

    register_title: 'Ouvrir un compte B2B',
    register_subtitle: 'Les nouveaux comptes sont examinés avant toute commande — nous définirons vos conditions de crédit lors de l\'approbation.',
    company_name_label: "Nom de l'entreprise",
    contact_name_label: 'Nom du contact',
    password_hint_label: 'Mot de passe (8 caractères minimum)',
    register_btn: 'Créer le compte',
    already_have_account: 'Vous avez déjà un compte ?',

    orders_title: 'Historique des commandes',
    please_log_in_orders: 'Veuillez vous connecter pour voir vos commandes.',
    no_orders_yet: 'Aucune commande pour le moment — votre historique est vide.',
    th_order: 'Commande',
    th_date: 'Date',
    th_status: 'Statut',
    th_terms: 'Conditions',
    th_total: 'Total',

    product_all_products_crumb: 'Tous les produits',
    product_no_description: 'Aucune description fournie.',
    product_no_image: 'Aucune image disponible',
    product_base_price: '/ unité (prix de base)',
    product_out_of_stock: 'Rupture de stock',
    product_units_in_stock: '{n} unités en stock',
    product_reviews: '({n} avis)',
    product_since: 'Vendeur depuis {year}',
    product_save_pct: 'économisez {pct}%',
    product_qty_label: 'Quantité (MOQ {moq})',
    product_add_to_cart: 'Ajouter au panier',
    product_added: 'Ajouté au panier.',
    product_bulk_note: 'Vendu en gros aux comptes B2B approuvés. Connectez-vous pour un paiement à terme.',
    product_uncategorized: 'Non classé',
    product_tier_units: '{n}+ unités',
    product_tier_unit_price: '{price} $/unité',
    admin_delete_product: 'Supprimer le produit (Admin)',
    admin_delete_confirm: 'Retirer ce produit du catalogue ? Cette action est irréversible depuis l\'interface.',
    admin_delete_success: 'Produit supprimé.',

    status_pending: 'En attente',
    status_confirmed: 'Confirmée',
    status_shipped: 'Expédiée',
    status_paid: 'Payée',
    status_cancelled: 'Annulée',
    terms_prepaid: 'Prépayé',
    terms_net_15: 'Net 15',
    terms_net_30: 'Net 30',
    terms_net_60: 'Net 60',

    category_apparel: 'Vêtements',
    category_housewares: 'Articles ménagers',
    category_bags: 'Sacs',
    category_electronics: 'Électronique',
    category_tools: 'Outils',
    category_packaging: 'Emballage',
    category_office_supplies: 'Fournitures de bureau',
    category_kitchen: 'Cuisine',
  },

  ar: {
    dir: 'rtl',
    nav_all_products: 'جميع المنتجات',
    nav_my_orders: 'طلباتي',
    nav_log_in: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب',
    nav_log_out: 'تسجيل الخروج',
    nav_search_placeholder: 'البحث في الكتالوج...',
    nav_search_btn: 'بحث',
    tagline: 'متجرك الإلكتروني الموثوق',
    footer: 'بينا — متجرك الإلكتروني الموثوق.',

    home_hero_badge: 'عرض بالجملة',
    home_hero_title: 'تيشيرتات قطنية، 1000+ وحدة، 3.40 دولار للوحدة.',
    home_hero_body: 'كل منتج في هذا الكتالوج يشمل خصم كمية — كل ما زادت الكمية، قل السعر للوحدة. تصفح الكتالوج الكامل أدناه.',
    home_hero_cta: 'عرض أسعار الجملة',
    home_hero_stat_label: 'خصم على سعر الوحدة في أعلى مستوى',
    search_placeholder: 'البحث عن المنتجات...',
    all_categories: 'جميع الفئات',
    all_sellers: 'جميع البائعين',
    loading_products: 'جاري تحميل المنتجات...',
    no_products_found: 'لا توجد منتجات تطابق هذا البحث. جرّب مصطلحًا أو فئة أو بائعًا مختلفًا.',
    no_image: 'لا توجد صورة',
    per_unit_at_moq: '/ للوحدة عند الحد الأدنى للكمية',
    moq_in_stock: 'الحد الأدنى {moq} · {stock} متوفر',
    sold_by: 'يُباع من قِبل',
    verified_seller: 'بائع موثّق',
    view_and_order: 'عرض وطلب',
    result_count: '{n} منتج',
    result_count_plural: '{n} منتجات',

    loading: 'جارٍ التحميل...',
    cart_title: 'سلتك',
    packing_slip: 'إيصال التعبئة',
    packing_slip_count: 'إيصال التعبئة — {n} منتج',
    packing_slip_count_plural: 'إيصال التعبئة — {n} منتجات',
    crate_empty: 'سلتك فارغة.',
    browse_catalog_link: 'تصفح الكتالوج',
    remove: 'إزالة',
    moq_label: 'الحد الأدنى للكمية {moq}',
    proceed_checkout: 'الانتقال للدفع',
    final_pricing_note: 'يُطبّق الخادم خصومات الجملة النهائية عند إتمام الطلب.',
    est_total: 'الإجمالي التقديري: {amount}$',

    checkout_title: 'إتمام الطلب',
    must_log_in: 'يجب تسجيل الدخول لإتمام الطلب.',
    log_in_link: 'تسجيل الدخول',
    order_notes: 'ملاحظات على الطلب (اختياري)',
    place_order: 'تأكيد الطلب',
    payment_terms_label: 'شروط الدفع',
    prepaid_note: 'حساب مدفوع مسبقًا — لا ينطبق حد ائتماني.',
    credit_summary: 'الحد الائتماني {limit}$ · المستخدم {used}$ · المتاح {available}$',
    server_recalc_note: 'يعيد الخادم حساب السعر الدقيق حسب الجملة عند التأكيد.',
    order_placed: 'تم تقديم الطلب رقم {id} — الإجمالي {total}$.',

    login_title: 'تسجيل الدخول إلى الحساب',
    login_subtitle: 'للمشترين بالجملة المعتمدين.',
    email_label: 'البريد الإلكتروني',
    password_label: 'كلمة المرور',
    log_in_btn: 'تسجيل الدخول',
    no_account_yet: 'ليس لديك حساب؟',
    register_link: 'إنشاء حساب',
    demo_login_note: 'تجربة: buyer@example.com / Buyer123! (بعد تشغيل سكريبت البيانات التجريبية)',

    register_title: 'فتح حساب أعمال (B2B)',
    register_subtitle: 'تُراجَع الحسابات الجديدة قبل السماح بالطلب — سيتم تحديد شروط الائتمان عند الموافقة.',
    company_name_label: 'اسم الشركة',
    contact_name_label: 'اسم جهة الاتصال',
    password_hint_label: 'كلمة المرور (8 أحرف على الأقل)',
    register_btn: 'إنشاء الحساب',
    already_have_account: 'هل لديك حساب بالفعل؟',

    orders_title: 'سجل الطلبات',
    please_log_in_orders: 'يرجى تسجيل الدخول لعرض طلباتك.',
    no_orders_yet: 'لا توجد طلبات بعد — سجلك فارغ.',
    th_order: 'الطلب',
    th_date: 'التاريخ',
    th_status: 'الحالة',
    th_terms: 'الشروط',
    th_total: 'الإجمالي',

    product_all_products_crumb: 'جميع المنتجات',
    product_no_description: 'لا يوجد وصف متاح.',
    product_no_image: 'لا توجد صورة متاحة',
    product_base_price: '/ للوحدة (السعر الأساسي)',
    product_out_of_stock: 'غير متوفر',
    product_units_in_stock: '{n} وحدة متوفرة',
    product_reviews: '({n} تقييم)',
    product_since: 'يبيع منذ {year}',
    product_save_pct: 'وفّر {pct}%',
    product_qty_label: 'الكمية (الحد الأدنى {moq})',
    product_add_to_cart: 'أضف إلى السلة',
    product_added: 'تمت الإضافة إلى السلة.',
    product_bulk_note: 'يُباع بالجملة لحسابات الأعمال المعتمدة. سجّل الدخول للدفع بشروط آجلة.',
    product_uncategorized: 'غير مصنّف',
    product_tier_units: '{n}+ وحدة',
    product_tier_unit_price: '{price}$ للوحدة',
    admin_delete_product: 'حذف المنتج (المسؤول)',
    admin_delete_confirm: 'إزالة هذا المنتج من الكتالوج؟ لا يمكن التراجع عن هذا من الواجهة.',
    admin_delete_success: 'تمت إزالة المنتج.',

    status_pending: 'قيد الانتظار',
    status_confirmed: 'مؤكد',
    status_shipped: 'تم الشحن',
    status_paid: 'مدفوع',
    status_cancelled: 'ملغى',
    terms_prepaid: 'مدفوع مسبقًا',
    terms_net_15: 'صافي 15 يومًا',
    terms_net_30: 'صافي 30 يومًا',
    terms_net_60: 'صافي 60 يومًا',

    category_apparel: 'ملابس',
    category_housewares: 'أدوات منزلية',
    category_bags: 'حقائب',
    category_electronics: 'إلكترونيات',
    category_tools: 'أدوات',
    category_packaging: 'تغليف',
    category_office_supplies: 'لوازم مكتبية',
    category_kitchen: 'مطبخ',
  },
};

// Categories are a fixed, known set of English DB values (see CATEGORIES in
// api.js) — translate them via the dictionary above, falling back to the
// raw value for anything unrecognized (e.g. a category added later).
function tCategory(category) {
  if (!category) return category;
  const key = 'category_' + category.toLowerCase().replace(/\s+/g, '_');
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || category;
}

function getLang() {
  return localStorage.getItem('lang') || 'en';
}

function setLang(lang) {
  if (!I18N[lang]) return;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = I18N[lang].dir;
}

// t('key', {placeholder: value}) — looks up the current language, falls
// back to English, then to the key itself if nothing matches.
function t(key, vars) {
  const lang = getLang();
  let str = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

// Pluralization helper: picks '<key>' for n===1, '<key>_plural' otherwise.
function tn(key, n, vars) {
  const k = n === 1 ? key : key + '_plural';
  return t(k, Object.assign({ n }, vars || {}));
}

// Applies translations to any element carrying data-i18n / data-i18n-placeholder
// attributes. Call after rendering nav and after any dynamic re-render of
// static (non-DB) text.
function translatePage() {
  document.documentElement.lang = getLang();
  document.documentElement.dir = I18N[getLang()].dir;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = getLang();
  document.documentElement.dir = I18N[getLang()].dir;
});
