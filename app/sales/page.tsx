"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, DollarSign } from "lucide-react"
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

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showDebtsOnly, setShowDebtsOnly] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [currentPage, showDebtsOnly])

  useEffect(() => {
    if (searchTerm) {
      searchSales()
    } else {
      fetchSales()
    }
  }, [searchTerm])

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem("token")
      const endpoint = showDebtsOnly ? "/api/sales/debts" : "/api/sales"
      const skip = (currentPage - 1) * 10

      const response = await fetch(`${endpoint}?skip=${skip}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchSales = async () => {
    if (!searchTerm.trim()) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/sales/search/${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (error) {
      console.error("Error searching sales:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sotuvlar</h1>
            <p className="text-muted-foreground">Barcha sotuvlarni boshqaring</p>
          </div>
          <Link href="/sales/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yangi sotuv
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Mijoz nomi, telefon yoki motor nomi bo'yicha qidiring..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showDebtsOnly ? "default" : "outline"}
                  onClick={() => setShowDebtsOnly(!showDebtsOnly)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Faqat qarzlar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Sotuvlar ro'yxati</CardTitle>
            <CardDescription>{showDebtsOnly ? "Qarzli sotuvlar" : "Barcha sotuvlar"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">
                        {sale.customer_first_name} {sale.customer_last_name}
                      </h3>
                      <Badge variant={sale.is_completed ? "default" : "secondary"}>
                        {sale.is_completed ? "Tugallangan" : "Jarayonda"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <p>Motor: {sale.motor_name}</p>
                      <p>Telefon: {sale.customer_phone}</p>
                      <p>Sana: {formatDate(sale.sale_date)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Sotuv raqami: {sale.sale_number}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(sale.total_price)}</p>
                    <p className="text-sm text-green-600">Oldindan: {formatCurrency(sale.advance_payment)}</p>
                    {sale.remaining_debt > 0 && (
                      <p className="text-sm text-red-600">Qarz: {formatCurrency(sale.remaining_debt)}</p>
                    )}
                    <Link href={`/sales/${sale.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Ko'rish
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {sales.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Qidiruv natijasi topilmadi" : "Hozircha sotuvlar yo'q"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
