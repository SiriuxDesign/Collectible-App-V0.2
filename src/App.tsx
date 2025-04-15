import { useState, useEffect } from 'react'
import { Plus, Filter, ChevronDown, ArrowUpDown, Sun, Moon, Info, Check, CheckCircle, List, Trash2 } from 'lucide-react'
import { ItemCard } from './components/ItemCard'
import { ItemForm } from './components/ItemForm'
import { SearchBar } from './components/SearchBar'

interface Item {
  id: string
  name: string
  brand: string
  series: string
  description: string
  acquiredDate: string
  purchasePrice: number
  imageUrl: string
  status: string
  type: string
  rarity: string
  quantity: number
  estimatedValue: number
  isFavorite: boolean
  isDraft?: boolean
}

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'favorites'

export default function App() {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('collectible-items')
    return saved ? JSON.parse(saved) : []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortOption, setSortOption] = useState<SortOption>('name-asc')
  const [isFilterFocused, setIsFilterFocused] = useState(false)
  const [isSortFocused, setIsSortFocused] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })
  const [showItemInfo, setShowItemInfo] = useState(false)
  const [quickSelectMode, setQuickSelectMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkEditField, setBulkEditField] = useState<'status' | 'type' | 'rarity' | null>(null)
  const [bulkEditValue, setBulkEditValue] = useState<string>('')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const draftCount = items.filter(item => item.isDraft).length
  const hasDrafts = draftCount > 0

  useEffect(() => {
    localStorage.setItem('collectible-items', JSON.stringify(items))
    
    if (showDrafts && !hasDrafts) {
      setShowDrafts(false)
    }
  }, [items, showDrafts, hasDrafts])

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter
    const matchesDraftFilter = !showDrafts || item.isDraft
    return matchesSearch && matchesFilter && matchesDraftFilter
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'date-asc':
        return new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime()
      case 'date-desc':
        return new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime()
      case 'favorites':
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      default:
        return 0
    }
  })

  const statusOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'Owned', label: 'Owned' },
    { value: 'Wishlist', label: 'Wishlist' },
    { value: 'Tradeable', label: 'Tradeable' },
    { value: 'Sold', label: 'Sold' }
  ]

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'date-asc', label: 'Date (Oldest)' },
    { value: 'date-desc', label: 'Date (Newest)' },
    { value: 'favorites', label: 'Favorites First' }
  ]

  const typeOptions = ['Single Item', 'One Blind Box (Random)', 'Set of Blind Boxes (Non-Repeat)', 'Accessories']
  const rarityOptions = ['Common', 'Secret', 'Super Secret', 'Limited', 'Rare', 'Ultra Rare']

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleItemInfo = () => {
    setShowItemInfo(!showItemInfo)
  }

  const toggleQuickSelect = () => {
    const newQuickSelectMode = !quickSelectMode
    setQuickSelectMode(newQuickSelectMode)
    
    // Clear selected items when exiting Quick Select mode
    if (!newQuickSelectMode) {
      setSelectedItems([])
      setBulkEditField(null)
      setBulkEditValue('')
    }
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    )
  }

  const handleBulkFieldChange = (field: 'status' | 'type' | 'rarity') => {
    setBulkEditField(field)
    setBulkEditValue('')
  }

  const applyBulkChanges = () => {
    if (!bulkEditField || !bulkEditValue) return
    
    setItems(prevItems => 
      prevItems.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, [bulkEditField]: bulkEditValue }
          : item
      )
    )
    // Reset Quick Select mode after applying changes
    setQuickSelectMode(false)
    setSelectedItems([])
    setBulkEditField(null)
    setBulkEditValue('')
  }

  const deleteSelectedItems = () => {
    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      setItems(prevItems => prevItems.filter(item => !selectedItems.includes(item.id)))
      setSelectedItems([])
      setQuickSelectMode(false)
    }
  }

  const handleSaveItem = (item: Item) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? {...item, isDraft: false} : i))
    } else {
      setItems([...items, {...item, isFavorite: false, isDraft: false}])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleSaveDraft = (item: Item) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? {...item, isDraft: true} : i))
    } else {
      setItems([...items, {...item, isFavorite: false, isDraft: true}])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const handleEdit = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      setEditingItem(item)
      setShowForm(true)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleDuplicate = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id)
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: crypto.randomUUID(),
        name: `${itemToDuplicate.name} (Copy)`,
        isFavorite: false,
        isDraft: false
      }
      setItems([...items, newItem])
    }
  }

  const handleFavorite = (id: string, isFavorite: boolean) => {
    setItems(items.map(item => 
      item.id === id ? {...item, isFavorite} : item
    ))
  }

  const toggleDrafts = () => {
    setShowDrafts(!showDrafts)
    if (!showDrafts) {
      setActiveFilter('all')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <h1 className="text-4xl font-medium text-[#d2001e] dark:text-[#d2001e] ml-4">
            My Collection
          </h1>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => {
                setEditingItem(null)
                setShowForm(true)
              }}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              <Plus size={18} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleItemInfo}
              className={`flex items-center justify-center w-10 h-10 rounded-lg ${showItemInfo ? 'bg-[#d2001e] dark:bg-red-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
              aria-label={showItemInfo ? 'Hide item details' : 'Show item details'}
            >
              <Info size={20} />
            </button>
            <button
              onClick={toggleQuickSelect}
              className={`flex items-center justify-center w-10 h-10 rounded-lg ${quickSelectMode ? 'bg-[#d2001e] dark:bg-red-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'} transition-colors`}
              aria-label={quickSelectMode ? 'Exit quick select mode' : 'Enter quick select mode'}
            >
              <Check size={20} />
            </button>
            {hasDrafts && (
              <button
                onClick={toggleDrafts}
                className={`px-4 py-2 rounded-lg transition-colors ${showDrafts ? 'bg-[#d2001e] dark:bg-red-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Drafts ({draftCount})
              </button>
            )}
            <div className="relative">
              <label className="relative block w-full">
                <div 
                  className={`flex items-center gap-2 border-2 ${isFilterFocused ? 'border-[#d2001e] dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-3 py-2 cursor-pointer bg-white dark:bg-gray-800`}
                >
                  <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    onFocus={() => setIsFilterFocused(true)}
                    onBlur={() => setIsFilterFocused(false)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    disabled={showDrafts}
                  >
                    {statusOptions.map(option => (
                      <option 
                        key={option.value} 
                        value={option.value}
                        disabled={showDrafts && option.value === 'all'}
                        className={showDrafts && option.value === 'all' ? 'text-gray-400' : ''}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className={`flex-1 ${showDrafts && activeFilter === 'all' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                    {statusOptions.find(opt => opt.value === activeFilter)?.label}
                  </span>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </label>
            </div>
            <div className="relative">
              <label className="relative block w-full">
                <div 
                  className={`flex items-center gap-2 border-2 ${isSortFocused ? 'border-[#d2001e] dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-3 py-2 cursor-pointer bg-white dark:bg-gray-800`}
                >
                  <ArrowUpDown size={18} className="text-gray-500 dark:text-gray-400" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    onFocus={() => setIsSortFocused(true)}
                    onBlur={() => setIsSortFocused(false)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="flex-1 text-gray-700 dark:text-gray-200">
                    {sortOptions.find(opt => opt.value === sortOption)?.label}
                  </span>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </label>
            </div>
          </div>
        </div>

        {quickSelectMode && selectedItems.length > 0 && (
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between select-none"
            onMouseDown={(e) => {
              const target = e.target as HTMLElement
              if (!target.classList.contains('focusable-element')) {
                e.preventDefault()
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {selectedItems.length} item(s) selected
              </div>

          </div>

          <button
            onClick={deleteSelectedItems}
            className="focusable-element flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map(item => (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              series={item.series}
              imageUrl={item.imageUrl}
              acquiredDate={item.acquiredDate}
              status={item.status}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onFavorite={handleFavorite}
              isFavorite={item.isFavorite || false}
              showInfo={showItemInfo}
              brand={item.brand}
              description={item.description}
              purchasePrice={item.purchasePrice}
              type={item.type}
              rarity={item.rarity}
              quantity={item.quantity}
              estimatedValue={item.estimatedValue}
              quickSelectMode={quickSelectMode}
              isSelected={selectedItems.includes(item.id)}
              onSelect={toggleItemSelection}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {items.length === 0 ? 'Your collection is empty. Add your first item!' : 'No items match your search.'}
          </p>
        </div>
      )}
    </main>

    {showForm && (
      <ItemForm
        initialData={editingItem || undefined}
        onSave={handleSaveItem}
        onCancel={() => {
          setShowForm(false)
          setEditingItem(null)
        }}
        onSaveDraft={handleSaveDraft}
      />
    )}
  </div>
)
}
