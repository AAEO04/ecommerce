'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { adminApi } from '@/lib/admin/api'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string
    customer: string
    amount: string
    status: string
  }>>([])

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        const response = await adminApi.getDashboardStats()
        if (response.success && response.data) {
          setStats({
            totalProducts: response.data.totalProducts,
            totalOrders: response.data.totalOrders,
            totalCustomers: response.data.totalCustomers,
            revenue: response.data.revenue,
          })
          setRecentOrders(response.data.recentOrders || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statsCards = [
    {
      name: 'Total Products',
      value: loading ? '...' : stats.totalProducts.toString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Package,
    },
    {
      name: 'Total Orders',
      value: loading ? '...' : stats.totalOrders.toLocaleString(),
      change: '+8%',
      changeType: 'increase' as const,
      icon: ShoppingBag,
    },
    {
      name: 'Total Customers',
      value: loading ? '...' : stats.totalCustomers.toLocaleString(),
      change: '+15%',
      changeType: 'increase' as const,
      icon: Users,
    },
    {
      name: 'Revenue',
      value: loading ? '...' : `₦${stats.revenue.toLocaleString()}`,
      change: '+23%',
      changeType: 'increase' as const,
      icon: DollarSign,
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="mt-3 text-base text-gray-600 max-w-3xl">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {stat.name}
                  </CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">from last month</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Orders and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="admin-loading"></div>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{order.amount}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No recent orders</p>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Alerts
              </CardTitle>
              <CardDescription>
                Important notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Low Stock Alert
                    </p>
                    <p className="text-sm text-orange-700">
                      Check inventory levels for low stock items
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Sales Update
                    </p>
                    <p className="text-sm text-green-700">
                      {loading ? 'Loading...' : `${stats.totalProducts} products currently available`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
