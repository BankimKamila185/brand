'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  Filter,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_COLLECTIONS, DashboardProduct } from '../mockData';

// Zod Schema for validation
const productFormSchema = z.object({
  title: z.string().min(2, { message: 'Product title must be at least 2 characters.' }),
  slug: z.string().regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and dashes.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  categoryName: z.string().min(1, { message: 'Category is required.' }),
  collectionName: z.string().min(1, { message: 'Collection is required.' }),
  brand: z.string(),
  tags: z.string(),
  price: z.number().positive({ message: 'Price must be a positive number.' }),
  comparePrice: z.number(),
  costPrice: z.number().positive({ message: 'Cost price must be a positive number.' }),
  sku: z.string().min(3, { message: 'SKU is required.' }),
  barcode: z.string(),
  inventory: z.number().int().nonnegative({ message: 'Inventory must be 0 or more.' }),
  sizes: z.array(z.string()).min(1, { message: 'Select at least one size.' }),
  colors: z.array(z.string()).min(1, { message: 'Select at least one color.' }),
  weight: z.number().positive({ message: 'Weight must be a positive number.' }),
  seoTitle: z.string(),
  seoDescription: z.string(),
  isActive: z.boolean()
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<DashboardProduct[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DashboardProduct | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      categoryName: MOCK_CATEGORIES[0]?.name || '',
      collectionName: MOCK_COLLECTIONS[0]?.name || '',
      brand: 'House of Koala',
      tags: '',
      price: 0,
      comparePrice: 0,
      costPrice: 0,
      sku: '',
      barcode: '',
      inventory: 0,
      sizes: ['M'],
      colors: ['Phantom Black'],
      weight: 300,
      seoTitle: '',
      seoDescription: '',
      isActive: true
    }
  });

  const watchSizes = watch('sizes') || [];
  const watchColors = watch('colors') || [];
  const watchTitle = watch('title') || 'Product Preview';
  const watchPrice = watch('price') || 0;
  const watchSku = watch('sku') || 'SKU-00000';
  const watchInventory = watch('inventory') || 0;

  const handleSizeToggle = (size: string) => {
    const current = [...watchSizes];
    const idx = current.indexOf(size);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(size);
    }
    setValue('sizes', current, { shouldValidate: true });
  };

  const handleColorToggle = (color: string) => {
    const current = [...watchColors];
    const idx = current.indexOf(color);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(color);
    }
    setValue('colors', current, { shouldValidate: true });
  };

  // Open Drawer for Add/Edit
  const openDrawer = (product: DashboardProduct | null = null) => {
    setEditingProduct(product);
    if (product) {
      reset({
        title: product.title,
        slug: product.handle,
        description: product.description,
        categoryName: product.categoryName,
        collectionName: product.collectionName,
        brand: product.brand,
        tags: product.tags.join(', '),
        price: product.price,
        comparePrice: product.comparePrice,
        costPrice: product.costPrice,
        sku: product.sku,
        barcode: product.barcode,
        inventory: product.inventory,
        sizes: product.sizes,
        colors: product.colors,
        weight: product.weight,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        isActive: product.isActive
      });
    } else {
      reset({
        title: '',
        slug: '',
        description: '',
        categoryName: MOCK_CATEGORIES[0]?.name || '',
        collectionName: MOCK_COLLECTIONS[0]?.name || '',
        brand: 'House of Koala',
        tags: '',
        price: 0,
        comparePrice: 0,
        costPrice: 0,
        sku: '',
        barcode: '',
        inventory: 0,
        sizes: ['M'],
        colors: ['Phantom Black'],
        weight: 300,
        seoTitle: '',
        seoDescription: '',
        isActive: true
      });
    }
    setIsDrawerOpen(true);
  };

  // Submit Product Form
  const onSubmit = (data: any) => {
    const formattedProduct: DashboardProduct = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: data.title,
      handle: data.slug,
      description: data.description,
      categoryName: data.categoryName,
      collectionName: data.collectionName,
      brand: data.brand,
      tags: data.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      price: Number(data.price),
      comparePrice: Number(data.comparePrice || 0),
      costPrice: Number(data.costPrice),
      sku: data.sku,
      barcode: data.barcode || '',
      inventory: Number(data.inventory),
      sizes: data.sizes,
      colors: data.colors,
      weight: Number(data.weight),
      images: editingProduct ? editingProduct.images : ["https://res.cloudinary.com/cdn/shopify.com/s/files/1/0000/mock/placeholder.jpg"],
      seoTitle: data.seoTitle || `${data.title} | House of Koala`,
      seoDescription: data.seoDescription || data.description.slice(0, 150),
      isActive: data.isActive,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? formattedProduct : p));
    } else {
      setProducts(prev => [formattedProduct, ...prev]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryName === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'active' ? p.isActive : !p.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Math
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-[32px]">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Products</h1>
          <p className="text-xs text-[#71717A] mt-2">Manage catalog items, attributes and stock variants.</p>
        </div>
        <button
          onClick={() => openDrawer()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg hover:scale-105"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[24px] p-8 admin-glass">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={15} />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090909] border border-white/5 focus:border-white/20 rounded-full py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#71717A] outline-none transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#181818] border border-white/5 rounded-full px-5 py-2.5 text-xs text-[#A1A1AA] hover:text-white outline-none transition-all cursor-pointer font-bold"
          >
            <option value="all">All Categories</option>
            {MOCK_CATEGORIES.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#181818] border border-white/5 rounded-full px-5 py-2.5 text-xs text-[#A1A1AA] hover:text-white outline-none transition-all cursor-pointer font-bold"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* ─── Product Card Grid (Spacious) ─── */}
      {paginatedProducts.length === 0 ? (
        <div className="admin-glass flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/[0.01] border border-white/5 flex items-center justify-center text-[#71717A]">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No products found</p>
            <p className="text-xs text-[#71717A] mt-1.5">Try resetting the active filters or search terms.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {paginatedProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.16)' }}
              className="admin-glass overflow-hidden flex flex-col group border border-white/5 transition-all duration-300 relative cursor-pointer"
            >
              {/* Large Thumbnail Container */}
              <div className="h-64 bg-[#121212] flex items-center justify-center border-b border-white/5 relative overflow-hidden">
                <ImageIcon size={32} className="text-white/10 group-hover:scale-110 transition-transform duration-300" />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-bold border ${
                  product.isActive ? 'border-white/15 bg-white/5 text-white' : 'border-white/5 bg-transparent text-[#71717A]'
                }`}>
                  {product.isActive ? 'Active' : 'Draft'}
                </span>
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#090909]/80 backdrop-blur-md border border-white/5 text-[9px] font-bold text-[#A1A1AA]">
                  {product.categoryName}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-sm text-white leading-snug group-hover:underline">{product.title}</h3>
                    <span className="text-sm font-bold text-white whitespace-nowrap">₹{product.price}</span>
                  </div>
                  <p className="text-[10px] text-[#71717A] font-mono mt-1">SKU: {product.sku}</p>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-3 leading-relaxed">{product.description}</p>
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                  <span className={`font-bold ${product.inventory < 20 ? 'text-yellow-500' : 'text-[#71717A]'}`}>
                    {product.inventory} left
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDrawer(product)}
                      className="p-2 rounded-xl bg-[#121212] border border-white/5 hover:border-white/20 text-[#A1A1AA] hover:text-white transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 rounded-xl bg-[#121212] border border-white/5 hover:border-red-500/30 text-[#A1A1AA] hover:text-red-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Pagination Controls ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <span className="text-xs text-[#71717A] font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-white/5 rounded-xl text-[#A1A1AA] hover:text-white bg-[#181818] disabled:opacity-30 transition-colors shadow-sm"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-white/5 rounded-xl text-[#A1A1AA] hover:text-white bg-[#181818] disabled:opacity-30 transition-colors shadow-sm"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD/EDIT DRAWER (Split Screen Editor & Visual Live Preview) ─── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Split Screen Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-5xl bg-[#121212] border-l border-white/5 z-50 overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#181818]">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    {editingProduct ? 'Modify Product' : 'Create New Product'}
                  </h2>
                  <p className="text-[10px] text-[#71717A] mt-1">Split editor with visual storefront simulation preview.</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-[#71717A] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Split Body */}
              <div className="flex-grow flex overflow-hidden">
                {/* Left: Form Fields (Scrollable) */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-8 text-[#A1A1AA] border-r border-white/5">
                  {/* 1. General Section */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">
                      General Information
                    </span>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase">Product Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Ghost Heavyweight Oversized Tee"
                        {...register('title')}
                        className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder-[#71717A]"
                      />
                      {errors.title && <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Handle / Slug */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Slug / Handle</label>
                        <input
                          type="text"
                          placeholder="ghost-heavyweight-tee"
                          {...register('slug')}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder-[#71717A]"
                        />
                        {errors.slug && <span className="text-[10px] text-red-500 font-semibold">{errors.slug.message}</span>}
                      </div>

                      {/* Brand */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Brand Vendor</label>
                        <input
                          type="text"
                          {...register('brand')}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase">Description</label>
                      <textarea
                        rows={4}
                        placeholder="Describe fit characteristics..."
                        {...register('description')}
                        className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder-[#71717A] resize-none leading-relaxed"
                      />
                      {errors.description && <span className="text-[10px] text-red-500 font-semibold">{errors.description.message}</span>}
                    </div>
                  </div>

                  {/* 2. Taxonomy Section */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">
                      Taxonomy & Cataloging
                    </span>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Category */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Category</label>
                        <select
                          {...register('categoryName')}
                          className="bg-[#181818] border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none text-[#A1A1AA] cursor-pointer font-semibold"
                        >
                          {MOCK_CATEGORIES.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Collection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Collection</label>
                        <select
                          {...register('collectionName')}
                          className="bg-[#181818] border border-white/5 rounded-xl px-4 py-2.5 text-xs outline-none text-[#A1A1AA] cursor-pointer font-semibold"
                        >
                          {MOCK_COLLECTIONS.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase">Tags (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="heavyweight, oversized..."
                        {...register('tags')}
                        className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder-[#71717A]"
                      />
                    </div>
                  </div>

                  {/* 3. Pricing & Inventory */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">
                      Pricing & Inventory
                    </span>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Price */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Price (₹)</label>
                        <input
                          type="number"
                          {...register('price', { valueAsNumber: true })}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white font-semibold"
                        />
                      </div>

                      {/* Compare Price */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Compare Price (₹)</label>
                        <input
                          type="number"
                          {...register('comparePrice', { valueAsNumber: true })}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white"
                        />
                      </div>

                      {/* Cost Price */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Cost Price (₹)</label>
                        <input
                          type="number"
                          {...register('costPrice', { valueAsNumber: true })}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* SKU */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">SKU Reference</label>
                        <input
                          type="text"
                          {...register('sku')}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white font-mono"
                        />
                      </div>

                      {/* Barcode */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Barcode</label>
                        <input
                          type="text"
                          {...register('barcode')}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white font-mono"
                        />
                      </div>

                      {/* Inventory */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-[#71717A] font-bold uppercase">Stock Level</label>
                        <input
                          type="number"
                          {...register('inventory', { valueAsNumber: true })}
                          className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Variations Section */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">
                      Variants Specifications
                    </span>

                    {/* Sizes */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase">Sizes Available</label>
                      <div className="flex flex-wrap gap-2.5">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                          const active = watchSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleSizeToggle(size)}
                              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
                                active ? 'bg-white text-black border-white' : 'border-white/5 bg-[#181818] text-[#A1A1AA] hover:text-white'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase">Colors Available</label>
                      <div className="flex flex-wrap gap-2.5">
                        {['Phantom Black', 'Off-White', 'Sage Green', 'Midnight Navy', 'Heather Gray', 'Ecru'].map((color) => {
                          const active = watchColors.includes(color);
                          return (
                            <button
                              type="button"
                              key={color}
                              onClick={() => handleColorToggle(color)}
                              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
                                active ? 'bg-white text-black border-white' : 'border-white/5 bg-[#181818] text-[#A1A1AA] hover:text-white'
                              }`}
                            >
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase">Shipping Weight (g)</label>
                      <input
                        type="number"
                        {...register('weight', { valueAsNumber: true })}
                        className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white font-semibold"
                      />
                    </div>
                  </div>

                  {/* 5. Images Section */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">
                      Media Files
                    </span>

                    <div className="border border-dashed border-white/5 hover:border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#181818]/30 hover:bg-[#181818]/60 transition-colors cursor-pointer">
                      <Upload size={22} className="text-[#71717A] mb-2.5" />
                      <p className="text-xs font-bold text-white">Click to select files to upload</p>
                      <p className="text-[10px] text-[#71717A] mt-1">Drag & drop files or upload high res media</p>
                    </div>
                  </div>

                  {/* 6. SEO Section */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">
                      Search Engine Optimization (SEO)
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase flex items-center gap-1.5">
                        <Globe size={12} />
                        <span>Page Meta Title</span>
                      </label>
                      <input
                        type="text"
                        {...register('seoTitle')}
                        className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder-[#71717A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-[#71717A] font-bold uppercase flex items-center gap-1.5">
                        <Globe size={12} />
                        <span>Meta Description</span>
                      </label>
                      <textarea
                        rows={3}
                        {...register('seoDescription')}
                        className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-white placeholder-[#71717A] resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-3 sticky bottom-0 bg-[#121212] pb-6">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-5 py-2.5 border border-white/5 hover:bg-white/5 rounded-full text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>

                {/* Right: Live Preview Panel */}
                <div className="hidden lg:flex flex-1 flex-col bg-[#090909] p-8 items-center justify-center relative overflow-hidden">
                  <div className="absolute top-6 left-8 flex items-center gap-2 text-[#71717A] text-[10px] font-bold tracking-wider uppercase font-mono">
                    <Globe size={12} strokeWidth={2} />
                    <span>Storefront Live Preview</span>
                  </div>

                  {/* Store Card Preview */}
                  <div className="w-[340px] bg-[#181818] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                    <div className="h-64 bg-[#121212] flex items-center justify-center border-b border-white/5 relative">
                      <span className="text-[10px] uppercase font-black text-white/5 tracking-widest font-mono">HOK PREVIEW</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-sm text-white block">{watchTitle}</span>
                        <span className="text-sm font-bold text-white">₹{watchPrice}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {watchSizes.map(size => (
                          <span key={size} className="px-2.5 py-1 rounded bg-[#090909] border border-white/5 text-[9px] font-bold text-[#A1A1AA]">
                            {size}
                          </span>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-white/5 flex justify-between text-[10px] text-[#71717A] font-semibold">
                        <span>SKU: {watchSku}</span>
                        <span>Stock: {watchInventory} left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
