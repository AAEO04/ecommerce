import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

// Types matching backend models
interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  totalCustomers: number
  customersChange: number
  conversionRate: number
  conversionChange: number
}

interface SalesData {
  date: string
  revenue: number
  orders: number
}

interface TopProduct {
  id: number
  name: string
  category: string
  revenue: number
  unitsSold: number
  stock: number
}

interface InventoryAlert {
  id: number
  productName: string
  variantSku: string
  currentStock: number
  minStock: number
  status: 'critical' | 'low' | 'warning'
}

const COLORS = ['#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6']

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalCustomers: 0,
    customersChange: 0,
    conversionRate: 0,
    conversionChange: 0
  })

  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch from backend API
      const [statsRes, salesRes, productsRes, alertsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE}/api/admin/stats?range=${timeRange}`),
        fetch(`${process.env.REACT_APP_API_BASE}/api/admin/sales?range=${timeRange}`),
        fetch(`${process.env.REACT_APP_API_BASE}/api/admin/top-products?range=${timeRange}`),
        fetch(`${process.env.REACT_APP_API_BASE}/api/admin/inventory-alerts`)
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (salesRes.ok) setSalesData(await salesRes.json())
      if (productsRes.ok) setTopProducts(await productsRes.json())
      if (alertsRes.ok) setInventoryAlerts(await alertsRes.json())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use mock data for development
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    setStats({
      totalRevenue: 125430,
      revenueChange: 12.5,
      totalOrders: 342,
      ordersChange: 8.3,
      totalCustomers: 1247,
      customersChange: 15.2,
      conversionRate: 3.8,
      conversionChange: -0.5
    })

    setSalesData([
      { date: 'Jan 1', revenue: 12000, orders: 45 },
      { date: 'Jan 8', revenue: 15000, orders: 52 },
      { date: 'Jan 15', revenue: 18000, orders: 61 },
      { date: 'Jan 22', revenue: 22000, orders: 73 },
      { date: 'Jan 29', revenue: 25000, orders: 85 },
      { date: 'Feb 5', revenue: 28000, orders: 92 },
      { date: 'Feb 12', revenue: 32000, orders: 108 }
    ])

    setTopProducts([
      { id: 1, name: 'Premium Hoodie', category: 'Clothing', revenue: 15420, unitsSold: 89, stock: 45 },
      { id: 2, name: 'Wireless Earbuds', category: 'Electronics', revenue: 12350, unitsSold: 156, stock: 12 },
      { id: 3, name: 'Running Shoes', category: 'Sports', revenue: 9870, unitsSold: 67, stock: 8 },
      { id: 4, name: 'Laptop Backpack', category: 'Accessories', revenue: 8540, unitsSold: 92, stock: 23 },
      { id: 5, name: 'Smart Watch', category: 'Electronics', revenue: 7230, unitsSold: 34, stock: 5 }
    ])

    setInventoryAlerts([
      { id: 1, productName: 'Running Shoes', variantSku: 'RS-BLK-42', currentStock: 3, minStock: 10, status: 'critical' },
      { id: 2, productName: 'Smart Watch', variantSku: 'SW-SLV-M', currentStock: 5, minStock: 15, status: 'critical' },
      { id: 3, productName: 'Wireless Earbuds', variantSku: 'WE-WHT-01', currentStock: 12, minStock: 20, status: 'low' },
      { id: 4, productName: 'Laptop Backpack', variantSku: 'LB-GRY-L', currentStock: 23, minStock: 30, status: 'warning' }
    ])
  }

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }: any) => {
    const isPositive = change >= 0
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${
            isPositive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Icon className={`h-6 w-6 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-black text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              timeRange === range
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          icon={DollarSign}
          prefix="₦"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change={stats.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={stats.customersChange}
          icon={Users}
        />
        <StatCard
          title="Conversion Rate"
          value={stats.conversionRate}
          change={stats.conversionChange}
          icon={TrendingUp}
          suffix="%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₦{product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{product.unitsSold} sold</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.stock < 10 ? 'bg-red-100 text-red-700' :
                  product.stock < 20 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {product.stock} left
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Inventory Alerts</h2>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            {inventoryAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  alert.status === 'critical' ? 'bg-red-50 border-red-500' :
                  alert.status === 'low' ? 'bg-orange-50 border-orange-500' :
                  'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{alert.productName}</h3>
                    <p className="text-sm text-gray-600 mt-1">SKU: {alert.variantSku}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">
                        Current: <span className="font-semibold">{alert.currentStock}</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        Min: <span className="font-semibold">{alert.minStock}</span>
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    alert.status === 'critical' ? 'bg-red-100 text-red-700' :
                    alert.status === 'low' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
