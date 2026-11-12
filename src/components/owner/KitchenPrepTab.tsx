import React, { useState, useMemo } from 'react';
import { Order } from '../../types/database.types';
import { formatDateToYYYYMMDD, getNowInIST } from '../../lib/cutoff';
import { Printer, Download, Calendar, ChefHat, AlertCircle } from 'lucide-react';

interface KitchenPrepTabProps {
  orders: Order[];
}

interface DishPrepCount {
  name: string;
  confirmedQuantity: number;
  pendingQuantity: number;
  ordersCount: number;
  slots: Record<string, number>;
  notes: string[];
}

export const KitchenPrepTab: React.FC<KitchenPrepTabProps> = ({ orders }) => {
  // Default date to tomorrow
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date(getNowInIST());
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToYYYYMMDD(tomorrow);
  });

  // Calculate aggregated quantities for selected date
  const prepData = useMemo(() => {
    const dishMap: Record<string, DishPrepCount> = {};

    orders
      .filter((o) => o.delivery_date === selectedDate && o.order_status !== 'cancelled')
      .forEach((order) => {
        const isConfirmed = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].includes(
          order.order_status
        );
        const slotName = order.delivery_slot?.name || 'Standard Slot';

        (order.items_snapshot || []).forEach((item: any) => {
          if (!dishMap[item.name]) {
            dishMap[item.name] = {
              name: item.name,
              confirmedQuantity: 0,
              pendingQuantity: 0,
              ordersCount: 0,
              slots: {},
              notes: [],
            };
          }

          dishMap[item.name].ordersCount += 1;
          dishMap[item.name].slots[slotName] = (dishMap[item.name].slots[slotName] || 0) + item.quantity;
          if (item.instructions && item.instructions.trim()) {
            dishMap[item.name].notes.push(`${item.instructions} (${item.quantity} portions)`);
          }

          if (isConfirmed) {
            dishMap[item.name].confirmedQuantity += item.quantity;
          } else {
            dishMap[item.name].pendingQuantity += item.quantity;
          }
        });
      });

    return Object.values(dishMap).sort((a, b) => b.confirmedQuantity - a.confirmedQuantity);
  }, [orders, selectedDate]);

  const totalConfirmedDishes = prepData.reduce((sum, d) => sum + d.confirmedQuantity, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Dish Name', 'Confirmed Quantity', 'Pending Quantity', 'Total Orders', 'Slot Breakdown'];
    const rows = prepData.map((d) => [
      `"${d.name}"`,
      d.confirmedQuantity,
      d.pendingQuantity,
      d.ordersCount,
      `"${Object.entries(d.slots).map(([s, q]) => `${s}: ${q}`).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kitchen_prep_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-forest" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Kitchen Preparation Sheet</h2>
          </div>
          <p className="text-sm text-charcoal/70 mt-1">
            Aggregated batch cooking requirements calculated strictly from confirmed customer orders.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-charcoal text-xs font-bold hover:bg-cream-dark/50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Selector Banner */}
      <div className="p-4 rounded-2xl bg-cream-light border border-borderLight flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-terracotta shrink-0" />
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/60">
              Select Batch Preparation Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-0.5 px-3 py-1.5 rounded-lg bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-xs text-charcoal/60 block">Total Confirmed Portions</span>
            <span className="font-serif text-2xl font-bold text-forest">{totalConfirmedDishes}</span>
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">Distinct Dishes</span>
            <span className="font-serif text-2xl font-bold text-forest">{prepData.length}</span>
          </div>
        </div>
      </div>

      {/* Prep Sheet Table */}
      {prepData.length === 0 ? (
        <div className="p-12 text-center bg-cream-light rounded-2xl border border-borderLight">
          <p className="font-serif text-lg font-bold text-forest mb-1">No preparation orders for {selectedDate}</p>
          <p className="text-xs text-charcoal/60">
            Select another date or check your Orders tab for incoming pre-orders.
          </p>
        </div>
      ) : (
        <div className="bg-cream-light rounded-2xl border border-borderLight overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-borderLight text-xs uppercase font-bold text-forest tracking-wider">
                <tr>
                  <th className="py-4 px-5">Dish Name</th>
                  <th className="py-4 px-5 text-center">Confirmed Qty to Cook</th>
                  <th className="py-4 px-5 text-center">Pending WhatsApp / Unconfirmed</th>
                  <th className="py-4 px-5">Delivery Slot Breakdown</th>
                  <th className="py-4 px-5">Special Cooking Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/70">
                {prepData.map((dish, idx) => (
                  <tr key={idx} className="hover:bg-cream/40 transition-colors">
                    <td className="py-4 px-5 font-serif font-bold text-forest text-base">
                      {dish.name}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center justify-center min-w-10 px-3 py-1.5 rounded-xl bg-forest text-cream font-mono font-bold text-base shadow-sm">
                        {dish.confirmedQuantity}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      {dish.pendingQuantity > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-8 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-mono font-bold text-xs">
                          +{dish.pendingQuantity} pending
                        </span>
                      ) : (
                        <span className="text-xs text-charcoal/40">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(dish.slots).map(([slot, qty]) => (
                          <span
                            key={slot}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream border border-borderLight text-xs text-charcoal/80 font-medium"
                          >
                            <span>{slot}:</span>
                            <strong className="text-forest font-bold">{qty}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs">
                      {dish.notes && dish.notes.length > 0 ? (
                        <ul className="list-disc list-inside text-olive font-medium space-y-0.5">
                          {dish.notes.map((n, ni) => (
                            <li key={ni}>{n}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-charcoal/40 text-[11px]">Standard prep</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

