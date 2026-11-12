-- ==============================================================================
-- URMILA'S KITCHEN — SEED DATA
-- 100% Authentic PDF Import (68 items, 9 categories, all prices NULL)
-- ==============================================================================

-- 1. Default Business Settings
INSERT INTO public.business_settings (
    business_name,
    whatsapp_number,
    contact_phone,
    address,
    default_cutoff_time,
    min_advance_days,
    max_advance_days,
    min_order_amount,
    delivery_charge,
    is_ordering_paused,
    pause_banner_message
) VALUES (
    'Urmila''s Kitchen',
    '9204417026',
    '9204417026',
    'Mumbai, Maharashtra',
    '20:00:00',
    1,
    7,
    0.00,
    50.00,
    FALSE,
    NULL
) ON CONFLICT DO NOTHING;

-- 2. Weekly Operating Schedules (Mon - Sun open by default)
INSERT INTO public.business_schedules (day_of_week, is_open, open_time, close_time) VALUES
(0, TRUE, '10:00:00', '22:00:00'), -- Sunday
(1, TRUE, '10:00:00', '22:00:00'), -- Monday
(2, TRUE, '10:00:00', '22:00:00'), -- Tuesday
(3, TRUE, '10:00:00', '22:00:00'), -- Wednesday
(4, TRUE, '10:00:00', '22:00:00'), -- Thursday
(5, TRUE, '10:00:00', '22:00:00'), -- Friday
(6, TRUE, '10:00:00', '22:00:00')  -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- 3. Standard Delivery Slots
INSERT INTO public.delivery_slots (name, slot_type, start_time, end_time, max_capacity, is_active, display_order) VALUES
('Lunch (12:30 PM - 2:00 PM)', 'lunch', '12:30:00', '14:00:00', 25, TRUE, 1),
('Evening (5:00 PM - 7:00 PM)', 'dinner', '17:00:00', '19:00:00', 25, TRUE, 2),
('Dinner (7:30 PM - 9:00 PM)', 'dinner', '19:30:00', '21:00:00', 30, TRUE, 3)
ON CONFLICT DO NOTHING;

