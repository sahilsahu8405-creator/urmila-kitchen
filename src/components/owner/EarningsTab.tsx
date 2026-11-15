import React, { useState, useMemo } from 'react';
import { Order } from '../../types/database.types';
import { getNowInIST } from '../../lib/cutoff';
import {
  TrendingUp,
  IndianRupee,
  Calendar,
  ShoppingBag,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  BarChart3,
  LineChart,
  Activity,
} from 'lucide-react';

interface EarningsTabProps {
  orders: Order[];
  onNavigateTab: (tab: string) => void;
}

interface DaySummary {
  dateStr: string;
  displayDate: string;
  dayName: string;
  orderCount: number;
  totalRevenue: number;
  itemsCount: number;
  pickupCount: number;
  deliveryCount: number;
  upiTotal: number;
  cashTotal: number;
  orders: Order[];
}

export const EarningsTab: React.FC<EarningsTabProps> = ({ orders, onNavigateTab }) => {
  const [timeRange, setTimeRange] = useState<'7days' | '14days' | '30days' | 'all'>('7days');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed_only'>('all');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState('');
  const [chartViewMode, setChartViewMode] = useState<'bars' | 'trend'>('bars');
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  // 1. Current IST Dates
  const now = getNowInIST();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Filter orders by status
  const eligibleOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.order_status === 'cancelled') return false;
      if (statusFilter === 'confirmed_only') {
        return (
          o.order_status === 'confirmed' ||
          o.order_status === 'preparing' ||
          o.order_status === 'ready' ||
          o.order_status === 'delivered' ||
          o.order_status === 'out_for_delivery'
        );
      }
      return true;
    });
  }, [orders, statusFilter]);

  // 2. Friendly Date Formatter
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return 'Unscheduled';
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    if (dateStr === yesterdayStr) return 'Yesterday';

    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const getDayOfWeek = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-IN', { weekday: 'short' });
    } catch {
      return '';
    }
  };

  // 3. Day-Wise Ledger Grouping
  const daySummaries: DaySummary[] = useMemo(() => {
    const map = new Map<string, Order[]>();

    eligibleOrders.forEach((o) => {
      const dStr = o.delivery_date ? o.delivery_date.slice(0, 10) : o.created_at.slice(0, 10);
      const existing = map.get(dStr) || [];
      existing.push(o);
      map.set(dStr, existing);
    });

    let minDateStr = '';
    if (timeRange === '7days') {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      minDateStr = d.toISOString().slice(0, 10);
    } else if (timeRange === '14days') {
      const d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      minDateStr = d.toISOString().slice(0, 10);
    } else if (timeRange === '30days') {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      minDateStr = d.toISOString().slice(0, 10);
    }

    const summaries: DaySummary[] = [];

    map.forEach((orderList, dStr) => {
      if (minDateStr && dStr < minDateStr && dStr !== tomorrowStr) {
        return;
      }

      if (searchDate.trim() && !dStr.includes(searchDate.trim())) {
        return;
      }

      let rev = 0;
      let items = 0;
      let pickup = 0;
      let delivery = 0;
      let upi = 0;
      let cash = 0;

      orderList.forEach((o) => {
        rev += o.total_amount || 0;
        if (o.delivery_type === 'pickup' || o.delivery_address?.toLowerCase().includes('pickup')) {
          pickup++;
        } else {
          delivery++;
        }

        const pref = (o.payment_preference || '').toLowerCase();
        if (pref.includes('cash')) {
          cash += o.total_amount || 0;
        } else {
          upi += o.total_amount || 0;
        }

        if (Array.isArray(o.order_items)) {
          o.order_items.forEach((item) => {
            items += item.quantity || 1;
          });
        } else if (Array.isArray(o.items_snapshot)) {
          o.items_snapshot.forEach((item: any) => {
            items += item.quantity || 1;
          });
        } else {
          items += 1;
        }
      });

      summaries.push({
        dateStr: dStr,
        displayDate: formatFriendlyDate(dStr),
        dayName: getDayOfWeek(dStr),
        orderCount: orderList.length,
        totalRevenue: rev,
        itemsCount: items,
        pickupCount: pickup,
        deliveryCount: delivery,
        upiTotal: upi,
        cashTotal: cash,
        orders: orderList,
      });
    });

    return summaries.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [eligibleOrders, timeRange, searchDate, todayStr, tomorrowStr, yesterdayStr]);

  // 4. Executive Totals
  const todaySummary = daySummaries.find((s) => s.dateStr === todayStr);
  const todayRevenue = todaySummary ? todaySummary.totalRevenue : 0;
  const todayOrdersCount = todaySummary ? todaySummary.orderCount : 0;

  const tomorrowSummary = daySummaries.find((s) => s.dateStr === tomorrowStr);
  const tomorrowRevenue = tomorrowSummary ? tomorrowSummary.totalRevenue : 0;
  const tomorrowOrdersCount = tomorrowSummary ? tomorrowSummary.orderCount : 0;

  const periodTotalRevenue = daySummaries.reduce((sum, d) => sum + d.totalRevenue, 0);
  const periodOrdersCount = daySummaries.reduce((sum, d) => sum + d.orderCount, 0);
  const periodItemsCount = daySummaries.reduce((sum, d) => sum + d.itemsCount, 0);

  const averageOrderValue =
    periodOrdersCount > 0 ? Math.round(periodTotalRevenue / periodOrdersCount) : 0;

  // Total UPI vs Cash in selected period
  const totalUpi = daySummaries.reduce((sum, d) => sum + d.upiTotal, 0);
  const totalCash = daySummaries.reduce((sum, d) => sum + d.cashTotal, 0);
  const totalPickup = daySummaries.reduce((sum, d) => sum + d.pickupCount, 0);
  const totalDelivery = daySummaries.reduce((sum, d) => sum + d.deliveryCount, 0);

  // 5. Visual Chart Data (7-Day window)
  const chartDays = useMemo(() => {
    const days: {
      dateStr: string;
      label: string;
      dayName: string;
      fullDateLabel: string;
      revenue: number;
      orders: number;
      isToday: boolean;
      isTomorrow: boolean;
    }[] = [];

    for (let i = 5; i >= -1; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().slice(0, 10);
      const isToday = dStr === todayStr;
      const isTomorrow = dStr === tomorrowStr;

      const matchedSummary = daySummaries.find((s) => s.dateStr === dStr);
      const rev = matchedSummary ? matchedSummary.totalRevenue : 0;
      const count = matchedSummary ? matchedSummary.orderCount : 0;

      days.push({
        dateStr: dStr,
        label: isToday
          ? 'Today'
          : isTomorrow
          ? 'Tmrw'
          : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        fullDateLabel: d.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        revenue: rev,
        orders: count,
        isToday,
        isTomorrow,
      });
    }
    return days;
  }, [daySummaries, now, todayStr, tomorrowStr]);

  const maxChartRevenue = Math.max(...chartDays.map((d) => d.revenue), 1000);
  const windowTotalRevenue = useMemo(
    () => chartDays.reduce((sum, d) => sum + d.revenue, 0),
    [chartDays]
  );
  const windowDailyAverage = useMemo(
    () => Math.round(windowTotalRevenue / chartDays.length),
    [windowTotalRevenue, chartDays]
  );
  const peakChartDay = useMemo(
    () => chartDays.reduce((max, d) => (d.revenue > max.revenue ? d : max), chartDays[0]),
    [chartDays]
  );

  // 6. CSV Export Function
  const handleExportCSV = () => {
    if (daySummaries.length === 0) {
      alert('No sales data recorded to export for this period.');
      return;
    }

    const headers = [
      'Date (YYYY-MM-DD)',
      'Day of Week',
      'Total Orders',
      'Dishes/Items Sold',
      'Pickup Orders',
      'Delivery Orders',
      'UPI Revenue (INR)',
      'Cash Revenue (INR)',
      'Net Total Revenue (INR)',
    ];

    const rows = daySummaries.map((d) => [
      d.dateStr,
      d.dayName,
      d.orderCount,
      d.itemsCount,
      d.pickupCount,
      d.deliveryCount,
      d.upiTotal,
      d.cashTotal,
      d.totalRevenue,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Urmilas_Kitchen_Daily_Earnings_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7 max-w-7xl">
      {/* ======================================================== */}
      {/* 1. TAB HEADER & REPORT ACTIONS                           */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                Daily Earnings & Revenue Reports
              </h2>
              <p className="text-xs sm:text-sm text-charcoal/70">
                Track day-by-day sales, customer payments, pickup volume, and export daily statements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light transition-all flex items-center gap-2 shadow-sm active:scale-95"
            title="Download daily earnings as an Excel CSV spreadsheet"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight hover:bg-cream-dark/40 text-charcoal text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            title="Print daily financial summary"
          >
            <Printer className="w-4 h-4 text-charcoal/70" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP FINANCIAL SUMMARY STATS (4 CARDS)                 */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Today's Revenue */}
        <div className="bg-cream-light p-5 sm:p-6 rounded-2xl border-2 border-borderLight shadow-subtle hover:border-forest/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">
              Today's Earnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              ₹{todayRevenue.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-charcoal/60 mt-1 font-medium">
              {todayOrdersCount} order{todayOrdersCount !== 1 ? 's' : ''} scheduled for today
            </p>
          </div>
        </div>

        {/* Metric 2: Tomorrow's Pre-Orders (Upcoming Pipeline) */}
        <div className="bg-cream-light p-5 sm:p-6 rounded-2xl border-2 border-borderLight shadow-subtle hover:border-forest/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">
              Tomorrow Booked
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-900">
              ₹{tomorrowRevenue.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-charcoal/60 mt-1 font-medium">
              {tomorrowOrdersCount} pre-order{tomorrowOrdersCount !== 1 ? 's' : ''} booked for pickup
            </p>
          </div>
        </div>

        {/* Metric 3: Period Total Revenue */}
        <div className="bg-cream-light p-5 sm:p-6 rounded-2xl border-2 border-borderLight shadow-subtle hover:border-forest/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">
              Period Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              ₹{periodTotalRevenue.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-charcoal/60 mt-1 font-medium">
              {periodOrdersCount} orders • {periodItemsCount} dishes cooked
            </p>
          </div>
        </div>

        {/* Metric 4: Average Order Value */}
        <div className="bg-cream-light p-5 sm:p-6 rounded-2xl border-2 border-borderLight shadow-subtle hover:border-forest/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">
              Average Order Value
            </span>
            <div className="w-10 h-10 rounded-xl bg-sage/20 text-forest flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              ₹{averageOrderValue}
            </span>
            <p className="text-xs text-charcoal/60 mt-1 font-medium">
              Average spend per customer order
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. VISUAL REVENUE TREND & FILTERS HUB                    */}
      {/* ======================================================== */}
      <div className="bg-cream-light rounded-2xl border border-borderLight p-5 sm:p-7 shadow-subtle space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-borderLight">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              Sales Performance & Day-by-Day Volume
            </h3>
            <p className="text-xs text-charcoal/70">
              Revenue distribution across scheduled fulfillment windows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="inline-flex p-1 bg-cream rounded-xl border border-borderLight text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-forest text-cream shadow-2xs'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                All Orders
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('confirmed_only')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === 'confirmed_only'
                    ? 'bg-forest text-cream shadow-2xs'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                Confirmed Only
              </button>
            </div>

            {/* Time Range Tabs */}
            <div className="inline-flex p-1 bg-cream rounded-xl border border-borderLight text-xs">
              <button
                type="button"
                onClick={() => setTimeRange('7days')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === '7days' ? 'bg-forest/15 text-forest' : 'text-charcoal/60 hover:text-charcoal'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('14days')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === '14days' ? 'bg-forest/15 text-forest' : 'text-charcoal/60 hover:text-charcoal'
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30days')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === '30days' ? 'bg-forest/15 text-forest' : 'text-charcoal/60 hover:text-charcoal'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === 'all' ? 'bg-forest/15 text-forest' : 'text-charcoal/60 hover:text-charcoal'
                }`}
              >
                All History
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Revenue Velocity Visualizer Card */}
        <div className="bg-white/80 rounded-2xl border border-borderLight p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header & Controls within Visualizer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderLight/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                {chartViewMode === 'bars' ? (
                  <BarChart3 className="w-5 h-5" />
                ) : (
                  <LineChart className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-serif font-bold text-forest text-base sm:text-lg">
                  Kitchen Revenue Trajectory
                </h4>
                <p className="text-[11px] text-charcoal/60 font-medium">
                  7-Day financial velocity: daily realized revenue vs. tomorrow's booked pipeline.
                </p>
              </div>
            </div>

            {/* KPI Badges & View Mode Selector */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              {/* Mini Stats Ribbon */}
              <div className="hidden lg:flex items-center gap-3 text-xs px-3 py-1.5 bg-cream/80 rounded-xl border border-borderLight">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-charcoal/50 block">
                    7D Window
                  </span>
                  <span className="font-serif font-bold text-forest text-xs">
                    ₹{windowTotalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-px h-5 bg-borderLight" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-charcoal/50 block">
                    Daily Average
                  </span>
                  <span className="font-serif font-bold text-forest text-xs">
                    ₹{windowDailyAverage.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-px h-5 bg-borderLight" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-charcoal/50 block">
                    Peak Day
                  </span>
                  <span className="font-serif font-bold text-forest text-xs">
                    ₹{peakChartDay.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* View Mode Toggle: Bars vs Trend Curve */}
              <div className="inline-flex p-1 bg-cream rounded-xl border border-borderLight text-xs">
                <button
                  type="button"
                  onClick={() => setChartViewMode('bars')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                    chartViewMode === 'bars'
                      ? 'bg-forest text-cream shadow-2xs'
                      : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                  title="Switch to Column Bar View"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Bars</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('trend')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                    chartViewMode === 'trend'
                      ? 'bg-forest text-cream shadow-2xs'
                      : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                  title="Switch to Smooth Area Trend View"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Trend</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* VIEW 1: MODERN ANALYTICS COLUMN BARS                     */}
          {/* ======================================================== */}
          {chartViewMode === 'bars' && (
            <div className="relative pt-6 pb-2">
              {/* Subtle Horizontal Benchmark Guide Lines */}
              <div className="absolute inset-x-0 top-10 bottom-14 flex flex-col justify-between pointer-events-none z-0">
                {/* 100% Top Benchmark */}
                <div className="border-b border-dashed border-borderLight/80 w-full flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-charcoal/40 bg-white/80 px-1 rounded -translate-y-1/2">
                    ₹{maxChartRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-charcoal/30">
                    Scale Max
                  </span>
                </div>
                {/* 50% Mid Benchmark */}
                <div className="border-b border-dashed border-borderLight/60 w-full flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-charcoal/40 bg-white/80 px-1 rounded -translate-y-1/2">
                    ₹{Math.round(maxChartRevenue / 2).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-charcoal/30">Midpoint</span>
                </div>
                {/* Baseline */}
                <div className="border-b-2 border-borderLight/90 w-full flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-charcoal/40 bg-white/80 px-1 rounded -translate-y-1/2">
                    ₹0
                  </span>
                  <span className="text-[9px] text-charcoal/30">Baseline</span>
                </div>
              </div>

              {/* 7 Columns Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-3 items-end h-56 sm:h-64 z-10 relative">
                {chartDays.map((col, idx) => {
                  const isHovered = hoveredDayIdx === idx;
                  const heightPercent =
                    col.revenue > 0
                      ? Math.max(Math.round((col.revenue / maxChartRevenue) * 100), 12)
                      : 0;

                  return (
                    <div
                      key={col.dateStr}
                      onMouseEnter={() => setHoveredDayIdx(idx)}
                      onMouseLeave={() => setHoveredDayIdx(null)}
                      className="relative flex flex-col items-center h-full justify-end cursor-pointer group rounded-xl py-1 transition-colors hover:bg-forest/[0.03]"
                    >
                      {/* Floating Hover Tooltip Card */}
                      {isHovered && (
                        <div className="absolute -top-16 z-30 pointer-events-none transform -translate-x-1/2 left-1/2 bg-forest-dark text-cream rounded-xl p-2.5 shadow-xl border border-white/10 text-center min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-[10px] font-medium text-cream/70 block uppercase tracking-wider">
                            {col.fullDateLabel}
                          </span>
                          <span className="font-serif font-bold text-sm text-amber-300 block mt-0.5">
                            ₹{col.revenue.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-cream/80 block mt-0.5 font-medium">
                            {col.orders} {col.orders === 1 ? 'order' : 'orders'} •{' '}
                            {col.isToday
                              ? "Today's Realized"
                              : col.isTomorrow
                              ? 'Booked Pipeline'
                              : 'Completed'}
                          </span>
                          {/* Arrow triangle notch */}
                          <div className="w-2.5 h-2.5 bg-forest-dark border-r border-b border-white/10 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                        </div>
                      )}

                      {/* Currency Amount Badge above Bar */}
                      <span
                        className={`text-[10px] sm:text-xs font-bold mb-2 transition-all ${
                          col.isToday
                            ? 'text-forest font-black scale-105'
                            : col.isTomorrow
                            ? 'text-amber-800 font-black scale-105'
                            : col.revenue > 0
                            ? 'text-forest font-bold'
                            : 'text-charcoal/30 font-medium'
                        }`}
                      >
                        {col.revenue > 0 ? `₹${col.revenue.toLocaleString('en-IN')}` : '—'}
                      </span>

                      {/* Bar Column Pillar */}
                      <div className="w-full flex items-end justify-center h-32 sm:h-36 mb-2">
                        {col.revenue > 0 ? (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-7 sm:w-10 md:w-12 rounded-t-lg transition-all duration-500 ease-out flex items-start justify-center pt-1 ${
                              col.isToday
                                ? 'bg-gradient-to-t from-forest via-emerald-600 to-emerald-400 shadow-md shadow-forest/20 ring-1 ring-emerald-300/40'
                                : col.isTomorrow
                                ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 shadow-md shadow-amber-500/20 ring-1 ring-amber-300/40'
                                : 'bg-gradient-to-t from-forest/80 via-forest/90 to-sage shadow-2xs group-hover:from-forest group-hover:to-emerald-600'
                            }`}
                          >
                            <div className="w-2/3 h-1 bg-white/30 rounded-full" />
                          </div>
                        ) : (
                          /* Crisp Zero-Baseline Notch */
                          <div className="w-6 sm:w-8 h-1.5 rounded-full bg-borderLight/90 group-hover:bg-forest/30 transition-all" />
                        )}
                      </div>

                      {/* Date & Weekday Label */}
                      <div className="flex flex-col items-center mt-1 text-center">
                        {col.isToday ? (
                          <span className="px-2 py-0.5 rounded-full bg-forest text-cream text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            Today
                          </span>
                        ) : col.isTomorrow ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-cream text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            Tmrw
                          </span>
                        ) : (
                          <>
                            <span className="text-[10px] sm:text-[11px] font-bold text-charcoal/80 leading-tight">
                              {col.label}
                            </span>
                            <span className="text-[9px] text-charcoal/40 uppercase tracking-wider font-semibold">
                              {col.dayName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: SMOOTH SVG GRADIENT AREA CURVE                   */}
          {/* ======================================================== */}
          {chartViewMode === 'trend' && (
            <div className="relative pt-4 pb-2">
              {(() => {
                const svgW = 700;
                const svgH = 200;
                const padX = 45;
                const padTop = 30;
                const padBottom = 40;
                const plotW = svgW - padX * 2;
                const plotH = svgH - padTop - padBottom;

                const points = chartDays.map((d, i) => {
                  const x = padX + (i / Math.max(chartDays.length - 1, 1)) * plotW;
                  const ratio = maxChartRevenue > 0 ? d.revenue / maxChartRevenue : 0;
                  const y = padTop + plotH - ratio * plotH;
                  return { x, y, ...d, index: i };
                });

                // Generate smooth cubic bezier curve path
                const linePath = points.reduce((acc, pt, i, arr) => {
                  if (i === 0) return `M ${pt.x} ${pt.y}`;
                  const prev = arr[i - 1];
                  const cpX1 = prev.x + (pt.x - prev.x) / 2;
                  const cpY1 = prev.y;
                  const cpX2 = prev.x + (pt.x - prev.x) / 2;
                  const cpY2 = pt.y;
                  return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
                }, '');

                const baselineY = padTop + plotH;
                const areaPath = `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

                return (
                  <div className="w-full">
                    <svg
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="w-full h-52 sm:h-60 overflow-visible"
                    >
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1B3B2B" stopOpacity="0.35" />
                          <stop offset="70%" stopColor="#2E5A44" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#2E5A44" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1B3B2B" floodOpacity="0.25" />
                        </filter>
                      </defs>

                      {/* Benchmark Horizontal Guide Lines */}
                      <line
                        x1={padX}
                        y1={padTop}
                        x2={svgW - padX}
                        y2={padTop}
                        stroke="#E8E4DA"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text x={padX - 8} y={padTop + 4} fill="#8A867B" fontSize="10" textAnchor="end" fontWeight="600">
                        ₹{maxChartRevenue.toLocaleString('en-IN')}
                      </text>

                      <line
                        x1={padX}
                        y1={padTop + plotH / 2}
                        x2={svgW - padX}
                        y2={padTop + plotH / 2}
                        stroke="#E8E4DA"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text x={padX - 8} y={padTop + plotH / 2 + 4} fill="#8A867B" fontSize="10" textAnchor="end" fontWeight="600">
                        ₹{Math.round(maxChartRevenue / 2).toLocaleString('en-IN')}
                      </text>

                      <line
                        x1={padX}
                        y1={baselineY}
                        x2={svgW - padX}
                        y2={baselineY}
                        stroke="#DDD8CE"
                        strokeWidth="1.5"
                      />
                      <text x={padX - 8} y={baselineY + 4} fill="#8A867B" fontSize="10" textAnchor="end" fontWeight="600">
                        ₹0
                      </text>

                      {/* Area Fill */}
                      <path d={areaPath} fill="url(#areaGradient)" />

                      {/* Line Stroke */}
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#1B3B2B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                      />

                      {/* Data Point Nodes */}
                      {points.map((pt) => {
                        const isHovered = hoveredDayIdx === pt.index;
                        const fillColor = pt.isToday
                          ? '#1B3B2B'
                          : pt.isTomorrow
                          ? '#D97706'
                          : pt.revenue > 0
                          ? '#4A6B56'
                          : '#C8C4B7';

                        return (
                          <g
                            key={pt.dateStr}
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredDayIdx(pt.index)}
                            onMouseLeave={() => setHoveredDayIdx(null)}
                          >
                            {/* Hover halo */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 14 : 9}
                              fill={fillColor}
                              fillOpacity={isHovered ? 0.25 : 0.12}
                              className="transition-all duration-200"
                            />
                            {/* Outer Ring */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 6 : 5}
                              fill="#FFFDF9"
                              stroke={fillColor}
                              strokeWidth={isHovered ? 3 : 2}
                              className="transition-all duration-200"
                            />
                            {/* Center Core */}
                            {pt.revenue > 0 && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={2.5}
                                fill={fillColor}
                              />
                            )}

                            {/* Top Amount Label */}
                            <text
                              x={pt.x}
                              y={pt.y - 12}
                              textAnchor="middle"
                              fill={pt.isToday ? '#1B3B2B' : pt.isTomorrow ? '#B45309' : pt.revenue > 0 ? '#2E5A44' : '#9CA3AF'}
                              fontSize={pt.revenue > 0 ? '11' : '10'}
                              fontWeight={pt.revenue > 0 ? 'bold' : 'normal'}
                            >
                              {pt.revenue > 0 ? `₹${pt.revenue}` : '—'}
                            </text>

                            {/* Bottom X-Axis Label */}
                            <text
                              x={pt.x}
                              y={baselineY + 18}
                              textAnchor="middle"
                              fill={pt.isToday ? '#1B3B2B' : pt.isTomorrow ? '#B45309' : '#4B5563'}
                              fontSize="11"
                              fontWeight={pt.isToday || pt.isTomorrow ? 'bold' : '500'}
                            >
                              {pt.label}
                            </text>
                            <text
                              x={pt.x}
                              y={baselineY + 30}
                              textAnchor="middle"
                              fill="#9CA3AF"
                              fontSize="9"
                              fontWeight="600"
                            >
                              {pt.dayName.toUpperCase()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Chart Legend & Live Sync Status Footer */}
          <div className="pt-3 border-t border-borderLight/70 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal/70">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-forest to-emerald-500 shadow-2xs" />
                <span className="font-semibold text-charcoal">Today's Realized</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-amber-600 to-amber-400 shadow-2xs" />
                <span className="font-semibold text-charcoal">Tomorrow's Booked Pipeline</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-forest/80 to-sage shadow-2xs" />
                <span className="font-medium text-charcoal/80">Completed Sales</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-charcoal/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live synchronized with customer WhatsApp orders</span>
            </div>
          </div>
        </div>

        {/* Payment & Channel Distribution Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Payment Method Split */}
          <div className="p-4 rounded-xl bg-cream border border-borderLight flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider block">
                Payment Channel Split
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-semibold text-forest">
                  UPI / Online: <strong>₹{totalUpi.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-xs font-semibold text-charcoal/70">
                  Cash at Pickup: <strong>₹{totalCash.toLocaleString('en-IN')}</strong>
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-lg">
              {totalUpi + totalCash > 0
                ? `${Math.round((totalUpi / (totalUpi + totalCash)) * 100)}% UPI`
                : '100% UPI'}
            </span>
          </div>

          {/* Fulfillment Split */}
          <div className="p-4 rounded-xl bg-cream border border-borderLight flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider block">
                Fulfillment Channels
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-semibold text-emerald-800">
                  🛍️ Kitchen Pickup: <strong>{totalPickup} orders</strong>
                </span>
                {totalDelivery > 0 && (
                  <span className="text-xs font-semibold text-charcoal/70">
                    🚚 Delivery: <strong>{totalDelivery} orders</strong>
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
              {totalPickup + totalDelivery > 0
                ? `${Math.round((totalPickup / (totalPickup + totalDelivery)) * 100)}% Pickup`
                : '100% Pickup'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. DAY-WISE EARNINGS LEDGER TABLE                        */}
        {/* ======================================================== */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-serif text-base font-bold text-forest">
                Day-Wise Earnings Ledger ({daySummaries.length} Days)
              </h4>
              <p className="text-[11px] text-charcoal/60">
                Sorted by fulfillment date. Click any day row to expand individual customer orders.
              </p>
            </div>

            {/* Quick date search filter */}
            <div className="relative">
              <input
                type="text"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                placeholder="Search date (e.g. 2026-11)..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-cream border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-forest"
              />
              <Search className="w-3.5 h-3.5 text-charcoal/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {daySummaries.length === 0 ? (
            <div className="p-10 text-center bg-cream rounded-2xl border border-borderLight text-xs text-charcoal/60 space-y-2">
              <div className="w-12 h-12 rounded-full bg-cream-dark/30 flex items-center justify-center mx-auto text-charcoal/40">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="font-bold text-forest text-sm">No Orders Found In Selected Period</p>
              <p className="max-w-md mx-auto">
                Customer pre-orders placed online will automatically record here grouped by fulfillment date.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-borderLight bg-cream shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-borderLight bg-cream-light text-[11px] font-bold text-charcoal/70 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Fulfillment Date</th>
                    <th className="py-3.5 px-3">Orders</th>
                    <th className="py-3.5 px-3">Dishes Sold</th>
                    <th className="py-3.5 px-3">Fulfillment</th>
                    <th className="py-3.5 px-3">Payment Split</th>
                    <th className="py-3.5 px-4 text-right">Net Day Earnings</th>
                    <th className="py-3.5 px-3 text-center">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight/60 font-medium">
                  {daySummaries.map((day) => {
                    const isExpanded = expandedDate === day.dateStr;
                    const isToday = day.dateStr === todayStr;
                    const isTomorrow = day.dateStr === tomorrowStr;

                    return (
                      <React.Fragment key={day.dateStr}>
                        <tr
                          className={`hover:bg-cream-dark/20 transition-colors cursor-pointer ${
                            isToday ? 'bg-forest/5' : isTomorrow ? 'bg-amber-500/5' : ''
                          }`}
                          onClick={() => setExpandedDate(isExpanded ? null : day.dateStr)}
                        >
                          {/* Date Column */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                                  isToday
                                    ? 'bg-forest text-cream'
                                    : isTomorrow
                                    ? 'bg-amber-600 text-cream'
                                    : 'bg-cream-dark/60 text-charcoal'
                                }`}
                              >
                                {day.displayDate}
                              </span>
                              <span className="text-xs text-charcoal/80 font-bold">
                                {day.dayName}
                              </span>
                            </div>
                            <span className="text-[10px] text-charcoal/50 font-mono block mt-1">
                              {day.dateStr}
                            </span>
                          </td>

                          {/* Orders Count */}
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-forest text-sm">{day.orderCount}</span>
                            <span className="text-[11px] text-charcoal/60 ml-1">orders</span>
                          </td>

                          {/* Items Sold */}
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-charcoal">{day.itemsCount} dishes</span>
                          </td>

                          {/* Fulfillment */}
                          <td className="py-3.5 px-3">
                            <span className="text-xs font-semibold text-emerald-800">
                              🛍️ {day.pickupCount} Pickup
                            </span>
                            {day.deliveryCount > 0 && (
                              <span className="text-xs font-semibold text-charcoal/70 ml-1">
                                • 🚚 {day.deliveryCount} Del
                              </span>
                            )}
                          </td>

                          {/* Payment Split */}
                          <td className="py-3.5 px-3 text-[11px] text-charcoal/70">
                            <div>UPI: <strong className="text-forest">₹{day.upiTotal}</strong></div>
                            {day.cashTotal > 0 && (
                              <div>Cash: <strong className="text-charcoal">₹{day.cashTotal}</strong></div>
                            )}
                          </td>

                          {/* Day Earnings */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-serif font-bold text-base sm:text-lg text-forest">
                              ₹{day.totalRevenue.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Action Expand */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              className="p-1.5 rounded-lg hover:bg-cream-dark text-charcoal/60 hover:text-forest transition-colors"
                              title="Toggle order details for this day"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Orders Detail Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-4 bg-cream-light/95 border-b border-borderLight animate-in fade-in">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-borderLight/60 text-xs font-bold text-forest">
                                  <span>Customer Orders for {day.displayDate} ({day.dateStr})</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNavigateTab('orders');
                                    }}
                                    className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                                  >
                                    <span>Manage in Orders Tab</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="divide-y divide-borderLight/40">
                                  {day.orders.map((o) => (
                                    <div
                                      key={o.id}
                                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-forest">
                                            {o.order_reference}
                                          </span>
                                          <span className="font-bold text-charcoal">
                                            {o.customer_name}
                                          </span>
                                          <span className="text-[11px] text-charcoal/60 font-mono">
                                            ({o.customer_phone})
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-charcoal/70 mt-0.5">
                                          {o.delivery_type === 'pickup' ? '🛍️ Kitchen Pickup' : '🚚 Delivery'} • Slot: {o.delivery_slot?.name || 'Selected Window'} • Mode: {o.payment_preference || 'UPI'}
                                        </p>
                                      </div>

                                      <div className="text-right flex items-center sm:flex-col sm:items-end justify-between sm:justify-center">
                                        <span className="font-serif font-bold text-forest text-sm sm:text-base">
                                          ₹{o.total_amount}
                                        </span>
                                        <span className="text-[9px] uppercase font-bold text-olive bg-forest/10 px-2 py-0.5 rounded-full mt-0.5">
                                          {o.order_status.replace(/_/g, ' ')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
