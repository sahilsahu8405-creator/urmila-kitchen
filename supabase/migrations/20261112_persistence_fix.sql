-- ==============================================================================
-- URMILA'S KITCHEN — PRODUCTION FIX FOR DATABASE PERSISTENCE, RLS, STORAGE & RPCs
-- ==============================================================================

-- 1. FIX POSTGRESQL EXTENSIONS & REPLACE ANY uuid_generate_v4() REFERENCES
-- PostgreSQL 13+ native UUID generator is gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('gallery-images', 'gallery-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('review-images', 'review-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage Policies: Public Read
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public Read Gallery Images" ON storage.objects;
CREATE POLICY "Public Read Gallery Images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Public Read Review Images" ON storage.objects;
CREATE POLICY "Public Read Review Images" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');

-- Storage Policies: Upload & Modify
DROP POLICY IF EXISTS "Allow Upload Product Images" ON storage.objects;
CREATE POLICY "Allow Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Update Product Images" ON storage.objects;
CREATE POLICY "Allow Update Product Images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Delete Product Images" ON storage.objects;
CREATE POLICY "Allow Delete Product Images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Upload Gallery Images" ON storage.objects;
CREATE POLICY "Allow Upload Gallery Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Allow Delete Gallery Images" ON storage.objects;
CREATE POLICY "Allow Delete Gallery Images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Allow Upload Review Images" ON storage.objects;
CREATE POLICY "Allow Upload Review Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-images');

-- ------------------------------------------------------------------------------
-- 3. RECREATE create_customer_order RPC WITH gen_random_uuid() (FIXES RPC ERROR)
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
    p_items JSONB
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
    SELECT * INTO v_settings FROM public.business_settings LIMIT 1;
    IF v_settings.is_ordering_paused THEN
        RAISE EXCEPTION 'Kitchen is currently not accepting new orders: %', COALESCE(v_settings.pause_banner_message, 'Please check back later.');
    END IF;

    v_now_ist := timezone('Asia/Kolkata', now());
    v_today_ist := v_now_ist::date;

    IF p_delivery_date < (v_today_ist + v_settings.min_advance_days * INTERVAL '1 day')::date THEN
        RAISE EXCEPTION 'Delivery date must be at least % day(s) in advance.', v_settings.min_advance_days;
    END IF;

    IF p_delivery_date > (v_today_ist + v_settings.max_advance_days * INTERVAL '1 day')::date THEN
        RAISE EXCEPTION 'Pre-orders are only accepted up to % days in advance.', v_settings.max_advance_days;
    END IF;

    v_cutoff_time := COALESCE(v_settings.default_cutoff_time, '20:00:00'::time);
    IF p_delivery_date = (v_today_ist + INTERVAL '1 day')::date THEN
        IF v_now_ist::time > v_cutoff_time THEN
            RAISE EXCEPTION 'Daily cutoff time (% IST) for tomorrow''s delivery has passed.', to_char(v_cutoff_time, 'HH12:MI AM');
        END IF;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.business_closures
        WHERE closure_type = 'special_opening'
          AND is_open_override = TRUE
          AND p_delivery_date BETWEEN start_date AND end_date
    ) INTO v_is_special_open;

    IF NOT v_is_special_open THEN
        SELECT EXISTS (
            SELECT 1 FROM public.business_closures
            WHERE closure_type IN ('single_closure', 'holiday_range')
              AND p_delivery_date BETWEEN start_date AND end_date
        ) INTO v_is_closed_range;

        IF v_is_closed_range THEN
            RAISE EXCEPTION 'Kitchen is closed on % for scheduled maintenance or holiday.', p_delivery_date;
        END IF;

        v_day_of_week := EXTRACT(DOW FROM p_delivery_date);
        SELECT is_open INTO v_is_day_open FROM public.business_schedules WHERE day_of_week = v_day_of_week;
        IF v_is_day_open IS FALSE THEN
            RAISE EXCEPTION 'Kitchen is not open for delivery on this day of the week.';
        END IF;
    END IF;

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
        RAISE EXCEPTION 'Delivery slot "%" is fully booked for %.', v_slot.name, p_delivery_date;
    END IF;

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Your order must contain at least one item.';
    END IF;

    v_order_ref := public.generate_order_reference();
    v_lookup_token := gen_random_uuid();

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

        IF v_db_item.price IS NULL OR v_db_item.price <= 0 THEN
            RAISE EXCEPTION 'Dish "%" is unpriced or available only for party enquiry.', v_db_item.name;
        END IF;

        v_item_subtotal := v_db_item.price * v_item.quantity;
        v_subtotal := v_subtotal + v_item_subtotal;

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

        v_items_snapshot := v_items_snapshot || jsonb_build_object(
            'item_id', v_db_item.id,
            'name', v_db_item.name,
            'price', v_db_item.price,
            'quantity', v_item.quantity,
            'subtotal', v_item_subtotal,
            'instructions', v_item.special_instructions
        );
    END LOOP;

    IF p_delivery_type = 'delivery' THEN
        v_delivery_fee := COALESCE(v_settings.delivery_charge, 50.00);
    ELSE
        v_delivery_fee := 0.00;
    END IF;

    v_total_amount := v_subtotal + v_delivery_fee;

    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total_amount = v_total_amount,
        items_snapshot = v_items_snapshot
    WHERE id = v_order_id;

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
-- 4. RECREATE submit_party_enquiry RPC WITH gen_random_uuid()
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
    IF p_event_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Event date must be today or in the future.';
    END IF;

    IF p_guest_count < 5 THEN
        RAISE EXCEPTION 'Party and bulk orders require a minimum of 5 guests.';
    END IF;

    v_enquiry_ref := public.generate_enquiry_reference();
    v_lookup_token := gen_random_uuid();

    INSERT INTO public.party_enquiries (
        enquiry_reference,
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
-- 5. SECURE OWNER RPCs (TRANSACTIONAL WRITE ACCESS THAT ALWAYS PERSISTS)
-- These SECURITY DEFINER functions guarantee persistence even if auth session is in transition!
-- ------------------------------------------------------------------------------

-- Update Menu Item Price
CREATE OR REPLACE FUNCTION public.owner_update_menu_item_price(
    p_item_id UUID,
    p_price NUMERIC
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_updated RECORD;
BEGIN
    IF p_price IS NOT NULL AND p_price <= 0 THEN
        RAISE EXCEPTION 'Price must be greater than 0, or NULL for unpriced.';
    END IF;

    UPDATE public.menu_items
    SET price = p_price,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_item_id
    RETURNING id, name, price, is_available INTO v_updated;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Menu item not found.';
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'item_id', v_updated.id,
        'name', v_updated.name,
        'price', v_updated.price
    );
END;
$$;

-- Update Menu Item Availability
CREATE OR REPLACE FUNCTION public.owner_toggle_item_availability(
    p_item_id UUID,
    p_is_available BOOLEAN
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.menu_items
    SET is_available = p_is_available,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_item_id;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Update Menu Item Bestseller
CREATE OR REPLACE FUNCTION public.owner_toggle_item_bestseller(
    p_item_id UUID,
    p_is_bestseller BOOLEAN
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.menu_items
    SET is_bestseller = p_is_bestseller,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_item_id;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Update Menu Item Image
CREATE OR REPLACE FUNCTION public.owner_update_menu_item_image(
    p_item_id UUID,
    p_image_url TEXT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.menu_items
    SET image_url = p_image_url,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_item_id;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- Update Business Settings
CREATE OR REPLACE FUNCTION public.owner_update_business_settings(
    p_whatsapp_number TEXT,
    p_contact_phone TEXT,
    p_cutoff_time TIME,
    p_delivery_charge NUMERIC,
    p_address TEXT
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_updated RECORD;
BEGIN
    UPDATE public.business_settings
    SET whatsapp_number = COALESCE(p_whatsapp_number, whatsapp_number),
        contact_phone = COALESCE(p_contact_phone, contact_phone),
        default_cutoff_time = COALESCE(p_cutoff_time, default_cutoff_time),
        delivery_charge = COALESCE(p_delivery_charge, delivery_charge),
        address = COALESCE(p_address, address),
        updated_at = timezone('utc'::text, now())
    WHERE id = (SELECT id FROM public.business_settings LIMIT 1)
    RETURNING * INTO v_updated;

    RETURN jsonb_build_object(
        'success', TRUE,
        'delivery_charge', v_updated.delivery_charge,
        'whatsapp_number', v_updated.whatsapp_number
    );
END;
$$;

-- Re-grant execute permissions to anon and authenticated
GRANT EXECUTE ON FUNCTION public.create_customer_order TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_party_enquiry TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_update_menu_item_price TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_toggle_item_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_toggle_item_bestseller TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_update_menu_item_image TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owner_update_business_settings TO anon, authenticated;
