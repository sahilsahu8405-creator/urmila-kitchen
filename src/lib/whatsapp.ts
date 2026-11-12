import { Order, PartyEnquiry } from '../types/database.types';

/**
 * Formats a raw phone number into standard international format without '+' or special symbols.
 * Example: '9204417026' -> '919204417026'
 */
export function getCleanWhatsAppNumber(rawNumber: string): string {
  const cleaned = rawNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Generates the clean plain-text WhatsApp order message exactly conforming to specification.
 */
export function generateWhatsAppOrderText(order: Order, paymentPreference?: string): string {
  const divider = '━━━━━━━━━━━━━━━━━━';

  const sections: string[] = [];

  // Title
  sections.push("NEW ORDER – URMILA'S KITCHEN");
  sections.push(divider);

  // Order ID
  sections.push(`ORDER ID: ${order.order_reference}`);

  // Customer Details
  const customerLines: string[] = ['CUSTOMER DETAILS'];
  customerLines.push(`Name: ${order.customer_name}`);
  customerLines.push(`Phone: ${order.customer_phone}`);
  sections.push(customerLines.join('\n'));

  // Delivery Details
  const deliveryLines: string[] = ['DELIVERY DETAILS'];
  deliveryLines.push(`Address: ${order.delivery_address}`);
  if (order.locality && order.locality.trim()) {
    deliveryLines.push(`Area: ${order.locality.trim()}`);
  }
  if (order.pin_code && order.pin_code.trim()) {
    deliveryLines.push(`PIN Code: ${order.pin_code.trim()}`);
  }
  if (order.landmark && order.landmark.trim()) {
    deliveryLines.push(`Landmark: ${order.landmark.trim()}`);
  }
  if (order.delivery_date) {
    deliveryLines.push(`Delivery Date: ${order.delivery_date}`);
  }
  if (order.delivery_slot?.name) {
    deliveryLines.push(`Delivery Slot: ${order.delivery_slot.name}`);
  }
  sections.push(deliveryLines.join('\n'));

  // Order Items
  const items = order.items_snapshot || [];
  if (items.length > 0) {
    const itemLines: string[] = ['ORDER ITEMS', ''];
    items.forEach((ci: any, index: number) => {
      let line = `${index + 1}. ${ci.name} × ${ci.quantity}`;
      if (ci.instructions && String(ci.instructions).trim()) {
        line += `\n   Note: ${String(ci.instructions).trim()}`;
      }
      itemLines.push(line);
    });
    sections.push(itemLines.join('\n'));
  }

  sections.push(divider);

  // Payment Summary
  const paymentLines: string[] = ['PAYMENT SUMMARY', ''];
  paymentLines.push(`Subtotal: ₹${order.subtotal}`);
  paymentLines.push(`Delivery Charges: ₹${order.delivery_fee}`);
  paymentLines.push(`GRAND TOTAL: ₹${order.total_amount}`);

  if (paymentPreference && paymentPreference.trim()) {
    paymentLines.push('');
    paymentLines.push(`Payment Preference: ${paymentPreference.trim()}`);
  }
  sections.push(paymentLines.join('\n'));

  // Special Instructions
  const overallNotes = (order.order_notes || order.delivery_instructions || '').trim();
  if (overallNotes) {
    sections.push(`SPECIAL INSTRUCTIONS\n${overallNotes}`);
  }

  sections.push(divider);

  // Closing
  sections.push("Please review and confirm this order.\n\nThank you!\nUrmila's Kitchen");

  return sections.join('\n\n');
}

/**
 * Constructs the final sanitized WhatsApp URL with encodeURIComponent.
 */
export function generateWhatsAppOrderUrl(
  order: Order,
  whatsappNumber: string = '9204417026',
  paymentPreference?: string
): string {
  const phone = getCleanWhatsAppNumber(whatsappNumber);
  const messageText = generateWhatsAppOrderText(order, paymentPreference);
  return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Generates the clean plain-text WhatsApp Party Enquiry message.
 */
export function generateWhatsAppPartyEnquiryText(enquiry: PartyEnquiry): string {
  const divider = '━━━━━━━━━━━━━━━━━━';
  const sections: string[] = [];

  sections.push("NEW PARTY & BULK BOOKING – URMILA'S KITCHEN");
  sections.push(divider);

  sections.push(`ENQUIRY ID: ${enquiry.enquiry_reference}`);

  const customerLines: string[] = ['CUSTOMER DETAILS'];
  customerLines.push(`Name: ${enquiry.customer_name}`);
  customerLines.push(`Phone: ${enquiry.customer_phone}`);
  if (enquiry.customer_email) {
    customerLines.push(`Email: ${enquiry.customer_email}`);
  }
  sections.push(customerLines.join('\n'));

  const eventLines: string[] = ['EVENT DETAILS'];
  eventLines.push(`Event Type: ${enquiry.event_type}`);
  eventLines.push(`Event Date: ${enquiry.event_date}`);
  eventLines.push(`Required Time: ${enquiry.required_time}`);
  eventLines.push(`Guest Count: ${enquiry.guest_count} guests`);
  eventLines.push(`Location: ${enquiry.delivery_location}`);
  if (enquiry.approximate_budget) {
    eventLines.push(`Approximate Budget: ₹${enquiry.approximate_budget}`);
  }
  sections.push(eventLines.join('\n'));

  const dishes = enquiry.requested_dishes || [];
  if (dishes.length > 0) {
    const dishLines = ['REQUESTED DISHES', ''];
    dishes.forEach((d: string, idx: number) => {
      dishLines.push(`${idx + 1}. ${d}`);
    });
    sections.push(dishLines.join('\n'));
  }

  if (enquiry.custom_dishes && enquiry.custom_dishes.trim()) {
    sections.push(`CUSTOM DISH REQUESTS\n${enquiry.custom_dishes.trim()}`);
  }

  if (enquiry.special_requirements && enquiry.special_requirements.trim()) {
    sections.push(`SPECIAL INSTRUCTIONS\n${enquiry.special_requirements.trim()}`);
  }

  sections.push(divider);
  sections.push("Please review and share quotation & advance booking details.\n\nThank you!\nUrmila's Kitchen");

  return sections.join('\n\n');
}

/**
 * Constructs the final sanitized WhatsApp URL for party enquiries with encodeURIComponent.
 */
export function generateWhatsAppPartyEnquiryUrl(
  enquiry: PartyEnquiry,
  whatsappNumber: string = '9204417026'
): string {
  const phone = getCleanWhatsAppNumber(whatsappNumber);
  const messageText = generateWhatsAppPartyEnquiryText(enquiry);
  return `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
}
