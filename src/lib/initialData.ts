import { Category, MenuItem, DeliverySlot, BusinessSettings, BusinessSchedule, CustomerReview, GalleryImage } from '../types/database.types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Starters', slug: 'starters', description: 'Crispy, flavourful vegetarian starters and bite-sized appetisers', display_order: 1, is_active: true },
  { id: 'cat-2', name: 'Chaats', slug: 'chaats', description: 'Zesty street-style chaats, bhels and tangy delicacies', display_order: 2, is_active: true },
  { id: 'cat-3', name: 'Mains', slug: 'mains', description: 'Hearty signature curries, platters, noodles and fusion mains', display_order: 3, is_active: true },
  { id: 'cat-4', name: 'Mexican Mains', slug: 'mexican-mains', description: 'Quesadillas, Mexican rice, pocket pizzas and loaded nachos', display_order: 4, is_active: true },
  { id: 'cat-5', name: 'Baked Dishes', slug: 'baked-dishes', description: 'Oven-baked casseroles, gratins, lasagne and savory tarts', display_order: 5, is_active: true },
  { id: 'cat-6', name: 'Sandwich Corner', slug: 'sandwich-corner', description: 'Handcrafted sandwiches, toasts and savoury roll pinwheels', display_order: 6, is_active: true },
  { id: 'cat-7', name: 'Fondue Section', slug: 'fondue-section', description: 'Warm melted fondue pots served with fresh dippers', display_order: 7, is_active: true },
  { id: 'cat-8', name: 'Drinks', slug: 'drinks', description: 'Chilled frappes, refreshingly zesty iced and tulsi mojitos', display_order: 8, is_active: true },
  { id: 'cat-9', name: 'Desserts', slug: 'desserts', description: 'Artisanal Spanish crèmes, cakes, crumbles and warm chocolate fondue', display_order: 9, is_active: true },
];

