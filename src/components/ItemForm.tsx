import { useState, useCallback, useRef, ChangeEvent, DragEvent } from 'react'
import { X, ImagePlus, Upload, Loader2, Plus, X as XIcon } from 'lucide-react'

interface ItemFormProps {
  initialData?: {
    id: string
    name: string
    brand: string
    series: string
    description: string
    acquiredDate: string
    purchasePrice: number
    soldPrice?: number
    imageUrl: string
    status: string
    type: string
    rarity: string
    quantity: number
    estimatedValue: number
    isDraft?: boolean
    totalBoxesInSet?: number
    condition?: string
    authenticity?: string
    tags?: string[]
  }
  onSave: (data: any) => void
  onCancel: () => void
  onSaveDraft: (data: any) => void
}

const statusOptions = ['Owned', 'Wishlist', 'Tradeable', 'Sold']
const typeOptions = ['Blind Box Single', 'Blind Box Set', 'Single Item', 'Set Item', 'Mega', 'Accessories', 'Custom']
const rarityOptions = ['Common', 'Secret', 'Super Secret', 'Limited', 'Rare', 'Ultra Rare']
const conditionOptions = ['Mint', 'Good', 'Fair', 'Damaged', 'Brand New in Box', 'Unopen Damaged Box']
const authenticityOptions = ['Real', 'Fake', 'Not Sure']
const MAX_TAGS = 6

