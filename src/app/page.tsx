"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  CreditCard,
  Search,
  Landmark,
  BarChart3,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Bell,
  User,
  ChevronDown,
  Filter,
  DollarSign,
  TrendingUp,
  RefreshCw,
  FolderMinus,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { getDashboardTilesData, getChartData } from "@/services/dashboard.service";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

const tableMetrics = [
  { name: "Sales", value: "$232,628.52", isBold: true, color: "text-zinc-900 dark:text-zinc-100" },
  { name: "Units", value: "23,853", indent: true },
  { name: "Refunds", value: "728", indent: true, color: "text-rose-400" },
  { name: "Promo", value: "-$1,991.11", indent: true, color: "text-amber-500" },
  { name: "Advertising cost", value: "-$4,247.00", isBold: true, color: "text-rose-400" },
  { name: "Shipping costs", value: "-$4,044.57", indent: true, color: "text-zinc-600 dark:text-zinc-400" },
  { name: "Refund cost", value: "-$5,820.42", indent: true, color: "text-zinc-600 dark:text-zinc-400" },
  { name: "Amazon fees", value: "-$92,652.70", indent: true, color: "text-zinc-600 dark:text-zinc-400" },
  { name: "Cost of goods", value: "-$35,280.41", indent: true, color: "text-zinc-600 dark:text-zinc-400" },
  { name: "Gross profit", value: "$88,592.31", isBold: true, color: "text-emerald-400" },
  { name: "Indirect expenses", value: "-$8,403.56", color: "text-rose-400" },
  { name: "Profit", value: "$80,188.75", isBold: true, color: "text-blue-400 bg-blue-500/10 rounded px-1.5 py-0.5" },
  { name: "Estimated payout", value: "$127,375.77", isBold: true, color: "text-zinc-900 dark:text-zinc-100" },
  { name: "Real ACOS", value: "1.83%", color: "text-amber-400" },
  { name: "Margin", value: "34.47%", color: "text-teal-400" },
  { name: "ROI", value: "227.29%", color: "text-emerald-400" },
  { name: "Sessions", value: "43,748", color: "text-zinc-700 dark:text-zinc-300" },
  { name: "Unit session percentage", value: "54.52%", color: "text-zinc-700 dark:text-zinc-300" },
];

