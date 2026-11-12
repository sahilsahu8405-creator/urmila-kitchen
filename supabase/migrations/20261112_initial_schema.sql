-- ==============================================================================
-- URMILA'S KITCHEN — PRODUCTION DATABASE SCHEMA & SECURITY POLICIES
-- Cloud Kitchen Next-Day Pre-Order Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. OWNER PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.owner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Urmila Owner',
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. BUSINESS SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL DEFAULT 'Urmila''s Kitchen',
    whatsapp_number TEXT NOT NULL DEFAULT '9204417026',
    contact_phone TEXT NOT NULL DEFAULT '9204417026',
    address TEXT NOT NULL DEFAULT 'Main Kitchen, Mumbai, Maharashtra',
    default_cutoff_time TIME NOT NULL DEFAULT '20:00:00', -- 8:00 PM IST
    min_advance_days INT NOT NULL DEFAULT 1, -- Next-day pre-order
    max_advance_days INT NOT NULL DEFAULT 7, -- Book up to 7 days ahead
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    is_ordering_paused BOOLEAN NOT NULL DEFAULT FALSE,
    pause_banner_message TEXT DEFAULT 'We are currently preparing kitchen operations. Ordering will resume shortly.',
    serving_pin_codes JSONB NOT NULL DEFAULT '["400001", "400002", "400003", "400004", "400005"]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. BUSINESS SCHEDULES (Weekly Operating Days)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon, ..., 6=Sat
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    open_time TIME NOT NULL DEFAULT '10:00:00',
    close_time TIME NOT NULL DEFAULT '22:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_day_of_week UNIQUE (day_of_week)
);

-- ------------------------------------------------------------------------------
-- 4. BUSINESS CLOSURES & SPECIAL OPENINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    closure_type TEXT NOT NULL CHECK (closure_type IN ('single_closure', 'holiday_range', 'special_opening')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_open_override BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE overrides weekly closure (e.g. Open on Diwali Monday)
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- ------------------------------------------------------------------------------
-- 5. MENU CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. MENU ITEMS (Authentic PDF Import, All Prices NULL Initially)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) DEFAULT NULL, -- NULL = UNSET / NOT ORDERABLE
    image_url TEXT DEFAULT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    is_party_special BOOLEAN NOT NULL DEFAULT FALSE,
    dietary_flags JSONB DEFAULT '{"is_veg": true}'::jsonb,
    min_party_qty TEXT DEFAULT 'For 10+ guests',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_dish_per_category UNIQUE (category_id, name)
);

