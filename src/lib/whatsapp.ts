import { Order, PartyEnquiry } from '../types/database.types';

export function getCleanWhatsAppNumber(rawNumber: string): string {
  // Remove non-digit characters
  const cleaned = rawNumber.replace(/\D/g, '');
  // If 10 digits (India standard), prepend 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

export function generateWhatsAppOrderUrl(order: Order, whatsappNumber: string = '9204417026'): string {
  const phone = getCleanWhatsAppNumber(whatsappNumber);
  
  const itemsText = (order.items_snapshot || [])
    .map((item: any, idx: number) => {
      const notes = item.instructions ? ` _(Note: ${item.instructions})_` : '';
      return `${idx + 1}. *${item.name}* x ${item.quantity} — ₹${item.subtotal || item.price * item.quantity}${notes}`;
    })
    .join('\n');

  const message = [
    `*URMILA'S KITCHEN — NEW ORDER* 🌿`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order Ref:* ${order.order_reference}`,
    `👤 *Customer Name:* ${order.customer_name}`,
    `📞 *Contact:* ${order.customer_phone}`,
    ``,
    `📅 *Delivery Date:* ${order.delivery_date}`,
    `⏰ *Delivery Slot:* ${order.delivery_slot?.name || 'Selected Slot'}`,
    `📍 *Delivery Address:*`,
    `${order.delivery_address}`,
    order.locality ? `Locality: ${order.locality}` : '',
    order.pin_code ? `PIN: ${order.pin_code}` : '',
    order.landmark ? `Landmark: ${order.landmark}` : '',
    order.delivery_instructions ? `Instructions: ${order.delivery_instructions}` : '',
    ``,
    `🍽️ *ORDERED DISHES:*`,
    itemsText,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `Subtotal: ₹${order.subtotal}`,
    `Delivery Charges: ₹${order.delivery_fee}`,
    `*GRAND TOTAL: ₹${order.total_amount}*`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    order.order_notes ? `📝 *Customer Note:* ${order.order_notes}\n` : '',
    `_Please confirm this order and share payment details._ 🙏`
  ].filter(line => line !== null && line !== undefined && line !== '').join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppPartyEnquiryUrl(enquiry: PartyEnquiry, whatsappNumber: string = '9204417026'): string {
  const phone = getCleanWhatsAppNumber(whatsappNumber);

  const dishesText = (enquiry.requested_dishes || []).length > 0
    ? enquiry.requested_dishes.map((d, i) => `  ${i + 1}. ${d}`).join('\n')
    : '  None specified yet';

  const message = [
    `*URMILA'S KITCHEN — PARTY & BULK BOOKING ENQUIRY* 🎉`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Enquiry Ref:* ${enquiry.enquiry_reference}`,
    `👤 *Name:* ${enquiry.customer_name}`,
    `📞 *Phone:* ${enquiry.customer_phone}`,
    `🎈 *Event Type:* ${enquiry.event_type}`,
    `📅 *Event Date:* ${enquiry.event_date}`,
    `⏰ *Required Time:* ${enquiry.required_time}`,
    `👥 *Guest Count:* ${enquiry.guest_count} guests`,
    enquiry.approximate_budget ? `💰 *Approx. Budget:* ₹${enquiry.approximate_budget}` : '',
    `📍 *Event Location:* ${enquiry.delivery_location}`,
    ``,
    `🍽️ *REQUESTED DISHES:*`,
    dishesText,
    enquiry.custom_dishes ? `\n✨ *Custom Requests:* ${enquiry.custom_dishes}` : '',
    enquiry.special_requirements ? `\n📝 *Special Requirements:* ${enquiry.special_requirements}` : '',
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Please review and share a quotation._ 🙏`
  ].filter(line => line !== null && line !== undefined && line !== '').join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