export function ItemForm({ initialData, onSave, onCancel, onSaveDraft }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    series: initialData?.series || '',
    description: initialData?.description || '',
    acquiredDate: initialData?.acquiredDate || new Date().toISOString().split('T')[0],
    purchasePrice: initialData?.purchasePrice || 0,
    soldPrice: initialData?.soldPrice || 0,
    imageUrl: initialData?.imageUrl || '',
    status: initialData?.status || 'Owned',
    type: initialData?.type || 'Blind Box Single',
    rarity: initialData?.rarity || 'Common',
    estimatedValue: initialData?.estimatedValue || 0,
    totalBoxesInSet: initialData?.totalBoxesInSet || 0,
    condition: initialData?.condition || 'Mint',
    authenticity: initialData?.authenticity || 'Real',
    isDraft: initialData?.isDraft || false,
    tags: initialData?.tags || [],
  })
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [newTag, setNewTag] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showTotalBoxesField = ['Blind Box Single', 'Blind Box Set', 'Set Item'].includes(formData.type)
  const isTradeable = formData.status === 'Tradeable'
  const isWishlist = ['Wishlist'].includes(formData.status)
  const isSold = formData.status === 'Sold'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['purchasePrice', 'estimatedValue', 'soldPrice'].includes(name) 
        ? parseFloat(value) || 0 
        : ['totalBoxesInSet'].includes(name)
          ? parseInt(value) || 0
          : value,
    }))
  }

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? '' : parseInt(value) || 0
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }))
  }

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }))
      return
    }
    const numValue = parseFloat(value) || 0
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanedData = {
      ...formData,
      purchasePrice: formData.purchasePrice === '' ? 0 : formData.purchasePrice,
      soldPrice: formData.soldPrice === '' ? 0 : formData.soldPrice,
      estimatedValue: formData.estimatedValue === '' ? 0 : formData.estimatedValue,
      id: initialData?.id || crypto.randomUUID(),
      isDraft: false
    }
    onSave(cleanedData)
  }

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault()
    const cleanedData = {
      ...formData,
      purchasePrice: formData.purchasePrice === '' ? 0 : formData.purchasePrice,
      soldPrice: formData.soldPrice === '' ? 0 : formData.soldPrice,
      estimatedValue: formData.estimatedValue === '' ? 0 : formData.estimatedValue,
      id: initialData?.id || crypto.randomUUID(),
      isDraft: true
    }
    onSaveDraft(cleanedData)
  }

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.match('image.*') ) {
      alert('Please select an image file')
      return
    }

    setIsUploading(true)
    
    setTimeout(() => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
      imageUrl: e.target?.result as string || ''
    }))
    setIsUploading(false)
  }
  reader.readAsDataURL(file)
}, 1000)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addTag = () => {
    if (newTag.trim() && formData.tags.length < MAX_TAGS) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 select-none">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => {
          const target = e.target as HTMLElement
          if (!target.classList.contains('focusable-element')) {
            e.preventDefault()
          }
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? 'Edit Item' : 'Add New Item'}
              </h2>
              {formData.isDraft && (
                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Draft
                </span>
              )}
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-red-600 transition-colors select-none"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Image
              </label>
              <div 
                className={`relative border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-gray-500" size={24} />
                    <p className="text-sm text-gray-500">Uploading image...</p>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
      className="w-full h-40 object-contain mx-auto rounded"
    />
    <div className="mt-2 text-sm text-gray-500">
      Click or drag to change image
    </div>
  </div>
) : (
  <div className="flex flex-col items-center justify-center gap-2">
    <Upload className="text-gray-400" size={24} />
    <p className="text-sm text-gray-500">
      Drag & drop an image here, or click to select
    </p>
    <p className="text-xs text-gray-400">
      Supports JPG, PNG up to 5MB
    </p>
  </div>
)}
</div>
</div>

<div className="grid grid-cols-1 gap-4 mb-4">
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Series Collection*
    </label>
    <input
      type="text"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Character Variation
    </label>
    <input
      type="text"
      name="series"
      value={formData.series}
      onChange={handleChange}
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Brand
    </label>
    <input
      type="text"
      name="brand"
      value={formData.brand}
      onChange={handleChange}
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    />
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Status
    </label>
    <select
      name="status"
      value={formData.status}
      onChange={handleChange}
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    >
      {statusOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Type
    </label>
    <select
      name="type"
      value={formData.type}
      onChange={handleChange}
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    >
      {typeOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Condition
    </label>
    <select
      name="condition"
      value={formData.condition}
      onChange={handleChange}
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    >
      {conditionOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>

  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Authenticity
    </label>
    <select
      name="authenticity"
      value={formData.authenticity}
      onChange={handleChange}
      className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    >
      {authenticityOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
</div>

{showTotalBoxesField ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Rarity
      </label>
      <select
        name="rarity"
        value={formData.rarity}
        onChange={handleChange}
        className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
      >
        {rarityOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Total Boxes in Collection Set
      </label>
      <input
        type="number"
        name="totalBoxesInSet"
        value={formData.totalBoxesInSet || ''}
        onChange={handleNumberInput}
        min="1"
        placeholder="Enter total items in series, even if not owned"
        className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder-gray-400"
      />
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Rarity
      </label>
      <select
        name="rarity"
        value={formData.rarity}
        onChange={handleChange}
        className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
      >
        {rarityOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  </div>
)}

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Acquired Date
    </label>
    <input
      type="date"
      name="acquiredDate"
      value={formData.acquiredDate}
      onChange={handleChange}
      className="flexible-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    />
  </div>
  
  {!isWishlist && (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Purchase Price ($)
      </label>
      <input
        type="number"
        name="purchasePrice"
        value={formData.purchasePrice === '' ? '' : formData.purchasePrice}
        onChange={handlePriceInput}
        min="0"
        step="1.00"
        className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
    </div>
  )}
  
  {isSold && (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Sold Price ($)
      </label>
      <input
        type="number"
        name="soldPrice"
        value={formData.soldPrice === '' ? '' : formData.soldPrice}
        onChange={handlePriceInput}
        min="0"
        step="0.01"
        className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
    </div>
  )}
  
  {isTradeable && (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Estimated Value ($)
      </label>
      <input
        type="number"
        name="estimatedValue"
        value={formData.estimatedValue === '' ? '' : formData.estimatedValue}
        onChange={handlePriceInput}
        min="0"
        step="0.01"
        className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
    </div>
  )}
</div>

<div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-1">
    Tags
  </label>
  <div className="flex flex-wrap gap-2 mb-2">
    {formData.tags.map((tag, index) => (
      <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
        <span>{tag}</span>
        <button
          type="button"
          onClick={() => removeTag(index)}
          className="ml-1 text-gray-500 hover:text-red-500 select-none"
        >
          <XIcon size={14} />
        </button>
      </div>
    ))}
  </div>
  {formData.tags.length < MAX_TAGS && (
    <div className="flex gap-2">
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleTagKeyDown}
        placeholder="Add a tag"
        className="focusable-element flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={addTag}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 select-none"
      >
        <Plus size={16} />
      </button>
    </div>
  )}
  <p className="text-xs text-gray-500 mt-1">
    {formData.tags.length}/{MAX_TAGS} tags added
  </p>
</div>

<div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-1">
    Notes
  </label>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    rows={3}
    className="focusable-element w-full border border-gray-300 rounded px-3 py-2 text-sm"
    placeholder="Any additional notes about this item..."
  />
</div>

<div className="flex justify-end gap-2 pt-4">
  <button
    type="button"
    onClick={onCancel}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 select-none"
  >
    Cancel
  </button>
  <button
    type="button"
    onClick={handleSaveDraft}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-300 rounded hover:bg-gray-400 select-none"
  >
    Save Draft
  </button>
  <button
    type="submit"
    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 select-none"
  >
    Save Item
  </button>
</div>
</form>
</div>
</div>
</div>
)
}