-- ------------------------------------------------------------------------------
-- 7. DELIVERY SLOTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. 'Lunch (12:30 PM - 2:00 PM)'
    slot_type TEXT NOT NULL CHECK (slot_type IN ('lunch', 'dinner', 'all_day')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. ORDERS & ORDER ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT UNIQUE NOT NULL, -- e.g. 'UK-20261113-0001'
    lookup_token UUID NOT NULL DEFAULT uuid_generate_v4(), -- Secure token for customer confirmation
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT NOT NULL,
    locality TEXT,
    pin_code TEXT,
    landmark TEXT,
    delivery_instructions TEXT,
    delivery_date DATE NOT NULL,
    delivery_slot_id UUID NOT NULL REFERENCES public.delivery_slots(id),
    delivery_type TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
    order_notes TEXT,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    order_status TEXT NOT NULL DEFAULT 'pending_whatsapp' CHECK (
        order_status IN (
            'pending_whatsapp',
            'awaiting_confirmation',
            'confirmed',
            'preparing',
            'ready',
            'out_for_delivery',
            'delivered',
            'cancelled'
        )
    ),
    whatsapp_opened BOOLEAN NOT NULL DEFAULT FALSE,
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
    item_name TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal_price NUMERIC(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'system',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. PARTY & BULK ORDER ENQUIRIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.party_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_reference TEXT UNIQUE NOT NULL, -- e.g. 'PE-20261113-0001'
    lookup_token UUID NOT NULL DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    required_time TIME NOT NULL,
    guest_count INT NOT NULL CHECK (guest_count >= 5),
    food_preferences TEXT,
    requested_dishes JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_dishes TEXT,
    approximate_budget NUMERIC(10,2),
    delivery_location TEXT NOT NULL,
    special_requirements TEXT,
    quoted_amount NUMERIC(10,2) DEFAULT NULL,
    advance_paid NUMERIC(10,2) DEFAULT NULL,
    advance_payment_reference TEXT DEFAULT NULL,
    internal_notes TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'new_enquiry' CHECK (
        status IN (
            'new_enquiry',
            'contacted',
            'quotation_sent',
            'awaiting_confirmation',
            'confirmed',
            'preparing',
            'completed',
            'cancelled'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. GALLERY IMAGES & CUSTOMER REVIEWS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Dishes',
    image_url TEXT NOT NULL,
    caption TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    dish_highlight TEXT,
    event_type TEXT,
    image_url TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR HIGH-TRAFFIC & FAST LOOKUPS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_slot ON public.orders(delivery_slot_id);
CREATE INDEX IF NOT EXISTS idx_party_enquiries_date ON public.party_enquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_party_enquiries_status ON public.party_enquiries(status);

-- ------------------------------------------------------------------------------
-- 12. HELPER SEQUENCES & FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS order_ref_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS enquiry_ref_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_order_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    today_str TEXT;
    seq_val INT;
BEGIN
    today_str := to_char(timezone('Asia/Kolkata', now()), 'YYYYMMDD');
    seq_val := nextval('order_ref_seq');
    RETURN 'UK-' || today_str || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_enquiry_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    today_str TEXT;
    seq_val INT;
BEGIN
    today_str := to_char(timezone('Asia/Kolkata', now()), 'YYYYMMDD');
    seq_val := nextval('enquiry_ref_seq');
    RETURN 'PE-' || today_str || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

-- ------------------------------------------------------------------------------
-- 13. TRANSACTIONAL ORDER CREATION RPC (ZERO-TRUST SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_customer_order(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
    p_delivery_address TEXT,
    p_locality TEXT,
    p_pin_code TEXT,
    p_landmark TEXT,
    p_delivery_instructions TEXT,
    p_delivery_date DATE,
    p_delivery_slot_id UUID,
    p_delivery_type TEXT,
    p_order_notes TEXT,
    p_items JSONB -- [{ "menu_item_id": "...", "quantity": 2, "special_instructions": "..." }]
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_settings public.business_settings%ROWTYPE;
    v_slot public.delivery_slots%ROWTYPE;
    v_now_ist TIMESTAMP;
    v_today_ist DATE;
    v_cutoff_time TIME;
    v_day_of_week INT;
    v_is_day_open BOOLEAN;
    v_is_special_open BOOLEAN;
    v_is_closed_range BOOLEAN;
    v_existing_orders_count INT;
    v_order_id UUID;
    v_order_ref TEXT;
    v_lookup_token UUID;
    v_subtotal NUMERIC(10,2) := 0.00;
    v_delivery_fee NUMERIC(10,2) := 0.00;
    v_total_amount NUMERIC(10,2) := 0.00;
    v_item RECORD;
    v_db_item public.menu_items%ROWTYPE;
    v_item_subtotal NUMERIC(10,2);
    v_items_snapshot JSONB := '[]'::jsonb;
BEGIN
    -- 1. Fetch business settings
    SELECT * INTO v_settings FROM public.business_settings LIMIT 1;
    IF v_settings.is_ordering_paused THEN
        RAISE EXCEPTION 'Kitchen is currently not accepting new orders: %', COALESCE(v_settings.pause_banner_message, 'Please check back later.');
    END IF;

    -- 2. Timezone calculations (Asia/Kolkata)
    v_now_ist := timezone('Asia/Kolkata', now());
    v_today_ist := v_now_ist::date;

    -- Delivery date must be in the future (minimum advance days)
    IF p_delivery_date < (v_today_ist + v_settings.min_advance_days * INTERVAL '1 day')::date THEN
        RAISE EXCEPTION 'Delivery date must be at least % day(s) in advance. Earliest delivery date is %.',
            v_settings.min_advance_days, (v_today_ist + v_settings.min_advance_days * INTERVAL '1 day')::date;
    END IF;

    IF p_delivery_date > (v_today_ist + v_settings.max_advance_days * INTERVAL '1 day')::date THEN
        RAISE EXCEPTION 'Pre-orders are only accepted up to % days in advance.', v_settings.max_advance_days;
    END IF;

    -- 3. Cutoff time validation for next-day delivery
    v_cutoff_time := COALESCE(v_settings.default_cutoff_time, '20:00:00'::time);
    IF p_delivery_date = (v_today_ist + INTERVAL '1 day')::date THEN
        IF v_now_ist::time > v_cutoff_time THEN
            RAISE EXCEPTION 'Daily cutoff time (% IST) for tomorrow''s delivery has passed.', to_char(v_cutoff_time, 'HH12:MI AM');
        END IF;
    END IF;

    -- 4. Calendar & Holiday Validation
    -- Check special opening override first
    SELECT EXISTS (
        SELECT 1 FROM public.business_closures
        WHERE closure_type = 'special_opening'
          AND is_open_override = TRUE
          AND p_delivery_date BETWEEN start_date AND end_date
    ) INTO v_is_special_open;

    IF NOT v_is_special_open THEN
        -- Check closure / holiday ranges
        SELECT EXISTS (
            SELECT 1 FROM public.business_closures
            WHERE closure_type IN ('single_closure', 'holiday_range')
              AND p_delivery_date BETWEEN start_date AND end_date
        ) INTO v_is_closed_range;

        IF v_is_closed_range THEN
            RAISE EXCEPTION 'Kitchen is closed on % for scheduled maintenance or holiday.', p_delivery_date;
        END IF;

        -- Check weekly schedule
        v_day_of_week := EXTRACT(DOW FROM p_delivery_date);
        SELECT is_open INTO v_is_day_open FROM public.business_schedules WHERE day_of_week = v_day_of_week;
        IF v_is_day_open IS FALSE THEN
            RAISE EXCEPTION 'Kitchen is not open for delivery on this day of the week.';
        END IF;
    END IF;

    -- 5. Delivery Slot Validation & Capacity
    SELECT * INTO v_slot FROM public.delivery_slots WHERE id = p_delivery_slot_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected delivery slot is invalid or inactive.';
    END IF;

    SELECT COUNT(*) INTO v_existing_orders_count
    FROM public.orders
    WHERE delivery_date = p_delivery_date
      AND delivery_slot_id = p_delivery_slot_id
      AND order_status NOT IN ('cancelled');

    IF v_existing_orders_count >= v_slot.max_capacity THEN
        RAISE EXCEPTION 'Delivery slot "%" is fully booked for %. Please select another slot.', v_slot.name, p_delivery_date;
    END IF;

    -- 6. Items Validation & Server-Side Price Calculation
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Your order must contain at least one item.';
    END IF;

    -- Create Order record container
    v_order_ref := public.generate_order_reference();
    v_lookup_token := uuid_generate_v4();

    INSERT INTO public.orders (
        order_reference,
        lookup_token,
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        locality,
        pin_code,
        landmark,
        delivery_instructions,
        delivery_date,
        delivery_slot_id,
        delivery_type,
        order_notes,
        subtotal,
        delivery_fee,
        total_amount,
        order_status
    ) VALUES (
        v_order_ref,
        v_lookup_token,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_delivery_address,
        p_locality,
        p_pin_code,
        p_landmark,
        p_delivery_instructions,
        p_delivery_date,
        p_delivery_slot_id,
        p_delivery_type,
        p_order_notes,
        0, 0, 0,
        'pending_whatsapp'
    ) RETURNING id INTO v_order_id;

    -- Process each item atomically
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(menu_item_id UUID, quantity INT, special_instructions TEXT)
    LOOP
        IF v_item.quantity <= 0 OR v_item.quantity > 50 THEN
            RAISE EXCEPTION 'Invalid quantity for item %', v_item.menu_item_id;
        END IF;

        SELECT * INTO v_db_item FROM public.menu_items WHERE id = v_item.menu_item_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Dish not found in menu.';
        END IF;

        IF NOT v_db_item.is_available THEN
            RAISE EXCEPTION 'Dish "%" is currently unavailable.', v_db_item.name;
        END IF;

        -- STRICT UNPRICED GUARD: Item price MUST NOT be NULL or 0
        IF v_db_item.price IS NULL OR v_db_item.price <= 0 THEN
            RAISE EXCEPTION 'Dish "%" is unpriced or available only for party enquiry.', v_db_item.name;
        END IF;

        v_item_subtotal := v_db_item.price * v_item.quantity;
        v_subtotal := v_subtotal + v_item_subtotal;

        -- Record line item
        INSERT INTO public.order_items (
            order_id,
            menu_item_id,
            item_name,
            unit_price,
            quantity,
            subtotal_price,
            special_instructions
        ) VALUES (
            v_order_id,
            v_db_item.id,
            v_db_item.name,
            v_db_item.price,
            v_item.quantity,
            v_item_subtotal,
            v_item.special_instructions
        );

        -- Append to snapshot
        v_items_snapshot := v_items_snapshot || jsonb_build_object(
            'item_id', v_db_item.id,
            'name', v_db_item.name,
            'price', v_db_item.price,
            'quantity', v_item.quantity,
            'subtotal', v_item_subtotal,
            'instructions', v_item.special_instructions
        );
    END LOOP;

    -- Calculate delivery charges
    IF p_delivery_type = 'delivery' THEN
        v_delivery_fee := COALESCE(v_settings.delivery_charge, 50.00);
    ELSE
        v_delivery_fee := 0.00;
    END IF;

    v_total_amount := v_subtotal + v_delivery_fee;

    -- Update final order totals & snapshot
    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total_amount = v_total_amount,
        items_snapshot = v_items_snapshot
    WHERE id = v_order_id;

    -- Record initial status history
    INSERT INTO public.order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        note
    ) VALUES (
        v_order_id,
        NULL,
        'pending_whatsapp',
        'customer',
        'Order created on website, pending WhatsApp message send'
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', v_order_id,
        'order_reference', v_order_ref,
        'lookup_token', v_lookup_token,
        'delivery_date', p_delivery_date,
        'slot_name', v_slot.name,
        'subtotal', v_subtotal,
        'delivery_fee', v_delivery_fee,
        'total_amount', v_total_amount,
        'items_count', jsonb_array_length(p_items)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 14. TRANSACTIONAL PARTY ENQUIRY RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_party_enquiry(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
    p_event_type TEXT,
    p_event_date DATE,
    p_required_time TIME,
    p_guest_count INT,
    p_food_preferences TEXT,
    p_requested_dishes JSONB,
    p_custom_dishes TEXT,
    p_approximate_budget NUMERIC,
    p_delivery_location TEXT,
    p_special_requirements TEXT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_enquiry_id UUID;
    v_enquiry_ref TEXT;
    v_lookup_token UUID;
BEGIN
    IF p_guest_count < 5 THEN
        RAISE EXCEPTION 'Party and bulk orders require a minimum of 5 guests.';
    END IF;

    IF p_event_date < timezone('Asia/Kolkata', now())::date THEN
        RAISE EXCEPTION 'Event date must be in the future.';
    END IF;

    v_enquiry_ref := public.generate_enquiry_reference();
    v_lookup_token := uuid_generate_v4();

    INSERT INTO public.party_enquiries (
        enquiry_reference,
        lookup_token,
        customer_name,
        customer_phone,
        customer_email,
        event_type,
        event_date,
        required_time,
        guest_count,
        food_preferences,
        requested_dishes,
        custom_dishes,
        approximate_budget,
        delivery_location,
        special_requirements,
        status
    ) VALUES (
        v_enquiry_ref,
        v_lookup_token,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_event_type,
        p_event_date,
        p_required_time,
        p_guest_count,
        p_food_preferences,
        COALESCE(p_requested_dishes, '[]'::jsonb),
        p_custom_dishes,
        p_approximate_budget,
        p_delivery_location,
        p_special_requirements,
        'new_enquiry'
    ) RETURNING id INTO v_enquiry_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'enquiry_id', v_enquiry_id,
        'enquiry_reference', v_enquiry_ref,
        'lookup_token', v_lookup_token
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Helper to check if current authenticated user is an owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.owner_profiles
        WHERE id = auth.uid() AND role = 'owner'
    );
$$;

-- RLS: owner_profiles
CREATE POLICY "Owners can view own profile"
    ON public.owner_profiles FOR SELECT
    USING (auth.uid() = id);

-- RLS: business_settings
CREATE POLICY "Public can view business settings"
    ON public.business_settings FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Owner can update business settings"
    ON public.business_settings FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: business_schedules
CREATE POLICY "Public can view schedules"
    ON public.business_schedules FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Owner can manage schedules"
    ON public.business_schedules FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: business_closures
CREATE POLICY "Public can view closures"
    ON public.business_closures FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Owner can manage closures"
    ON public.business_closures FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: categories
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE OR public.is_owner());

CREATE POLICY "Owner can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: menu_items
CREATE POLICY "Public can view active menu items"
    ON public.menu_items FOR SELECT
    TO anon, authenticated
    USING (is_available = TRUE OR public.is_owner());

CREATE POLICY "Owner can manage menu items"
    ON public.menu_items FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: delivery_slots
CREATE POLICY "Public can view active delivery slots"
    ON public.delivery_slots FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE OR public.is_owner());

CREATE POLICY "Owner can manage delivery slots"
    ON public.delivery_slots FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: orders & order_items (STRICT: ZERO PUBLIC READ ACCESS)
CREATE POLICY "Owner can view and manage all orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

CREATE POLICY "Owner can view and manage all order items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

CREATE POLICY "Owner can view order status history"
    ON public.order_status_history FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: party_enquiries
CREATE POLICY "Owner can view and manage all party enquiries"
    ON public.party_enquiries FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: gallery_images
CREATE POLICY "Public can view gallery images"
    ON public.gallery_images FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Owner can manage gallery images"
    ON public.gallery_images FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

-- RLS: customer_reviews
CREATE POLICY "Public can view approved reviews"
    ON public.customer_reviews FOR SELECT
    TO anon, authenticated
    USING (is_approved = TRUE OR public.is_owner());

CREATE POLICY "Owner can manage reviews"
    ON public.customer_reviews FOR ALL
    TO authenticated
    USING (public.is_owner())
    WITH CHECK (public.is_owner());

