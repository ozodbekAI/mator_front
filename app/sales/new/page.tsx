"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default function NewSalePage() {
  const [formData, setFormData] = useState({
    customer_first_name: "",
    customer_last_name: "",
    customer_phone: "",
    motor_name: "",
    total_price: "",
    advance_payment: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          total_price: Number.parseFloat(formData.total_price),
          advance_payment: Number.parseFloat(formData.advance_payment) || 0,
        }),
      })

      if (response.ok) {
        const sale = await response.json()
        router.push(`/sales/${sale.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Sotuv yaratishda xatolik")
      }
    } catch (err) {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setIsLoading(false)
    }
  }

  const remainingDebt = Number.parseFloat(formData.total_price) - Number.parseFloat(formData.advance_payment || "0")

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
          <div>
            <h1 className="text-3xl font-bold">Yangi sotuv</h1>
            <p className="text-muted-foreground">Yangi sotuv ma'lumotlarini kiriting</p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Sotuv ma'lumotlari</CardTitle>
            <CardDescription>Mijoz va motor haqida ma'lumotlarni to'ldiring</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mijoz ma'lumotlari</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_first_name">Ism</Label>
                    <Input
                      id="customer_first_name"
                      name="customer_first_name"
                      type="text"
                      value={formData.customer_first_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_last_name">Familiya</Label>
                    <Input
                      id="customer_last_name"
                      name="customer_last_name"
                      type="text"
                      value={formData.customer_last_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Telefon raqam</Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              {/* Motor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Motor ma'lumotlari</h3>
                <div className="space-y-2">
                  <Label htmlFor="motor_name">Motor nomi</Label>
                  <Input
                    id="motor_name"
                    name="motor_name"
                    type="text"
                    value={formData.motor_name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="Honda CBR 600RR"
                  />
                </div>
              </div>

              {/* Price Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Narx ma'lumotlari</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_price">Umumiy narx (UZS)</Label>
                    <Input
                      id="total_price"
                      name="total_price"
                      type="number"
                      value={formData.total_price}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advance_payment">Oldindan to'lov (UZS)</Label>
                    <Input
                      id="advance_payment"
                      name="advance_payment"
                      type="number"
                      value={formData.advance_payment}
                      onChange={handleChange}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                      max={formData.total_price}
                    />
                  </div>
                </div>

                {formData.total_price && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Qolgan qarz:</span>
                      <span className="font-medium text-lg">
                        {new Intl.NumberFormat("uz-UZ", {
                          style: "currency",
                          currency: "UZS",
                        }).format(remainingDebt || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sotuvni yaratish
                </Button>
                <Link href="/sales">
                  <Button type="button" variant="outline">
                    Bekor qilish
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
