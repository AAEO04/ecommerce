'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Settings, Store, CreditCard, Truck, Bell, Database,
  Check, X, RefreshCw, ShoppingBag, Info, Building, Lock, Eye, EyeOff
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'MAD RUSH',
    tagline: 'NO CHILLS, Just MADRUSH',
    contactEmail: 'contact@Madrush.com.ng',
    phoneNumber: '+1 (555) 123-4567',
    businessAddress: '123 Fashion Street, Style City, SC 12345'
  })

  const [orderSettings, setOrderSettings] = useState({
    orderPrefix: 'ORD',
    autoEmailNotification: true,
    defaultStatus: 'pending',
    requireEmailConfirmation: true
  })

  const [shippingSettings, setShippingSettings] = useState({
    shippingMethod: 'manual',
    estimatedDays: '3-5 business days',
    shippingInstructions: 'Manual delivery - coordinate with customer after order placement'
  })

  const [paymentSettings, setPaymentSettings] = useState({
    acceptedMethods: ['Card Payment', 'Bank Transfer'],
    paystackEnabled: true,
    paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'Not configured',
    bankName: 'First National Bank',
    accountNumber: '1234567890',
    accountName: 'MAD RUSH Store'
  })

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (!passwordSettings.currentPassword || !passwordSettings.newPassword || !passwordSettings.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordSettings.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setSaveStatus('saving')

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordSettings.currentPassword,
          new_password: passwordSettings.newPassword
        })
      })

      if (response.ok) {
        setPasswordSuccess(true)
        setPasswordSettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setSaveStatus('saved')
        setTimeout(() => {
          setPasswordSuccess(false)
          setSaveStatus('idle')
        }, 3000)
      } else {
        const errorData = await response.json()
        setPasswordError(errorData.detail || 'Failed to change password')
        setSaveStatus('error')
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.')
      setSaveStatus('error')
    }
  }

  const handleSave = (section: string) => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'orders', label: 'Order Settings', icon: ShoppingBag },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'system', label: 'System', icon: Database },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Configure your store settings and preferences</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="col-span-9">
            {/* Store Information */}
            {activeTab === 'store' && (
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Manage your store details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={storeSettings.tagline}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={storeSettings.contactEmail}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={storeSettings.phoneNumber}
                      onChange={(e) => setStoreSettings({ ...storeSettings, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                    <textarea
                      value={storeSettings.businessAddress}
                      onChange={(e) => setStoreSettings({ ...storeSettings, businessAddress: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave('store')}
                    disabled={saveStatus === 'saving'}
                    className="admin-btn-primary"
                  >
                    {saveStatus === 'saving' && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                    {saveStatus === 'saved' && <Check className="mr-2 h-4 w-4" />}
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Order Settings */}
            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Settings</CardTitle>
                  <CardDescription>Configure how orders are managed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Number Prefix</label>
                    <input
                      type="text"
                      value={orderSettings.orderPrefix}
                      onChange={(e) => setOrderSettings({ ...orderSettings, orderPrefix: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="ORD"
                    />
                    <p className="mt-1 text-sm text-gray-500">Example: {orderSettings.orderPrefix}-2024-001</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Order Status</label>
                    <select
                      value={orderSettings.defaultStatus}
                      onChange={(e) => setOrderSettings({ ...orderSettings, defaultStatus: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="autoEmail"
                      checked={orderSettings.autoEmailNotification}
                      onChange={(e) => setOrderSettings({ ...orderSettings, autoEmailNotification: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label htmlFor="autoEmail" className="font-medium text-gray-900 cursor-pointer">
                        Auto-send email notifications
                      </label>
                      <p className="text-sm text-gray-500">Automatically notify customers when order status changes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="emailConfirm"
                      checked={orderSettings.requireEmailConfirmation}
                      onChange={(e) => setOrderSettings({ ...orderSettings, requireEmailConfirmation: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label htmlFor="emailConfirm" className="font-medium text-gray-900 cursor-pointer">
                        Require email confirmation
                      </label>
                      <p className="text-sm text-gray-500">Send order confirmation emails to customers</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSave('orders')}
                    disabled={saveStatus === 'saving'}
                    className="admin-btn-primary"
                  >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Shipping Settings */}
            {activeTab === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>Configure delivery and shipping options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                    <div className="flex items-start">
                      <Truck className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium text-blue-900">Manual Delivery Mode</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Deliveries are coordinated manually with customers. Update order status to &quot;Shipped&quot; when ready for delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
                    <select
                      value={shippingSettings.shippingMethod}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, shippingMethod: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="manual">Manual/Local Delivery</option>
                      <option value="pickup">Customer Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Time</label>
                    <input
                      type="text"
                      value={shippingSettings.estimatedDays}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, estimatedDays: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Instructions</label>
                    <textarea
                      value={shippingSettings.shippingInstructions}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, shippingInstructions: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Instructions shown to customers"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave('shipping')}
                    disabled={saveStatus === 'saving'}
                    className="admin-btn-primary"
                  >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure Paystack payment integration and bank transfer details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Paystack Information Banner */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900">Paystack Integration</p>
                        <p className="text-sm text-blue-700 mt-1">
                          All payments are securely processed through Paystack. Supports card payments (Visa, Mastercard, Verve) and bank transfers in Nigerian Naira (₦).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Accepted Payment Methods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Accepted Payment Methods (via Paystack)
                    </label>
                    <div className="space-y-2">
                      {['Card Payment', 'Bank Transfer'].map((method) => (
                        <div key={method} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1">
                            <label className="font-medium text-green-900 cursor-pointer">
                              {method}
                              {method === 'Card Payment' && (
                                <span className="text-sm text-green-700 ml-2">(Visa, Mastercard, Verve)</span>
                              )}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      All payments are processed securely through Paystack with automatic verification
                    </p>
                  </div>

                  {/* Paystack Configuration */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-orange-500" />
                      Paystack Configuration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Public Key Status
                        </label>
                        <div className={`flex items-center gap-2 p-3 border rounded-lg ${paymentSettings.paystackPublicKey !== 'Not configured'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-orange-50 border-orange-200'
                          }`}>
                          {paymentSettings.paystackPublicKey !== 'Not configured' ? (
                            <>
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm text-green-800 font-medium">Configured</span>
                            </>
                          ) : (
                            <>
                              <X className="h-5 w-5 text-orange-600" />
                              <span className="text-sm text-orange-800 font-medium">Not Configured</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in environment variables
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supported Payment Channels
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <CreditCard className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Card Payment (Visa, Mastercard, Verve)</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Building className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Bank Transfer</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <input
                          type="text"
                          value="Nigerian Naira (₦)"
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer Details (Manual Verification) */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Building className="h-5 w-5 text-orange-500" />
                      Bank Transfer Details
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      For customers who prefer direct bank transfer (manual verification required)
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          value={paymentSettings.bankName}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                          placeholder="e.g., Access Bank"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={paymentSettings.accountNumber}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                          placeholder="0123456789"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                        <input
                          type="text"
                          value={paymentSettings.accountName}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, accountName: e.target.value })}
                          placeholder="MAD RUSH E-commerce"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSave('payment')}
                    disabled={saveStatus === 'saving'}
                    className="admin-btn-primary"
                  >
                    {saveStatus === 'saving' && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                    {saveStatus === 'saved' && <Check className="mr-2 h-4 w-4" />}
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and password</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Password Change Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-500" />
                        Change Password
                      </h3>

                      {passwordError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                          <X className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-900">Error</p>
                            <p className="text-sm text-red-700">{passwordError}</p>
                          </div>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900">Success</p>
                            <p className="text-sm text-green-700">Your password has been changed successfully</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordSettings.currentPassword}
                              onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter your current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordSettings.newPassword}
                              onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter your new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordSettings.confirmPassword}
                              onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          onClick={handlePasswordChange}
                          disabled={saveStatus === 'saving'}
                          className="admin-btn-primary"
                        >
                          {saveStatus === 'saving' && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                          {saveStatus === 'saving' ? 'Changing Password...' : 'Change Password'}
                        </Button>
                      </div>
                    </div>

                    {/* Security Tips */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900 mb-2">Password Security Tips</p>
                          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Use a strong password with at least 8 characters</li>
                            <li>Include uppercase and lowercase letters, numbers, and symbols</li>
                            <li>Don't reuse passwords from other accounts</li>
                            <li>Change your password regularly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Status */}
            {activeTab === 'system' && (
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Monitor system health and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900">Admin Panel</p>
                          <p className="text-sm text-green-700">Running smoothly</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Online</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">Database Connection</p>
                          <p className="text-sm text-blue-700">PostgreSQL connected</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Settings className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900">API Services</p>
                          <p className="text-sm text-purple-700">All services operational</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Healthy</span>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">System Information</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Next.js Version:</strong> 14.2.15</p>
                        <p><strong>React Version:</strong> 18.2.0</p>
                        <p><strong>Node Environment:</strong> Production</p>
                        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
