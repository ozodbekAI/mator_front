"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, DollarSign, Phone, Calendar, User, Car } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

interface Sale {
  id: number
  sale_number: string
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  motor_name: string
  total_price: number
  advance_payment: number
  remaining_debt: number
  is_completed: boolean
  sale_date: string
}

interface Payment {
  id: number
  sale_id: number
  amount: number
  payment_date: string
  description?: string
}

export default function SaleDetailPage() {
  const params = useParams()
  const saleId = params.id as string

  const [sale, setSale] = useState<Sale | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDescription, setPaymentDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSaleDetails()
    fetchPayments()
  }, [saleId])

  const fetchSaleDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/sales/${saleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSale(data)
      }
    } catch (error) {
      console.error("Error fetching sale details:", error)
    }
  }

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/payments/sale/${saleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
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
          sale_id: Number.parseInt(saleId),
          amount: Number.parseFloat(paymentAmount),
          description: paymentDescription || null,
        }),
      })

      if (response.ok) {
        setPaymentAmount("")
        setPaymentDescription("")
        setShowPaymentForm(false)
        fetchSaleDetails()
        fetchPayments()
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Yuklanmoqda...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!sale) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Sotuv topilmadi</p>
          <Link href="/sales">
            <Button className="mt-4">Sotuvlar ro'yxatiga qaytish</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/sales">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Sotuv tafsilotlari</h1>
            <p className="text-muted-foreground">Sotuv raqami: {sale.sale_number}</p>
          </div>
          <Badge variant={sale.is_completed ? "default" : "secondary"} className="text-sm">
            {sale.is_completed ? "Tugallangan" : "Jarayonda"}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sale Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mijoz ma'lumotlari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">To'liq ism</Label>
                    <p className="text-lg font-medium">
                      {sale.customer_first_name} {sale.customer_last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Telefon raqam</Label>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {sale.customer_phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Motor ma'lumotlari
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Motor nomi</Label>
                  <p className="text-lg font-medium">{sale.motor_name}</p>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Sotuv sanasi</Label>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(sale.sale_date)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payments History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>To'lovlar tarixi</CardTitle>
                  {!sale.is_completed && (
                    <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                      <Plus className="mr-2 h-4 w-4" />
                      To'lov qo'shish
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showPaymentForm && (
                  <Card>
                    <CardContent className="pt-6">
                      <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="amount">To'lov miqdori (UZS)</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            required
                            min="0"
                            max={sale.remaining_debt}
                            step="0.01"
                            disabled={isSubmitting}
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
                          <Button type="submit" disabled={isSubmitting}>
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

                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(payment.payment_date)}</p>
                        {payment.description && <p className="text-sm text-muted-foreground">{payment.description}</p>}
                      </div>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  ))}

                  {payments.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">Hozircha to'lovlar yo'q</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Narx ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Umumiy narx:</span>
                  <span className="font-medium">{formatCurrency(sale.total_price)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Oldindan to'lov:</span>
                  <span className="font-medium text-green-600">{formatCurrency(sale.advance_payment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Qo'shimcha to'lovlar:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Qolgan qarz:</span>
                  <span className={`font-bold ${sale.remaining_debt > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(sale.remaining_debt)}
                  </span>
                </div>

                {sale.is_completed && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium text-center">✅ To'liq to'langan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
