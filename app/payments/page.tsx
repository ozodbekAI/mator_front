"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Search, Plus } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

interface Payment {
  id: number
  sale_id: number
  amount: number
  payment_date: string
  description?: string
  sale?: {
    sale_number: string
    customer_first_name: string
    customer_last_name: string
    motor_name: string
  }
}

interface Sale {
  id: number
  sale_number: string
  customer_first_name: string
  customer_last_name: string
  motor_name: string
  remaining_debt: number
  is_completed: boolean
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDescription, setPaymentDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch all sales with debts for payment form
      const salesResponse = await fetch("/api/sales/debts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (salesResponse.ok) {
        const salesData = await salesResponse.json()
        setSales(salesData)
      }

      // For now, we'll simulate payments data since there's no endpoint to get all payments
      // In a real app, you'd have an endpoint like /api/payments
      setPayments([])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sale_id: Number.parseInt(selectedSaleId),
          amount: Number.parseFloat(paymentAmount),
          description: paymentDescription || null,
        }),
      })

      if (response.ok) {
        setPaymentAmount("")
        setPaymentDescription("")
        setSelectedSaleId("")
        setShowPaymentForm(false)
        fetchData()
        // Show success message
        alert("To'lov muvaffaqiyatli qo'shildi!")
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "To'lov qo'shishda xatolik")
      }
    } catch (err) {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.motor_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">To'lovlar</h1>
            <p className="text-muted-foreground">To'lovlarni boshqaring va yangi to'lov qo'shing</p>
          </div>
          <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi to'lov
          </Button>
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <Card>
            <CardHeader>
              <CardTitle>Yangi to'lov qo'shish</CardTitle>
              <CardDescription>Qarzli sotuvlar uchun to'lov qo'shing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sale">Sotuvni tanlang</Label>
                  <select
                    id="sale"
                    value={selectedSaleId}
                    onChange={(e) => setSelectedSaleId(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Sotuvni tanlang...</option>
                    {filteredSales.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        {sale.customer_first_name} {sale.customer_last_name} - {sale.motor_name} (
                        {formatCurrency(sale.remaining_debt)} qarz)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">To'lov miqdori (UZS)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                    max={
                      selectedSaleId
                        ? sales.find((s) => s.id === Number.parseInt(selectedSaleId))?.remaining_debt
                        : undefined
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Izoh (ixtiyoriy)</Label>
                  <Input
                    id="description"
                    type="text"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="To'lov haqida qo'shimcha ma'lumot"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting || !selectedSaleId}>
                    {isSubmitting ? "Saqlanmoqda..." : "To'lovni saqlash"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mijoz nomi yoki sotuv raqami bo'yicha qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Debt Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Qarzli sotuvlar</CardTitle>
            <CardDescription>To'lov kutilayotgan sotuvlar ro'yxati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">
                        {sale.customer_first_name} {sale.customer_last_name}
                      </h3>
                      <Badge variant="secondary">Qarzli</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p>Motor: {sale.motor_name}</p>
                      <p>Sotuv raqami: {sale.sale_number}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium text-red-600">{formatCurrency(sale.remaining_debt)}</p>
                    <p className="text-sm text-muted-foreground">Qolgan qarz</p>
                    <Link href={`/sales/${sale.id}`}>
                      <Button size="sm" variant="outline">
                        <DollarSign className="mr-2 h-4 w-4" />
                        To'lov qo'shish
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {filteredSales.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Qidiruv natijasi topilmadi" : "Qarzli sotuvlar yo'q"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>So'nggi to'lovlar</CardTitle>
            <CardDescription>Eng so'nggi amalga oshirilgan to'lovlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              To'lovlar tarixi uchun alohida API endpoint kerak
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