// All 68 menu items strictly preserved from the 7-page PDF
// All prices initialized as NULL as required by the product rules
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- STARTERS (17 items) ---
  { id: 'item-1', category_id: 'cat-1', name: 'Corn Bunch', description: 'Crispy seasoned sweet corn clusters fried to golden perfection.', price: null, image_url: '/images/menu/starters/corn-bunch.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 1 },
  { id: 'item-2', category_id: 'cat-1', name: 'Cheese Corn Balls', description: 'Crispy on the outside, molten melted cheese and sweet corn inside.', price: null, image_url: '/images/menu/starters/cheese-corn-balls.webp', is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '15+ pieces', display_order: 2 },
  { id: 'item-3', category_id: 'cat-1', name: 'Garlic Bread', description: 'Toasted artisanal baguette brushed with fresh garlic butter and fragrant herbs.', price: null, image_url: '/images/menu/starters/garlic-bread.webp', is_available: true, is_bestseller: true, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 3 },
  { id: 'item-4', category_id: 'cat-1', name: 'Hara Bhara Kebab', description: 'Nutritious patties made with spinach, green peas and aromatic spices.', price: null, image_url: '/images/menu/starters/hara-bhara-kebab.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '15+ pieces', display_order: 4 },
  { id: 'item-5', category_id: 'cat-1', name: 'Hara Bhara Paneer Roll', description: 'Spiced spinach and paneer filling wrapped in a delicate crisp coating.', price: null, image_url: '/images/menu/starters/hara-bhara-paneer-roll.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 5 },
  { id: 'item-6', category_id: 'cat-1', name: 'Tart with Corn Filling', description: 'Savoury shortcrust pastry tartlet filled with creamy seasoned corn.', price: null, image_url: '/images/menu/starters/tart-with-corn-filling.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '12+ pieces', display_order: 6 },
  { id: 'item-7', category_id: 'cat-1', name: 'Bruschetta', description: 'Toasted bread topped with ripe diced tomatoes, fresh basil and extra virgin olive oil.', price: null, image_url: '/images/menu/starters/bruschetta.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '12+ pieces', display_order: 7 },
  { id: 'item-8', category_id: 'cat-1', name: 'Nachos with Salsa & Cheese Dip', description: 'Crunchy tortilla chips served alongside fresh tomato salsa and warm cheese dip.', price: null, image_url: '/images/menu/starters/nachos-with-salsa-cheese-dip.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Large platter', display_order: 8 },
  { id: 'item-9', category_id: 'cat-1', name: 'Dabeli', description: 'Spiced potato filling with tamarind chutney, roasted peanuts and sev in a soft pav.', price: null, image_url: '/images/menu/starters/dabeli.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ pieces', display_order: 9 },
  { id: 'item-10', category_id: 'cat-1', name: 'Vada pav', description: 'Classic Mumbai street icon: spiced batata vada inside pav with garlic peanut chutney.', price: null, image_url: '/images/menu/starters/vada-pav.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ pieces', display_order: 10 },
  { id: 'item-11', category_id: 'cat-1', name: 'Dabeli bruschetta', description: 'Fusion appetiser combining Kutchi dabeli masala flavours on toasted Italian crusts.', price: null, image_url: '/images/menu/starters/dabeli-bruschetta.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '12+ pieces', display_order: 11 },
  { id: 'item-12', category_id: 'cat-1', name: 'Pav bhaji fondue', description: 'Silky spiced pav bhaji served fondue-style with bite-sized buttered pav cubes.', price: null, image_url: '/images/menu/starters/pav-bhaji-fondue.webp', is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party pot (6-8 guests)', display_order: 12 },
  { id: 'item-13', category_id: 'cat-1', name: 'Thecha masala pav', description: 'Soft pav pan-toasted with fiery Kolhapuri green chilli-garlic thecha and butter.', price: null, image_url: '/images/menu/starters/thecha-masala-pav.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true, is_spicy: true }, min_party_qty: '10+ pieces', display_order: 13 },
  { id: 'item-14', category_id: 'cat-1', name: 'Mexican Chilli Burger', description: 'Handcrafted bean and veggie patty seasoned with Mexican spices and spicy salsa.', price: null, image_url: '/images/menu/starters/mexican-chilli-burger.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true, is_spicy: true }, min_party_qty: '8+ burgers', display_order: 14 },
  { id: 'item-15', category_id: 'cat-1', name: 'Paneer chilli burger', description: 'Marinated paneer patty with crisp Asian coleslaw and tangy chilli-soy dressing.', price: null, image_url: '/images/menu/starters/paneer-chilli-burger.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '8+ burgers', display_order: 15 },
  { id: 'item-16', category_id: 'cat-1', name: 'Dahi ke kabab', description: 'Melt-in-mouth kebabs made with hung curd, mild spices and a crisp crust.', price: null, image_url: '/images/menu/starters/dahi-ke-kabab.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '12+ pieces', display_order: 16 },
  { id: 'item-17', category_id: 'cat-1', name: 'Thatte idli', description: 'Traditional large flat steamed rice cakes, exceptionally soft, served with chutney.', price: null, image_url: '/images/menu/starters/thatte-idli.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ pieces', display_order: 17 },

  // --- CHAATS (9 items) ---
  { id: 'item-18', category_id: 'cat-2', name: 'Gold Coin Chaat', description: 'Crisp golden coin discs topped with spicy potatoes, chutneys and nylon sev.', price: null, image_url: '/images/menu/chaats/gold-coin-chaat.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '15+ portions', display_order: 1 },
  { id: 'item-19', category_id: 'cat-2', name: 'Pineapple Bhel', description: 'Tangy puffed rice bhel tossed with juicy fresh pineapple chunks and zesty dressings.', price: null, image_url: '/images/menu/chaats/pineapple-bhel.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 2 },
  { id: 'item-20', category_id: 'cat-2', name: 'Tiranga Bhel', description: 'Vibrant three-tier bhel celebrating tri-colour chutneys, greens and sev.', price: null, image_url: '/images/menu/chaats/tiranga-bhel.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 3 },
  { id: 'item-21', category_id: 'cat-2', name: 'Hara Bhara Bird’s Nest Chaat', description: 'Intricate edible potato-herb bird’s nests cradling spiced sprouts and chutneys.', price: null, image_url: '/images/menu/chaats/hara-bhara-bird-s-nest-chaat.webp', is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '12+ pieces', display_order: 4 },
  { id: 'item-22', category_id: 'cat-2', name: 'Mexican Khakhra Chaat', description: 'Crunchy traditional khakhra crisps loaded with Mexican salsa, sweet corn and cheese.', price: null, image_url: '/images/menu/chaats/mexican-khakhra-chaat.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 5 },
  { id: 'item-23', category_id: 'cat-2', name: 'Tamatar Chaat', description: 'Banarasi-style spiced crushed tomato delicacy garnished with roasted cumin and cashews.', price: null, image_url: '/images/menu/chaats/tamatar-chaat.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 6 },
  { id: 'item-24', category_id: 'cat-2', name: 'Chinese Bhel', description: 'Crispy fried noodles tossed with shredded cabbage, capsicum and tangy schezwan sauce.', price: null, image_url: '/images/menu/chaats/chinese-bhel.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 7 },
  { id: 'item-25', category_id: 'cat-2', name: 'Batata Chaat', description: 'Roasted and tossed spiced baby potatoes with mint chutney and fresh pomegranate.', price: null, image_url: '/images/menu/chaats/batata-chaat.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 8 },
  { id: 'item-26', category_id: 'cat-2', name: 'Matar Chaat', description: 'Slow-cooked white peas simmered in aromatic spices, topped with onions and lemon.', price: null, image_url: '/images/menu/chaats/matar-chaat.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 9 },

  // --- MAINS (14 items) ---
  { id: 'item-27', category_id: 'cat-3', name: 'Spanish Rice with Tandoori Sauce', description: 'Fragrant seasoned Spanish-style rice paired with smoky tandoori sauce.', price: null, image_url: '/images/menu/mains/spanish-rice-with-tandoori-sauce.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Large tray', display_order: 1 },
  { id: 'item-28', category_id: 'cat-3', name: 'Paneer Begum Bahar', description: 'Royal culinary main dish: delicate stuffed paneer rolls simmered in rich gravy.', price: null, image_url: '/images/menu/mains/paneer-begum-bahar.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Medium handi', display_order: 2 },
  { id: 'item-29', category_id: 'cat-3', name: 'Paneer Tikka Roll', description: 'Succulent marinated grilled paneer cubes, crisp salad and signature sauce wrapped in a warm paratha.', price: null, image_url: '/images/menu/mains/paneer-tikka-roll.webp', is_available: true, is_bestseller: true, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '8+ rolls', display_order: 3 },
  { id: 'item-30', category_id: 'cat-3', name: 'Veg Frankie', description: 'Classic spiced vegetable patty roll with tangy masala vinegar and sliced red onions.', price: null, image_url: '/images/menu/mains/veg-frankie.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ rolls', display_order: 4 },
  { id: 'item-31', category_id: 'cat-3', name: 'Pav Bhaji', description: 'Rich, buttery mashed mixed vegetable bhaji served with golden toasted pav.', price: null, image_url: '/images/menu/mains/pav-bhaji.webp', is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 5 },
  { id: 'item-32', category_id: 'cat-3', name: 'Paneer Fried Noodles', description: 'Wok-tossed noodles with soft paneer cubes, colourful bell peppers and soy seasonings.', price: null, image_url: '/images/menu/mains/paneer-fried-noodles.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Medium platter', display_order: 6 },
  { id: 'item-33', category_id: 'cat-3', name: 'Chili Garlic Paneer Burger', description: 'Toasted bun layered with chilli-garlic glazed paneer, lettuce and herb mayo.', price: null, image_url: '/images/menu/mains/chili-garlic-paneer-burger.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '8+ burgers', display_order: 7 },
  { id: 'item-34', category_id: 'cat-3', name: 'Chola kulcha platter', description: 'Tangy Punjabi-style chole served with fluffy buttered kulchas and pickled onions.', price: null, image_url: '/images/menu/mains/chola-kulcha-platter.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ platters', display_order: 8 },
  { id: 'item-35', category_id: 'cat-3', name: 'Pan fried noodles', description: 'Crisp-bottom pan-fried noodles blanketed with savoury Asian vegetables in gravy.', price: null, image_url: '/images/menu/mains/pan-fried-noodles.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Medium platter', display_order: 9 },
  { id: 'item-36', category_id: 'cat-3', name: 'French Casserole', description: 'Classic baked casserole with layered tender vegetables, herbs and golden crust.', price: null, image_url: '/images/menu/mains/french-casserole.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 10 },
  { id: 'item-37', category_id: 'cat-3', name: 'Stacked Enchiladas', description: 'Tortillas layered with seasoned beans, cheese and rich Mexican red enchilada sauce.', price: null, image_url: '/images/menu/mains/stacked-enchiladas.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Large baking dish', display_order: 11 },
  { id: 'item-38', category_id: 'cat-3', name: 'American Chop Suey', description: 'Crispy fried noodles topped with sweet and sour sautéed vegetables and pineapple.', price: null, image_url: '/images/menu/mains/american-chop-suey.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Medium platter', display_order: 12 },
  { id: 'item-39', category_id: 'cat-3', name: 'Chinese Rice with Fried Noodles', description: 'Fragrant wok-tossed fried rice garnished with crunchy noodles and spring onions.', price: null, image_url: '/images/menu/mains/chinese-rice-with-fried-noodles.webp', is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Medium platter', display_order: 13 },
  { id: 'item-40', category_id: 'cat-3', name: 'Muglai paratha with Lehsun chutney', description: 'Flaky layered stuffed Mughlai paratha served with signature spicy garlic chutney.', price: null, image_url: '/images/menu/mains/muglai-paratha-with-lehsun-chutney.webp', is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true, is_spicy: true }, min_party_qty: '8+ portions', display_order: 14 },

  // --- MEXICAN MAINS (4 items) ---
  { id: 'item-41', category_id: 'cat-4', name: 'Mexican Rice', description: 'Authentic tomato and herb seasoned rice cooked with sweet corn and bell peppers.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Medium tray', display_order: 1 },
  { id: 'item-42', category_id: 'cat-4', name: 'Quesadillas', description: 'Toasted flour tortillas filled with melted cheese, refried beans and jalapeños.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ portions', display_order: 2 },
  { id: 'item-43', category_id: 'cat-4', name: 'Pocket Pizza', description: 'Folded golden calzone pockets stuffed with rich marinara sauce and melted cheese.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '12+ pieces', display_order: 3 },
  { id: 'item-44', category_id: 'cat-4', name: 'Nachos with Salsa & Cheese Dip', description: 'Generous platter of stoneground tortilla chips with warm cheese sauce and homemade salsa.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party platter', display_order: 4 },

  // --- BAKED DISHES (8 items) ---
  { id: 'item-45', category_id: 'cat-5', name: 'Baked Begum Bahar', description: 'Baked royal preparation featuring stuffed paneer layered in velvety rich gravy.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 1 },
  { id: 'item-46', category_id: 'cat-5', name: 'Vegetable Gratin', description: 'Tender garden vegetables baked in a creamy béchamel sauce with a golden crust.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 2 },
  { id: 'item-47', category_id: 'cat-5', name: 'Tri-Colour Baking Delight', description: 'Eye-catching three-layer savoury bake celebrating herbal, cheese and tomato layers.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 3 },
  { id: 'item-48', category_id: 'cat-5', name: 'Baked Florentine', description: 'Spinach and creamy cheese baked casserole finished with melted Italian cheese.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 4 },
  { id: 'item-49', category_id: 'cat-5', name: 'Lasagne Verdi', description: 'Classic green spinach pasta sheets layered with Italian ragu, béchamel and cheese.', price: null, image_url: null, is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Large lasagne tray', display_order: 5 },
  { id: 'item-50', category_id: 'cat-5', name: 'Baked Spanish Rice with Tomato Sauce', description: 'Seasoned rice slow-baked under a bubbling crust of rich tomato and cheese.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 6 },
  { id: 'item-51', category_id: 'cat-5', name: 'Tart with Corn Filling & Cheese Sauce', description: 'Flaky baked tart generously filled with sweet corn and smothered in warm cheese sauce.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '12+ tarts', display_order: 7 },
  { id: 'item-52', category_id: 'cat-5', name: 'Moussaka', description: 'Mediterranean baked layered eggplant and spiced potato bake with savoury topping.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 8 },

  // --- SANDWICH CORNER (4 items) ---
  { id: 'item-53', category_id: 'cat-6', name: 'Russian Sandwich', description: 'Delicate crustless sandwich filled with Russian vegetable salad in mild dressing.', price: null, image_url: null, is_available: true, is_bestseller: true, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ sandwiches', display_order: 1 },
  { id: 'item-54', category_id: 'cat-6', name: 'Corn Toast', description: 'Toasted crisp bread topped with seasoned cream corn and melted cheddar.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '10+ pieces', display_order: 2 },
  { id: 'item-55', category_id: 'cat-6', name: 'Pinwheel Sandwich', description: 'Decorative rolled finger sandwiches with multi-coloured layered fillings.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '20+ pinwheels', display_order: 3 },
  { id: 'item-56', category_id: 'cat-6', name: 'Creamy Spanish Sandwich', description: 'Artisanal grilled sandwich packed with roasted bell peppers, olives and cheese.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: '8+ sandwiches', display_order: 4 },

  // --- FONDUE SECTION (3 items) ---
  { id: 'item-57', category_id: 'cat-7', name: 'Pav bhaji fondue', description: 'Signature Urmila’s Kitchen fondue: molten spiced pav bhaji served with croutons.', price: null, image_url: '/images/menu/fondue/pav-bhaji-fondue-platter.webp', is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party fondue pot', display_order: 1 },
  { id: 'item-58', category_id: 'cat-7', name: 'Mexican fondue', description: 'Zesty spiced cheese fondue infused with salsa and jalapeños, served with tortilla crisps.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party fondue pot', display_order: 2 },
  { id: 'item-59', category_id: 'cat-7', name: 'Cheese fondue', description: 'Classic velvety European melted cheese fondue served with assorted vegetable dippers.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party fondue pot', display_order: 3 },

  // --- DRINKS (3 items) ---
  { id: 'item-60', category_id: 'cat-8', name: 'Frappe', description: 'Velvety chilled blended coffee frappe topped with whipped foam.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Bottled pack', display_order: 1 },
  { id: 'item-61', category_id: 'cat-8', name: 'Iced Mojito', description: 'Refreshing sparkling cooler muddled with fresh mint, lime juice and pure cane sugar.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Bottled pack', display_order: 2 },
  { id: 'item-62', category_id: 'cat-8', name: 'Tulsi Mojito', description: 'Digestive fusion cooler with aromatic holy basil leaves, crushed lemon and mint.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: false, dietary_flags: { is_veg: true }, min_party_qty: 'Bottled pack', display_order: 3 },

  // --- DESSERTS (6 items) ---
  { id: 'item-63', category_id: 'cat-9', name: 'Butterscotch Spanish Crème', description: 'Rich caramelized butterscotch custard with delicate crunchy praline.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ cups', display_order: 1 },
  { id: 'item-64', category_id: 'cat-9', name: 'Chocolate Spanish Crème', description: 'Decadent dark chocolate silky crème with rich European cocoa notes.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ cups', display_order: 2 },
  { id: 'item-65', category_id: 'cat-9', name: 'Mango Spanish Crème', description: 'Silky Alphonso mango crème celebrating tropical sweetness and velvety cream.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: '10+ cups', display_order: 3 },
  { id: 'item-66', category_id: 'cat-9', name: 'Chocolate Monte Carlo', description: 'Layered dessert of chocolate biscuit cake, light cream and chocolate ganache.', price: null, image_url: null, is_available: true, is_bestseller: true, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party slab', display_order: 4 },
  { id: 'item-67', category_id: 'cat-9', name: 'Apple Crumble', description: 'Tender spiced cinnamon apples baked beneath a golden buttery oat crumble.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Baking tray', display_order: 5 },
  { id: 'item-68', category_id: 'cat-9', name: 'Chocolate fondue', description: 'Warm melted Belgian chocolate fondue served with cake cubes and fresh fruit dippers.', price: null, image_url: null, is_available: true, is_bestseller: false, is_party_special: true, dietary_flags: { is_veg: true }, min_party_qty: 'Party fondue pot', display_order: 6 },
];

export const INITIAL_DELIVERY_SLOTS: DeliverySlot[] = [
  { id: 'slot-1', name: 'Lunch (12:30 PM - 2:00 PM)', slot_type: 'lunch', start_time: '12:30:00', end_time: '14:00:00', max_capacity: 25, is_active: true, display_order: 1 },
  { id: 'slot-2', name: 'Evening (5:00 PM - 7:00 PM)', slot_type: 'dinner', start_time: '17:00:00', end_time: '19:00:00', max_capacity: 25, is_active: true, display_order: 2 },
  { id: 'slot-3', name: 'Dinner (7:30 PM - 9:00 PM)', slot_type: 'dinner', start_time: '19:30:00', end_time: '21:00:00', max_capacity: 30, is_active: true, display_order: 3 },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  id: 'settings-1',
  business_name: "Urmila's Kitchen",
  whatsapp_number: '9204417026',
  contact_phone: '9204417026',
  address: 'Main Kitchen, Bandra West, Mumbai, Maharashtra',
  default_cutoff_time: '20:00:00', // 8:00 PM IST
  min_advance_days: 1, // Next-day pre-order
  max_advance_days: 7,
  min_order_amount: 0.00,
  delivery_charge: 0.00,
  is_ordering_paused: false,
  pause_banner_message: null,
  serving_pin_codes: ['400001', '400002', '400003', '400004', '400005', '400050', '400051', '400052', '400053'],
  fulfillment_mode: 'pickup_only',
  is_delivery_enabled: false,
  is_pickup_enabled: true,
  pickup_instructions: 'Please show your Order Reference or WhatsApp confirmation at the kitchen counter for instant handoff.',
  pickup_maps_url: 'https://maps.google.com/?q=Bandra+West+Mumbai',
};

export const INITIAL_SCHEDULES: BusinessSchedule[] = [
  { id: 'sch-0', day_of_week: 0, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Sun
  { id: 'sch-1', day_of_week: 1, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Mon
  { id: 'sch-2', day_of_week: 2, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Tue
  { id: 'sch-3', day_of_week: 3, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Wed
  { id: 'sch-4', day_of_week: 4, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Thu
  { id: 'sch-5', day_of_week: 5, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Fri
  { id: 'sch-6', day_of_week: 6, is_open: true, open_time: '10:00:00', close_time: '22:00:00' }, // Sat
];

// Zero fabricated reviews. Real reviews will be populated via customer submissions or owner entry.
export const INITIAL_REVIEWS: CustomerReview[] = [];

// Curated Initial Kitchen Gallery Images (Shared between Customer Website & Owner Dashboard)
export const INITIAL_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'gallery-4',
    title: 'Oven Baked Specialties',
    category: 'Baked Dishes',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    caption: 'Slow-baked casseroles and gratins topped with bubbling crusts',
    is_featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gallery-6',
    title: 'Handcrafted Desserts & Crème',
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    caption: 'Velvety artisanal Spanish crèmes and caramelised confections',
    is_featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
  },
];


