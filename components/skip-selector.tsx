"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  Calendar,
  AlertTriangle,
  MapPin,
  Package,
  AlertCircle,
  Info,
  X,
} from "lucide-react"

interface Skip {
  id: number
  size: number
  hire_period_days: number
  transport_cost: number | null
  per_tonne_cost: number | null
  price_before_vat: number
  vat: number
  postcode: string
  area: string
  forbidden: boolean
  created_at: string
  updated_at: string
  allowed_on_road: boolean
  allows_heavy_waste: boolean
}

interface CartItem extends Skip {
  quantity: number
}

export default function SkipSelector() {
  const [skips, setSkips] = useState<Skip[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [expandedSkip, setExpandedSkip] = useState<number | null>(null)

  useEffect(() => {
    fetchSkips()
  }, [])

  // Update cart visibility when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      setShowCart(true)
    }
  }, [cart])

  const fetchSkips = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://app.wewantwaste.co.uk/api/skips/by-location?postcode=NR32&area=Lowestoft")
      if (!response.ok) {
        throw new Error("Failed to fetch skips")
      }
      const data = await response.json()
      setSkips(data)
    } catch (err) {
      setError("Failed to load skip options. Please try again.")
      console.error("Error fetching skips:", err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (skip: Skip) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === skip.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === skip.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { ...skip, quantity: 1 }]
    })
  }

  const removeFromCart = (skipId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === skipId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) => (item.id === skipId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prevCart.filter((item) => item.id !== skipId)
    })
  }

  const getItemQuantity = (skipId: number) => {
    const item = cart.find((item) => item.id === skipId)
    return item ? item.quantity : 0
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const finalPrice = calculateFinalPrice(item)
      return total + finalPrice * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const calculateFinalPrice = (skip: Skip) => {
    let basePrice = skip.price_before_vat

    // Add extra costs if applicable
    if (skip.transport_cost !== null) basePrice += 20
    if (skip.per_tonne_cost !== null) basePrice += 20

    // Add VAT using API value
    const vatAmount = Math.round(basePrice * (skip.vat / 100))
    const finalPrice = basePrice + vatAmount

    return finalPrice
  }

  const calculatePriceBreakdown = (skip: Skip) => {
    const basePrice = skip.price_before_vat
    let extraCosts = 0

    // Calculate extra costs
    if (skip.transport_cost !== null) extraCosts += 20
    if (skip.per_tonne_cost !== null) extraCosts += 20

    const subtotal = basePrice + extraCosts
    const vatAmount = Math.round(subtotal * (skip.vat / 100))
    const finalPrice = subtotal + vatAmount

    return {
      basePrice,
      extraCosts,
      subtotal,
      vatAmount,
      finalPrice,
    }
  }

  const toggleExpandSkip = (skipId: number) => {
    if (expandedSkip === skipId) {
      setExpandedSkip(null)
    } else {
      setExpandedSkip(skipId)
    }
  }

  const getExtraCostsText = (skip: Skip) => {
    const extraCosts = []
    if (skip.transport_cost !== null) extraCosts.push("Transport cost")
    if (skip.per_tonne_cost !== null) extraCosts.push("Per tonne cost")

    if (extraCosts.length === 0) return null

    return `Includes ${extraCosts.join(" and ")} (£20 each)`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-green-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-xl">Loading skip options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center bg-gray-900 p-8 rounded-xl max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-red-400 mb-6 text-xl">{error}</p>
          <Button onClick={fetchSkips} className="bg-green-600 hover:bg-green-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <div className="bg-green-600 p-2 rounded-lg mr-3">
                  <Truck className="w-6 h-6 text-black" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Choose Your Skip Size</h1>
              </div>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                Select the perfect skip size for your waste management needs
              </p>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 whitespace-nowrap">
              <div className="flex items-center text-green-500">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs">Postcode</span>
              </div>
              <div className="w-4 h-px bg-gray-700"></div>

              <div className="flex items-center text-green-500">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs">Waste Type</span>
              </div>
              <div className="w-4 h-px bg-gray-700"></div>

              <div className="flex items-center text-white">
                <div className="w-3 h-3 rounded-full bg-white mr-2"></div>
                <span className="text-xs font-bold">Select Skip</span>
              </div>
              <div className="w-4 h-px bg-gray-700"></div>

              <div className="flex items-center text-gray-500">
                <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                <span className="text-xs">Permit</span>
              </div>
              <div className="w-4 h-px bg-gray-700"></div>

              <div className="flex items-center text-gray-500">
                <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                <span className="text-xs">Date</span>
              </div>
              <div className="w-4 h-px bg-gray-700"></div>

              <div className="flex items-center text-gray-500">
                <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                <span className="text-xs">Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center text-sm text-gray-400">
            <MapPin className="w-4 h-4 mr-2 text-green-500" />
            <span>Delivering to Lowestoft, NR32</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skip Selection */}
        <div className="grid grid-cols-1 gap-6 mb-24">
          {skips.map((skip) => {
            const quantity = getItemQuantity(skip.id)
            const isSelected = quantity > 0
            const isExpanded = expandedSkip === skip.id
            const finalPrice = calculateFinalPrice(skip)
            const priceBreakdown = calculatePriceBreakdown(skip)
            const extraCostsText = getExtraCostsText(skip)

            return (
              <div
                key={skip.id}
                className={`bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${
                  isSelected ? "border-2 border-green-500" : "border border-gray-800"
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    {/* Skip Size Badge */}
                    <div className="mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 w-full sm:w-24 text-center">
                        <Package className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <div className="text-xl font-bold text-white">{skip.size} Yard</div>
                      </div>
                    </div>

                    {/* Skip Details */}
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="text-xl font-bold text-white mb-2">{skip.size} Yard Skip</h3>
                          <div className="flex items-center text-gray-400 mb-3">
                            <Calendar className="w-4 h-4 mr-2 text-green-500" />
                            <span>{skip.hire_period_days} day hire period</span>
                          </div>

                          {/* Warnings */}
                          <div className="space-y-2 mb-3">
                            {!skip.allowed_on_road && (
                              <Badge className="bg-red-900/50 text-red-300 border border-red-700">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Not allowed on road
                              </Badge>
                            )}
                            {!skip.allows_heavy_waste && (
                              <Badge className="bg-yellow-900/50 text-yellow-300 border border-yellow-700 ml-2">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Not for heavy waste
                              </Badge>
                            )}
                          </div>

                          {isSelected && (
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>

                        {/* Price & Controls */}
                        <div className="text-right">
                          <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                            £{finalPrice}
                            {quantity > 1 && (
                              <div className="text-sm text-green-500">Total: £{finalPrice * quantity}</div>
                            )}
                          </div>

                          {/* Price breakdown */}
                          <div className="text-xs text-gray-400 mb-3">
                            <div>
                              £{priceBreakdown.basePrice} + VAT ({skip.vat}%)
                            </div>
                            {priceBreakdown.extraCosts > 0 && (
                              <div className="text-yellow-500">+ £{priceBreakdown.extraCosts} extra costs</div>
                            )}
                          </div>

                          {/* Extra costs info */}
                          {extraCostsText && (
                            <div className="text-xs text-yellow-500 mb-3 flex items-center justify-end">
                              <Info className="w-3 h-3 mr-1" />
                              {extraCostsText}
                            </div>
                          )}

                          {isSelected ? (
                            <div className="flex items-center justify-end space-x-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(skip.id)}
                                className="border-red-800 text-red-500 hover:bg-red-900 hover:text-white"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-xl font-bold text-white min-w-[2rem] text-center">{quantity}</span>
                              <Button
                                size="sm"
                                onClick={() => addToCart(skip)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(skip)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Select
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Info button */}
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => toggleExpandSkip(skip.id)}
                        >
                          {isExpanded ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Hide details
                            </>
                          ) : (
                            <>
                              <Info className="w-4 h-4 mr-1" />
                              Show details
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-4 bg-gray-800 p-4 rounded-lg text-sm">
                          <h4 className="font-medium text-white mb-3">Skip Details & Price Breakdown</h4>

                          {/* Price Breakdown */}
                          <div className="bg-gray-700 p-3 rounded-lg mb-4">
                            <h5 className="font-medium text-green-400 mb-2">Price Breakdown</h5>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-300">Base Price:</span>
                                <span className="text-white">£{priceBreakdown.basePrice}</span>
                              </div>
                              {priceBreakdown.extraCosts > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Extra Costs:</span>
                                  <span className="text-yellow-400">£{priceBreakdown.extraCosts}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-300">Subtotal:</span>
                                <span className="text-white">£{priceBreakdown.subtotal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300">VAT ({skip.vat}%):</span>
                                <span className="text-white">£{priceBreakdown.vatAmount}</span>
                              </div>
                              <Separator className="my-2 bg-gray-600" />
                              <div className="flex justify-between font-bold">
                                <span className="text-green-400">Total Price:</span>
                                <span className="text-green-400">£{priceBreakdown.finalPrice}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-gray-400">
                                Size: <span className="text-white">{skip.size} Yard</span>
                              </p>
                              <p className="text-gray-400">
                                Hire Period: <span className="text-white">{skip.hire_period_days} days</span>
                              </p>
                              <p className="text-gray-400">
                                Original VAT Rate: <span className="text-white">{skip.vat}%</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">
                                Allowed on Road:
                                <span className={skip.allowed_on_road ? "text-green-500" : "text-red-500"}>
                                  {" "}
                                  {skip.allowed_on_road ? "Yes" : "No"}
                                </span>
                              </p>
                              <p className="text-gray-400">
                                Heavy Waste:
                                <span className={skip.allows_heavy_waste ? "text-green-500" : "text-red-500"}>
                                  {" "}
                                  {skip.allows_heavy_waste ? "Allowed" : "Not Allowed"}
                                </span>
                              </p>
                              <p className="text-gray-400">
                                Transport Cost:
                                <span className="text-white">
                                  {" "}
                                  {skip.transport_cost !== null ? `£20 (Applied)` : "Not Applicable"}
                                </span>
                              </p>
                              <p className="text-gray-400">
                                Per Tonne Cost:
                                <span className="text-white">
                                  {" "}
                                  {skip.per_tonne_cost !== null ? `£20 (Applied)` : "Not Applicable"}
                                </span>
                              </p>
                            </div>
                          </div>

                          {(skip.transport_cost !== null || skip.per_tonne_cost !== null) && (
                            <div className="mt-3 bg-yellow-900/30 border border-yellow-800/50 p-3 rounded text-yellow-300">
                              <p className="flex items-start">
                                <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>
                                  This skip has additional costs:
                                  {skip.transport_cost !== null && " Transport cost (£20)"}
                                  {skip.transport_cost !== null && skip.per_tonne_cost !== null && " and "}
                                  {skip.per_tonne_cost !== null && " Per tonne cost (£20)"}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {cart.length === 0 && (
          <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800 mt-8">
            <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No skips selected yet</h3>
            <p className="text-gray-500">Choose a skip size above to continue</p>
          </div>
        )}
      </div>

      {/* Fixed Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <ShoppingCart className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <div className="font-bold text-white">Your Selection</div>
                  <div className="text-sm text-gray-400">
                    {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""} selected
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="text-center sm:text-right">
                  <div className="text-sm text-gray-400">Total Price (inc. VAT)</div>
                  <div className="text-2xl font-bold text-white">£{getTotalPrice()}</div>
                </div>

                <div className="flex w-full sm:w-auto space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial border-gray-700 text-gray-400 hover:bg-gray-800"
                    onClick={() => setCart([])}
                  >
                    Clear
                  </Button>
                  <Button className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white px-8">
                    Continue
                  </Button>
                </div>
              </div>
            </div>

            {showCart && (
              <>
                <Separator className="my-4 bg-gray-800" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {cart.map((item) => {
                    const itemFinalPrice = calculateFinalPrice(item)
                    const itemBreakdown = calculatePriceBreakdown(item)
                    return (
                      <div key={item.id} className="flex justify-between items-center bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-green-500 mr-2" />
                          <div>
                            <span className="text-gray-300">
                              {item.size} Yard Skip × {item.quantity}
                            </span>
                            <div className="text-xs text-gray-500">
                              £{itemBreakdown.basePrice} + VAT +{" "}
                              {itemBreakdown.extraCosts > 0 ? `£${itemBreakdown.extraCosts} extra` : "no extras"}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-white">£{itemFinalPrice * item.quantity}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
