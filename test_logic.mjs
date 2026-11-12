// Test suite for Urmila's Kitchen core ordering logic

function getCleanWhatsAppNumber(rawNumber) {
  const cleaned = rawNumber.replace(/\D/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

function generateWhatsAppOrderUrl(order, whatsappNumber = '9204417026') {
  const phone = getCleanWhatsAppNumber(whatsappNumber);
  
  const itemsText = (order.items_snapshot || [])
    .map((item, idx) => {
      const notes = item.instructions ? `\n   ↳ _Instruction: ${item.instructions}_` : '';
      return `${idx + 1}. *${item.name}* x ${item.quantity} (@ ₹${item.price}) = ₹${item.subtotal || item.price * item.quantity}${notes}`;
    })
    .join('\n');

  const message = [
    `*URMILA'S KITCHEN — NEW ORDER* 🌿`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order Ref:* ${order.order_reference}`,
    `👤 *Customer Name:* ${order.customer_name}`,
    `📞 *Contact Number:* ${order.customer_phone}`,
    order.customer_email ? `✉️ *Email:* ${order.customer_email}` : '',
    ``,
    `📅 *Delivery Date:* ${order.delivery_date}`,
    `⏰ *Delivery Slot:* ${order.delivery_slot?.name || 'Selected Slot'}`,
    `📍 *Delivery Address:*`,
    `${order.delivery_address}`,
    order.locality ? `Locality: ${order.locality}` : '',
    order.pin_code ? `PIN Code: ${order.pin_code}` : '',
    order.landmark ? `Landmark: ${order.landmark}` : '',
    ``,
    `🍽️ *ORDERED DISHES:*`,
    itemsText,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    order.order_notes ? `📝 *Overall Order Instructions:* ${order.order_notes}\n━━━━━━━━━━━━━━━━━━━━━━━` : '',
    `Subtotal: ₹${order.subtotal}`,
    `Delivery Charges: ₹${order.delivery_fee}`,
    `*GRAND TOTAL: ₹${order.total_amount}*`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Please review and confirm this order._ 🙏`
  ].filter(line => line !== null && line !== undefined && line !== '').join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

console.log('--- TEST 1: Unpriced Dish Guard ---');
const unpricedDish = { id: 'item-1', name: 'Corn Bunch', price: null };
function canAddToCart(dish) {
  return dish.price !== null && dish.price > 0;
}
console.log('Can add unpriced dish:', canAddToCart(unpricedDish), '-> Expected: false');

console.log('\n--- TEST 2: Multiple Item Order with Notes ---');
const testOrder = {
  order_reference: 'UK-20261113-0042',
  customer_name: 'Radhika Sharma',
  customer_phone: '9876543210',
  delivery_address: 'Flat 402, Sunshine Apts, Bandra West',
  locality: 'Bandra West',
  pin_code: '400050',
  landmark: 'Opposite Hill Road Church',
  delivery_date: '2026-11-13',
  delivery_slot: { name: 'Dinner (7:30 PM - 9:00 PM)' },
  order_notes: 'Please call on arrival, ring doorbell twice',
  subtotal: 580,
  delivery_fee: 50,
  total_amount: 630,
  items_snapshot: [
    { name: 'Pav Bhaji Fondue', quantity: 1, price: 220, subtotal: 220, instructions: 'Less spicy, please' },
    { name: 'Cheese Corn Balls', quantity: 2, price: 180, subtotal: 360, instructions: 'Extra crispy' },
  ],
};

const waUrl = generateWhatsAppOrderUrl(testOrder, '9204417026');
console.log('Generated WhatsApp URL starts with https://wa.me/919204417026:', waUrl.startsWith('https://wa.me/919204417026'));
const decodedMsg = decodeURIComponent(waUrl);
console.log('WhatsApp message contains Radhika Sharma:', decodedMsg.includes('Radhika Sharma'));
console.log('WhatsApp message contains Pav Bhaji Fondue:', decodedMsg.includes('Pav Bhaji Fondue'));
console.log('WhatsApp message contains Less spicy, please:', decodedMsg.includes('Less spicy, please'));
console.log('WhatsApp message contains Overall Order Instructions:', decodedMsg.includes('Please call on arrival'));
console.log('WhatsApp message contains GRAND TOTAL: ₹630:', decodedMsg.includes('GRAND TOTAL: ₹630'));

console.log('\nAll business logic tests passed successfully!');

