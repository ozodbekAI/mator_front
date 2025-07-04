"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, TrendingUp, Plus, CheckCircle } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

interface DashboardStats {
  total_sales: number
  completed_sales: number
  pending_sales: number
  total_debt: number
  total_paid: number
  total_revenue: number
}

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch dashboard stats
      const statsResponse = await fetch("/api/stats/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch recent sales
      const salesResponse = await fetch("/api/sales?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (statsResponse.ok && salesResponse.ok) {
        const statsData = await statsResponse.json()
        const salesData = await salesResponse.json()

        console.log("Stats data:", statsData) // Debug uchun
        setStats(statsData)
        setRecentSales(salesData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
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
            <h1 className="text-3xl font-bold">Boshqaruv paneli</h1>
            <p className="text-muted-foreground">Motor Shop boshqaruv tizimi</p>
          </div>
          <div className="flex gap-2">
            <Link href="/sales/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yangi sotuv
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami sotuvlar</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_sales || 0}</div>
              <p className="text-xs text-muted-foreground">Barcha vaqt davomida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami daromad</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</div>
              <p className="text-xs text-muted-foreground">Barcha vaqt davomida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qarzlar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats?.total_debt || 0)}</div>
              <p className="text-xs text-muted-foreground">To'lanmagan qarzlar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tugallangan</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completed_sales || 0}</div>
              <p className="text-xs text-muted-foreground">To'liq to'langan sotuvlar</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To'langan summa</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.total_paid || 0)}</div>
              <p className="text-xs text-muted-foreground">Jami to'langan to'lovlar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kutilayotgan sotuvlar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.pending_sales || 0}</div>
              <p className="text-xs text-muted-foreground">Tugallanmagan sotuvlar</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>So'nggi sotuvlar</CardTitle>
            <CardDescription>Eng so'nggi amalga oshirilgan sotuvlar ro'yxati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {sale.customer_first_name} {sale.customer_last_name}
                      </h3>
                      <Badge variant={sale.is_completed ? "default" : "secondary"}>
                        {sale.is_completed ? "Tugallangan" : "Jarayonda"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sale.motor_name} • {sale.sale_number}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(sale.sale_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(sale.total_price)}</p>
                    {sale.remaining_debt > 0 && (
                      <p className="text-sm text-red-600">Qarz: {formatCurrency(sale.remaining_debt)}</p>
                    )}
                  </div>
                </div>
              ))}

              {recentSales.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">Hozircha sotuvlar yo'q</div>
              )}
            </div>

            <div className="mt-4">
              <Link href="/sales">
                <Button variant="outline" className="w-full bg-transparent">
                  Barcha sotuvlarni ko'rish
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