-- 4. 9 Categories from PDF
INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Starters', 'starters', 'Crispy, flavourful vegetarian starters and bite-sized appetisers', 1, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Chaats', 'chaats', 'Zesty street-style chaats, bhels and tangy delicacies', 2, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Mains', 'mains', 'Hearty signature curries, platters, noodles and fusion mains', 3, TRUE),
('c1000000-0000-0000-0000-000000000004', 'Mexican Mains', 'mexican-mains', 'Quesadillas, Mexican rice, pocket pizzas and loaded nachos', 4, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Baked Dishes', 'baked-dishes', 'Oven-baked casseroles, gratins, lasagne and savory tarts', 5, TRUE),
('c1000000-0000-0000-0000-000000000006', 'Sandwich Corner', 'sandwich-corner', 'Handcrafted sandwiches, toasts and savoury roll pinwheels', 6, TRUE),
('c1000000-0000-0000-0000-000000000007', 'Fondue Section', 'fondue-section', 'Warm melted fondue pots served with fresh dippers', 7, TRUE),
('c1000000-0000-0000-0000-000000000008', 'Drinks', 'drinks', 'Chilled frappes, refreshingly zesty iced and tulsi mojitos', 8, TRUE),
('c1000000-0000-0000-0000-000000000009', 'Desserts', 'desserts', 'Artisanal Spanish crèmes, cakes, crumbles and warm chocolate fondue', 9, TRUE)
ON CONFLICT (name) DO UPDATE SET display_order = EXCLUDED.display_order;

-- 5. Complete 68 Menu Items (Prices strictly NULL, unpriced by default)
INSERT INTO public.menu_items (category_id, name, price, display_order, is_available) VALUES
-- Category 1: Starters (17 items)
('c1000000-0000-0000-0000-000000000001', 'Corn Bunch', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Cheese Corn Balls', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Garlic Bread', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Hara Bhara Kebab', NULL, 4, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Hara Bhara Paneer Roll', NULL, 5, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Tart with Corn Filling', NULL, 6, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Bruschetta', NULL, 7, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Nachos with Salsa & Cheese Dip', NULL, 8, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Dabeli', NULL, 9, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Vada pav', NULL, 10, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Dabeli bruschetta', NULL, 11, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Pav bhaji fondue', NULL, 12, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Thecha masala pav', NULL, 13, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Mexican Chilli Burger', NULL, 14, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Paneer chilli burger', NULL, 15, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Dahi ke kabab', NULL, 16, TRUE),
('c1000000-0000-0000-0000-000000000001', 'Thatte idli', NULL, 17, TRUE),

-- Category 2: Chaats (9 items)
('c1000000-0000-0000-0000-000000000002', 'Gold Coin Chaat', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Pineapple Bhel', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Tiranga Bhel', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Hara Bhara Bird’s Nest Chaat', NULL, 4, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Mexican Khakhra Chaat', NULL, 5, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Tamatar Chaat', NULL, 6, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Chinese Bhel', NULL, 7, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Batata Chaat', NULL, 8, TRUE),
('c1000000-0000-0000-0000-000000000002', 'Matar Chaat', NULL, 9, TRUE),

-- Category 3: Mains (14 items)
('c1000000-0000-0000-0000-000000000003', 'Spanish Rice with Tandoori Sauce', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Paneer Begum Bahar', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Paneer Tikka Roll', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Veg Frankie', NULL, 4, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Pav Bhaji', NULL, 5, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Paneer Fried Noodles', NULL, 6, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Chili Garlic Paneer Burger', NULL, 7, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Chola kulcha platter', NULL, 8, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Pan fried noodles', NULL, 9, TRUE),
('c1000000-0000-0000-0000-000000000003', 'French Casserole', NULL, 10, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Stacked Enchiladas', NULL, 11, TRUE),
('c1000000-0000-0000-0000-000000000003', 'American Chop Suey', NULL, 12, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Chinese Rice with Fried Noodles', NULL, 13, TRUE),
('c1000000-0000-0000-0000-000000000003', 'Muglai paratha with Lehsun chutney', NULL, 14, TRUE),

-- Category 4: Mexican Mains (4 items)
('c1000000-0000-0000-0000-000000000004', 'Mexican Rice', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000004', 'Quesadillas', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000004', 'Pocket Pizza', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000004', 'Nachos with Salsa & Cheese Dip (Mexican)', NULL, 4, TRUE),

-- Category 5: Baked Dishes (8 items)
('c1000000-0000-0000-0000-000000000005', 'Baked Begum Bahar', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Vegetable Gratin', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Tri-Colour Baking Delight', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Baked Florentine', NULL, 4, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Lasagne Verdi', NULL, 5, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Baked Spanish Rice with Tomato Sauce', NULL, 6, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Tart with Corn Filling & Cheese Sauce', NULL, 7, TRUE),
('c1000000-0000-0000-0000-000000000005', 'Moussaka', NULL, 8, TRUE),

-- Category 6: Sandwich Corner (4 items)
('c1000000-0000-0000-0000-000000000006', 'Russian Sandwich', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000006', 'Corn Toast', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000006', 'Pinwheel Sandwich', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000006', 'Creamy Spanish Sandwich', NULL, 4, TRUE),

-- Category 7: Fondue Section (3 items)
('c1000000-0000-0000-0000-000000000007', 'Pav bhaji fondue (Platter)', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000007', 'Mexican fondue', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000007', 'Cheese fondue', NULL, 3, TRUE),

-- Category 8: Drinks (3 items)
('c1000000-0000-0000-0000-000000000008', 'Frappe', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000008', 'Iced Mojito', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000008', 'Tulsi Mojito', NULL, 3, TRUE),

-- Category 9: Desserts (6 items)
('c1000000-0000-0000-0000-000000000009', 'Butterscotch Spanish Crème', NULL, 1, TRUE),
('c1000000-0000-0000-0000-000000000009', 'Chocolate Spanish Crème', NULL, 2, TRUE),
('c1000000-0000-0000-0000-000000000009', 'Mango Spanish Crème', NULL, 3, TRUE),
('c1000000-0000-0000-0000-000000000009', 'Chocolate Monte Carlo', NULL, 4, TRUE),
('c1000000-0000-0000-0000-000000000009', 'Apple Crumble', NULL, 5, TRUE),
('c1000000-0000-0000-0000-000000000009', 'Chocolate fondue', NULL, 6, TRUE)
ON CONFLICT DO NOTHING;

