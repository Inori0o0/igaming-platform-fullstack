import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbProduct } from '@/types'

export type ProductCategory = 'apparel' | 'digital' | 'collectible'
export type FulfillmentType = 'physical' | 'digital'

export interface ProductFormValues {
  name: string
  slug: string
  description: string
  category: ProductCategory
  fulfillment_type: FulfillmentType
  is_avatar: boolean
  price_vac: string
  is_active: boolean
  force_sold_out: boolean
  sort_order: string
}

export type FormErrors = Partial<Record<keyof ProductFormValues | 'image', string>>

const EMPTY_FORM: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  category: 'digital',
  fulfillment_type: 'digital',
  is_avatar: false,
  price_vac: '0',
  is_active: true,
  force_sold_out: false,
  sort_order: '0',
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function useProductForm(onSuccess: () => void) {
  const [open, setOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null)
  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // 裁切 modal 狀態：rawSrc 為選擇後尚未裁切的原始 blob URL
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setEditingProduct(null)
    setValues(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setErrors({})
    setOpen(true)
  }, [])

  const openEdit = useCallback((product: DbProduct) => {
    setEditingProduct(product)
    setValues({
      name: product.name,
      slug: product.slug ?? '',
      description: product.description ?? '',
      category: (product.category as ProductCategory) ?? 'digital',
      fulfillment_type: (product.fulfillment_type as FulfillmentType) ?? 'digital',
      is_avatar: product.is_avatar,
      price_vac: String(product.price_vac ?? 0),
      is_active: product.is_active,
      force_sold_out: product.force_sold_out,
      sort_order: String(product.sort_order),
    })
    setImageFile(null)
    setImagePreview(product.image_url)
    setErrors({})
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setEditingProduct(null)
  }, [])

  const handleNameChange = useCallback((name: string) => {
    setValues(prev => ({
      ...prev,
      name,
      // Auto-sync slug only if it matches the previous auto-generated value
      slug: prev.slug === toSlug(prev.name) || prev.slug === '' ? toSlug(name) : prev.slug,
    }))
  }, [])

  const handleCategoryChange = useCallback((category: ProductCategory) => {
    setValues(prev => ({
      ...prev,
      category,
      fulfillment_type: category === 'apparel' ? 'physical' : 'digital',
      is_avatar: category !== 'digital' ? false : prev.is_avatar,
    }))
  }, [])

  // 用戶選擇檔案後先開裁切 modal，不直接設為 imageFile
  const handleImageChange = useCallback((file: File) => {
    setCropSrc(URL.createObjectURL(file))
  }, [])

  // 裁切確認：接收 canvas 產生的 WebP Blob
  const handleCropConfirm = useCallback((blob: Blob) => {
    const croppedFile = new File([blob], `product_${Date.now()}.webp`, { type: 'image/webp' })
    setImageFile(croppedFile)
    setImagePreview(URL.createObjectURL(blob))
    setCropSrc(null)
  }, [])

  const handleCropCancel = useCallback(() => {
    setCropSrc(null)
  }, [])

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!values.name.trim()) e.name = '商品名稱必填'
    if (!values.slug.trim()) e.slug = 'Slug 必填'
    if (isNaN(Number(values.price_vac)) || Number(values.price_vac) < 0) {
      e.price_vac = '請輸入有效金額（≥ 0）'
    }
    if (!editingProduct && !imageFile) e.image = '請上傳商品圖片'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const uploadImage = async (slug: string): Promise<{ path: string; url: string }> => {
    if (!imageFile) throw new Error('no file')
    const ext = imageFile.name.split('.').pop() ?? 'png'
    const path = `products/${slug}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('shop-products')
      .upload(path, imageFile, { upsert: true })
    if (error) throw new Error(`圖片上傳失敗：${error.message}`)
    const { data } = supabase.storage.from('shop-products').getPublicUrl(path)
    return { path, url: data.publicUrl }
  }

  const submit = useCallback(async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const slug = values.slug || toSlug(values.name)
      let imagePath = editingProduct?.image_object_path ?? null
      let imageUrl = editingProduct?.image_url ?? null

      if (imageFile) {
        const uploaded = await uploadImage(slug)
        imagePath = uploaded.path
        imageUrl = uploaded.url
      }

      const payload = {
        name: values.name.trim(),
        slug,
        description: values.description.trim(),
        category: values.category,
        fulfillment_type: values.fulfillment_type,
        is_avatar: values.is_avatar,
        price_vac: Number(values.price_vac),
        price: Number(values.price_vac),
        is_active: values.is_active,
        force_sold_out: values.force_sold_out,
        sort_order: Number(values.sort_order),
        image_bucket: 'shop-products',
        image_object_path: imagePath,
        image_url: imageUrl,
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        // Create default variant for non-apparel (apparel sizes managed via StockDrawer)
        if (values.category !== 'apparel') {
          await supabase.from('product_variants').insert({
            product_id: data.id,
            size: null,
            stock_quantity: 0,
          })
        }
      }

      onSuccess()
      close()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '操作失敗，請重試'
      setErrors(prev => ({ ...prev, _global: msg } as FormErrors))
    } finally {
      setSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, imageFile, editingProduct, onSuccess, close])

  return {
    open,
    editingProduct,
    values,
    imagePreview,
    submitting,
    errors,
    cropSrc,
    openCreate,
    openEdit,
    close,
    handleNameChange,
    handleCategoryChange,
    handleImageChange,
    handleCropConfirm,
    handleCropCancel,
    setValues,
    submit,
  }
}
