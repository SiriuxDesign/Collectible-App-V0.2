import { Edit, Trash2, Copy, Heart, Info, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface ItemCardProps {
  id: string
  name: string
  series: string
  imageUrl: string
  acquiredDate: string
  status: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onFavorite: (id: string, isFavorite: boolean) => void
  isFavorite: boolean
  showInfo: boolean
  brand: string
  description: string
  purchasePrice: number
  type: string
  rarity: string
  quantity: number
  estimatedValue: number
  quickSelectMode: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  totalBoxesInSet?: number
  soldPrice?: number
  condition?: string
  authenticity?: string
  tags?: string[]
}

export function ItemCard({
  id,
  name,
  series,
  imageUrl,
  acquiredDate,
  status,
  onEdit,
  onDelete,
  onDuplicate,
  onFavorite,
  isFavorite: initialFavorite,
  showInfo,
  brand,
  description,
  purchasePrice,
  type,
  rarity,
  quantity,
  estimatedValue,
  quickSelectMode,
  isSelected,
  onSelect,
  totalBoxesInSet = 0,
  soldPrice = 0,
  condition = '',
  authenticity = '',
  tags = [],
}: ItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const handleFavorite = () => {
    const newFavoriteStatus = !isFavorite
    setIsFavorite(newFavoriteStatus)
    onFavorite(id, newFavoriteStatus)
  }

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (quickSelectMode) {
      e.preventDefault()
      onSelect(id)
    }
  }

  const displayedDescription = showFullDescription 
    ? description 
    : description.length > 100 
      ? `${description.substring(0, 100)}...` 
      : description

  const showTotalBoxesField = ['Blind Box Single', 'Blind Box Set', 'Set Item'].includes(type)
  const isTradeable = status === 'Tradeable'
  const isWishlist = ['Wishlist'].includes(status)
  const isSold = status === 'Sold'

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg flex flex-col h-full relative ${
        isSelected ? 'ring-2 ring-[#d2001e] dark:ring-red-500' : ''
      } ${quickSelectMode ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-square select-none">
        <img
          src={imageUrl || ''}
          alt={name}
          className="w-full h-full object-cover bg-gray-100 dark:bg-gray-700"
        />
        {status && (
          <div className="absolute top-2 right-2 bg-[#d2001e] text-white text-xs px-2 py-1 rounded-full">
            {status}
          </div>
        )}
        {quickSelectMode && (
          <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-[#d2001e] text-white' : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200'
          }`}>
            {isSelected && <CheckCircle size={16} />}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{series}</p>
          
          {showInfo && (
            <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Brand:</span> {brand || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> {status}</p>
              <p><span className="font-medium">Type:</span> {type}</p>
              {condition && <p><span className="font-medium">Condition:</span> {condition}</p>}
              {authenticity && <p><span className="font-medium">Authenticity:</span> {authenticity}</p>}
              <p><span className="font-medium">Rarity:</span> {rarity}</p>
              <p><span className="font-medium">Acquired:</span> {formatDate(acquiredDate)}</p>
              
              {isTradeable && (
                <p><span className="font-medium">Estimated Value:</span> ${estimatedValue.toFixed(2)}</p>
              )}
              {isSold && (
                <p><span className="font-medium">Sold Price:</span> ${soldPrice.toFixed(2)}</p>
              )}
              {!isWishlist && !isSold && (
                <p><span className="font-medium">Purchase Price:</span> ${purchasePrice.toFixed(2)}</p>
              )}
              {showTotalBoxesField && totalBoxesInSet > 0 && (
                <p><span className="font-medium">Total in Set:</span> {totalBoxesInSet}</p>
              )}
              
              {tags.length > 0 && (
                <div>
                  <p className="font-medium">Tags:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {description && (
                <div>
                  <p className="font-medium">Notes:</p>
                  <p className="text-sm">
                    {displayedDescription}
                    {description.length > 100 && (
                      <button 
                        onClick={toggleDescription}
                        className="ml-1 text-[#d2001e] dark:text-red-400 hover:underline"
                      >
                        {showFullDescription ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleFavorite}
            className={`p-1 ${
              isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            } transition-colors`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
              e.stopPropagation()
              onEdit(id)
            }}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Edit item"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(id)
            }}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Duplicate item"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            aria-label="Delete item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}