export default function Home() {
  const [profitMenuOpen, setProfitMenuOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [dbTilesData, setDbTilesData] = useState<any>(null);
  const [dbChartData, setDbChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const tData = await getDashboardTilesData();
      const cData = await getChartData();
      setDbTilesData(tData);
      setDbChartData(cData);
      setLoading(false);
    }
    loadData();
    setMounted(true);
  }, []);

  const today = new Date();
  
  const tilesData = dbTilesData ? [
    {
      title: "Today",
      date: format(today, "dd MMMM yyyy"),
      color: "from-blue-600/20 to-blue-500/5 border-blue-500/30 text-blue-400",
      headerBg: "bg-blue-600/10",
      sales: dbTilesData.today.sales,
      orders: dbTilesData.today.orders,
      units: dbTilesData.today.orders,
      refunds: dbTilesData.today.refunds,
      grossProfit: dbTilesData.today.grossProfit,
      profit: dbTilesData.today.netProfit,
      payout: dbTilesData.today.estPayout,
    },
    {
      title: "Yesterday",
      date: format(subDays(today, 1), "dd MMMM yyyy"),
      color: "from-cyan-600/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
      headerBg: "bg-cyan-600/10",
      sales: dbTilesData.yesterday.sales,
      orders: dbTilesData.yesterday.orders,
      units: dbTilesData.yesterday.orders,
      refunds: dbTilesData.yesterday.refunds,
      grossProfit: dbTilesData.yesterday.grossProfit,
      profit: dbTilesData.yesterday.netProfit,
      payout: dbTilesData.yesterday.estPayout,
    },
    {
      title: "Month to date",
      date: `${format(startOfMonth(today), "d")}-${format(today, "d MMMM yyyy")}`,
      color: "from-teal-600/20 to-teal-500/5 border-teal-500/30 text-teal-400",
      headerBg: "bg-teal-600/10",
      sales: dbTilesData.monthToDate.sales,
      orders: dbTilesData.monthToDate.orders,
      units: dbTilesData.monthToDate.orders,
      refunds: dbTilesData.monthToDate.refunds,
      grossProfit: dbTilesData.monthToDate.grossProfit,
      profit: dbTilesData.monthToDate.netProfit,
      payout: dbTilesData.monthToDate.estPayout,
    },
    {
      title: "This month (forecast)",
      date: `${format(startOfMonth(today), "d")}-${format(endOfMonth(today), "d MMMM yyyy")}`,
      color: "from-emerald-600/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
      headerBg: "bg-emerald-600/10",
      sales: dbTilesData.forecast.sales,
      orders: dbTilesData.forecast.orders,
      units: dbTilesData.forecast.orders,
      refunds: dbTilesData.forecast.refunds,
      grossProfit: dbTilesData.forecast.grossProfit,
      profit: dbTilesData.forecast.netProfit,
      payout: dbTilesData.forecast.estPayout,
      change: "+2.5%",
      profitChange: "+1.2%",
    },
    {
      title: "Last month",
      date: `${format(startOfMonth(subMonths(today, 1)), "d")}-${format(endOfMonth(subMonths(today, 1)), "d MMMM yyyy")}`,
      color: "from-green-600/20 to-green-500/5 border-green-500/30 text-green-400",
      headerBg: "bg-green-600/10",
      sales: dbTilesData.lastMonth.sales,
      orders: dbTilesData.lastMonth.orders,
      units: dbTilesData.lastMonth.orders,
      refunds: dbTilesData.lastMonth.refunds,
      grossProfit: dbTilesData.lastMonth.grossProfit,
      profit: dbTilesData.lastMonth.netProfit,
      payout: dbTilesData.lastMonth.estPayout,
    },
  ] : [];

  const formattedChartData = dbChartData.map(d => ({
    name: format(new Date(d.date), "dd MMM"),
    profit: d.profit,
    units: Math.floor(d.sales / 50),
    adCost: d.adCost,
    refunds: d.sales * 0.05,
  }));

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-200 dark:border-zinc-900">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-bold text-zinc-950 text-lg shadow-md shadow-amber-500/10">
              sb
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
              seller<span className="text-amber-400 font-bold">board</span>
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 flex flex-col gap-1.5">
            {/* Profit Group (Expandable) */}
            <div>
              <button
                onClick={() => setProfitMenuOpen(!profitMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-100/50 dark:bg-zinc-900/50 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="size-4 text-amber-500/80" />
                  <span>Profit</span>
                </div>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    profitMenuOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>

              {/* Sub-menu items */}
              {profitMenuOpen && (
                <div className="mt-1 pl-4 flex flex-col gap-0.5 border-l border-zinc-200 dark:border-zinc-900 ml-5">
                  {[
                    "Dashboard",
                    "Products",
                    "Shipping Costs",
                    "Indirect Expenses",
                    "Variable Expenses",
                    "Search Terms",
                    "LTV",
                    "Cashflow",
                    "Reports",
                  ].map((subItem) => (
                    <button
                      key={subItem}
                      onClick={() => setActiveMenu(subItem)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeMenu === subItem
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-100/30 dark:bg-zinc-900/30"
                      }`}
                    >
                      {subItem}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Other standalone menu groups */}
            {[
              { name: "PPC", icon: BarChart3 },
              { name: "Inventory", icon: ShoppingBag },
              { name: "Autoresponder", icon: RefreshCw },
              { name: "Money Back", icon: DollarSign },
              { name: "Alerts", icon: AlertTriangle },
            ].map((menu) => (
              <button
                key={menu.name}
                onClick={() => setActiveMenu(menu.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeMenu === menu.name
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-100/50 dark:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <menu.icon className="size-4 text-zinc-500" />
                  <span>{menu.name}</span>
                </div>
                <ChevronRight className="size-3.5 text-zinc-600" />
              </button>
            ))}
          </nav>
        </div>

        {/* User / Settings Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-700 flex items-center justify-center">
              <User className="size-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Demo Account</span>
              <span className="text-[10px] text-zinc-500">demo@sellerboard.com</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-200/80 dark:border-zinc-900/80 pt-2 px-1">
            <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 transition-colors">
              <Settings className="size-4" />
            </button>
            <button className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 transition-colors">
              <HelpCircle className="size-4" />
            </button>
            <div className="flex gap-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-0.5">
              <button 
                onClick={() => setTheme("dark")}
                className={`p-1 rounded ${!mounted ? 'opacity-0' : theme === 'dark' ? 'bg-zinc-200 dark:bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                <Moon className="size-3" />
              </button>
              <button 
                onClick={() => setTheme("light")}
                className={`p-1 rounded ${!mounted ? 'opacity-0' : theme === 'light' ? 'bg-zinc-200 dark:bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                <Sun className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {/* --- HEADER --- */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h1>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              <button className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-sm">Tiles</button>
              <button className="px-2.5 py-1 rounded hover:text-zinc-800 dark:text-zinc-200">Chart</button>
              <button className="px-2.5 py-1 rounded hover:text-zinc-800 dark:text-zinc-200">P&L</button>
              <button className="px-2.5 py-1 rounded hover:text-zinc-800 dark:text-zinc-200">Map</button>
              <button className="px-2.5 py-1 rounded hover:text-zinc-800 dark:text-zinc-200">Trends</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-8 h-9 text-xs bg-zinc-100 dark:bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 placeholder-zinc-500 focus-visible:ring-amber-500/50"
              />
            </div>

            {/* Filters */}
            <Select defaultValue="all">
              <SelectTrigger className="w-36 h-9 text-xs bg-zinc-100 dark:bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800 focus:ring-amber-500/50">
                <SelectValue placeholder="Marketplace" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                <SelectItem value="all">All marketplaces</SelectItem>
                <SelectItem value="us">Amazon US</SelectItem>
                <SelectItem value="de">Amazon DE</SelectItem>
                <SelectItem value="jp">Amazon JP</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="usd">
              <SelectTrigger className="w-24 h-9 text-xs bg-zinc-100 dark:bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800 focus:ring-amber-500/50">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="vnd">VND (đ)</SelectItem>
              </SelectContent>
            </Select>

            <button className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors shadow-lg shadow-amber-500/10">
              <Filter className="size-3.5" />
              <span>Filter</span>
            </button>

            {/* Notification and User */}
            <button className="relative p-2 rounded-lg border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-100/40 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:bg-zinc-900 transition-all">
              <Bell className="size-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-500" />
            </button>
          </div>
        </header>

        {/* --- CONTENT CONTAINER --- */}
        <div className="p-8 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
          
          {loading ? (
            <div className="w-full flex items-center justify-center h-64 text-zinc-500">
              <RefreshCw className="size-6 animate-spin mr-2" /> Đang tải dữ liệu từ Supabase...
            </div>
          ) : (
            <>
              {/* --- 5 TILES SECTION --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {tilesData.map((tile) => (
                  <Card
                    key={tile.title}
                    className={`overflow-hidden border bg-gradient-to-b ${tile.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-200/50 dark:shadow-zinc-950/50`}
                  >
                    {/* Tile Header */}
                    <div className={`px-4 py-3 flex flex-col gap-0.5 border-b border-zinc-200 dark:border-zinc-200/60 dark:border-zinc-900/60 ${tile.headerBg}`}>
                      <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">{tile.title}</span>
                      <span className="text-[10px] text-zinc-500">{tile.date}</span>
                    </div>

                    {/* Tile Content */}
                    <CardContent className="p-4 flex flex-col gap-4">
                      {/* Sales Area */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-0.5">Sales</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            ${tile.sales?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                          {tile.change && (
                            <span className="text-[10px] font-semibold text-emerald-400">{tile.change}</span>
                          )}
                        </div>
                      </div>

                      {/* Grid of metrics */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-200/40 dark:border-zinc-900/40">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Orders / Units</span>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {tile.orders || 0} <span className="text-zinc-500">/</span> {tile.units || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Refunds</span>
                          <span className={`text-xs font-semibold ${tile.refunds > 0 ? "text-rose-400" : "text-zinc-500"}`}>
                            {tile.refunds?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Gross Profit</span>
                          <span className="text-xs font-semibold text-emerald-400">
                            ${tile.grossProfit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Profit</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-blue-400">
                              ${tile.profit?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                            {tile.profitChange && (
                              <span className="text-[8px] font-bold text-emerald-400">{tile.profitChange}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Est. Payout */}
                      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-200/40 dark:border-zinc-900/40 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Est. payout</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          ${tile.payout?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>

                      {/* More button */}
                      <button className="w-full text-center text-[10px] font-semibold text-amber-500 hover:text-amber-400 hover:underline pt-2">
                        More Details
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* --- CHART & PNL SUMMARY SECTION --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart Area (Left 2 columns) */}
                <Card className="lg:col-span-2 bg-zinc-100 dark:bg-zinc-100/30 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-200/80 dark:border-zinc-900/80 backdrop-blur-sm shadow-xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">PnL & Advertising Chart</h3>
                      <p className="text-xs text-zinc-500">Historical Profit, Units Sold and Ad Costs</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded bg-blue-500" />
                        <span className="text-zinc-600 dark:text-zinc-400">Profit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-0.5 w-4 bg-blue-400 border border-blue-400 rounded-full" />
                        <span className="text-zinc-600 dark:text-zinc-400">Units Sold</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded bg-rose-500" />
                        <span className="text-zinc-600 dark:text-zinc-400">Ad Cost</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-0.5 w-4 bg-rose-400 border border-rose-400 rounded-full" />
                        <span className="text-zinc-600 dark:text-zinc-400">Refunds</span>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Container for Recharts ComposedChart */}
                  <div className="h-96 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={formattedChartData}
                        margin={{ top: 10, right: -10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#71717a"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#71717a"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#71717a"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#09090b",
                            border: "1px solid #27272a",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                          }}
                          labelStyle={{ color: "#f4f4f5", fontWeight: "bold", fontSize: "12px" }}
                          itemStyle={{ fontSize: "11px", padding: "2px 0" }}
                          formatter={(value: any, name: any) => {
                            if (name === "units") return [value, "Units Sold"];
                            if (name === "profit") return [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Profit"];
                            if (name === "adCost") return [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Ad Cost"];
                            if (name === "refunds") return [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Refunds"];
                            return [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
                          }}
                        />
                        {/* Bars for Profit */}
                        <Bar
                          yAxisId="left"
                          dataKey="profit"
                          stackId="pnl"
                          fill="#3b82f6"
                          barSize={32}
                        />
                        {/* Bars for Ad Cost stacked on top of Profit */}
                        <Bar
                          yAxisId="left"
                          dataKey="adCost"
                          stackId="pnl"
                          fill="#f43f5e"
                          radius={[3, 3, 0, 0]}
                          barSize={32}
                        />
                        {/* Line for Units Sold */}
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="units"
                          stroke="#60a5fa"
                          strokeWidth={2}
                          dot={{ fill: "#18181b", stroke: "#60a5fa", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        {/* Line for Refunds */}
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="refunds"
                          stroke="#f472b6"
                          strokeWidth={1.5}
                          dot={{ fill: "#18181b", stroke: "#f472b6", strokeWidth: 1.5, r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Metrics Breakdown Table (Right 1 column) */}
                <Card className="bg-zinc-100 dark:bg-zinc-100/30 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-200/80 dark:border-zinc-900/80 backdrop-blur-sm shadow-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-200/80 dark:border-zinc-900/80">
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Metrics Breakdown</h3>
                      <div className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded border border-zinc-400 dark:border-zinc-700">
                        Last 12 Months
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-[380px] mt-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                      <Table>
                        <TableBody>
                          {tableMetrics.map((metric, idx) => (
                            <TableRow
                              key={idx}
                              className="hover:bg-zinc-100 dark:bg-zinc-100/30 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-200/40 dark:border-zinc-900/40"
                            >
                              <TableCell className="py-2.5 px-1 text-xs">
                                <span
                                  className={`${
                                    metric.indent ? "pl-4 text-zinc-500" : "font-semibold text-zinc-700 dark:text-zinc-300"
                                  }`}
                                >
                                  {metric.name}
                                </span>
                              </TableCell>
                              <TableCell className="py-2.5 px-1 text-right text-xs">
                                <span className={metric.color || "text-zinc-800 dark:text-zinc-200"}>
                                  {metric.value}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Summary Note */}
                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-200/80 dark:border-zinc-900/80 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Updated just now</span>
                    <span 
                      className="flex items-center gap-1 text-amber-500 hover:underline cursor-pointer"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="size-2.5" /> Refresh Data
                    </span>
                  </div>
                </Card>

              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
