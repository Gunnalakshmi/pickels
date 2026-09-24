import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Truck, ShieldCheck, Check, Plus, Minus, Flame, Sparkles, MapPin, Award, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onProceedToCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onProceedToCheckout }) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { city, pincode, estimatedTransitDays, setPincodeModalOpen } = useLocation();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.find(v => v.is_default) || product.variants?.[0] || {
      id: 'default',
      product_id: product.id,
      weight_label: '500g',
      weight_in_grams: 500,
      sku: 'SKU-500G',
      price: product.base_price,
      mrp: product.base_mrp,
      discount_percentage: product.discount_percentage,
      stock_quantity: 100,
      is_in_stock: true,
    }
  );

  const [activeImage, setActiveImage] = useState<string>(
    product.primary_image || product.images?.[0]?.image_url || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'compliance' | 'reviews'>('details');

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [headline, setHeadline] = useState('');
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const isFav = isInWishlist(product.id);
  const currentPrice = selectedVariant.price;
  const currentMrp = selectedVariant.mrp;
  const discountPercent = selectedVariant.discount_percentage;

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariant.id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, selectedVariant.id, quantity);
    onClose();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await api.submitReview({
        productId: product.id,
        rating,
        headline,
        comment,
      });
      if (res.success) {
        showToast('Thank you for your verified review! ⭐', 'success');
        setHeadline('');
        setComment('');
        if (product.reviews) {
          product.reviews.unshift(res.review);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto',
    }}>
      <div className="animate-slide-up" style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '960px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '16px',
            right: '16px',
            alignSelf: 'flex-end',
            zIndex: 10,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: 'var(--text-primary)',
          }}
        >
          <X size={20} />
        </button>

        {/* Content Body */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
          }}>
            {/* Left: Gallery */}
            <div>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '380px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#f7f1ea',
                border: '1px solid var(--border-subtle)',
              }}>
                <img
                  src={activeImage || product.primary_image}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#fff', borderRadius: '4px', padding: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                  <span className={product.dietary_type === 'non-veg' ? 'badge-nonveg' : 'badge-veg'}>
                    <span className={product.dietary_type === 'non-veg' ? 'badge-nonveg-triangle' : 'badge-veg-dot'} />
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.image_url)}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `2px solid ${activeImage === img.image_url ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <img src={img.image_url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Callout */}
              <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--curry-green)', fontWeight: '600' }}>
                  <ShieldCheck size={16} />
                  <span>FSSAI Certified Indian Quality (Lic. #10021042000889)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <Award size={16} color="var(--primary)" />
                  <span>Traditional stone-ground spice mix & wood-pressed oil</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Purchase Form */}
            <div>
              {/* Regional & Spice Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                  {product.regional_style}
                </span>
                <span style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={12} fill="currentColor" />
                  <span>{product.spice_level.toUpperCase()} SPICE</span>
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.25' }}>
                {product.name}
              </h2>

              {product.telugu_name && (
                <p className="font-telugu" style={{ fontSize: '18px', fontWeight: '700', color: '#b71c1c', marginTop: '2px' }}>
                  {product.telugu_name}
                </p>
              )}

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff8e1', padding: '3px 8px', borderRadius: '6px' }}>
                  <Star size={14} fill="#ffb300" color="#ffb300" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#b76e00' }}>{product.rating}</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {product.review_count} Verified Customer Reviews
                </span>
              </div>

              {/* Price Block: Original Price only */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '16px 0', padding: '12px', background: '#fff9f7', borderRadius: 'var(--radius-sm)', border: '1px solid #ffdcd2' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{currentPrice}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  (Inclusive of all taxes)
                </span>
              </div>

              {/* Variant Weight Selector */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ margin: '18px 0' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Select Weight Pack:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${selectedVariant.id === v.id ? 'var(--primary)' : 'var(--border-medium)'}`,
                          background: selectedVariant.id === v.id ? 'var(--primary-light)' : '#ffffff',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '14px', color: selectedVariant.id === v.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {v.weight_label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          ₹{v.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Buy Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-medium)', borderRadius: 'var(--radius-full)', background: '#fff' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: '700', fontSize: '15px', minWidth: '24px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-outline"
                  style={{ flex: 1, padding: '12px 18px', fontSize: '14px' }}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px 18px', fontSize: '14px' }}
                >
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isFav ? 'var(--primary)' : 'var(--text-muted)',
                    background: isFav ? 'var(--primary-light)' : '#ffffff',
                  }}
                >
                  <Heart size={20} fill={isFav ? 'var(--primary)' : 'none'} />
                </button>
              </div>

              {/* Delivery Estimation Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} color="var(--primary)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Deliver to <strong>{city} ({pincode})</strong> in {estimatedTransitDays} days
                  </span>
                </div>
                <button
                  onClick={() => setPincodeModalOpen(true)}
                  style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}
                >
                  Change PIN
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Details vs Food Compliance vs Reviews */}
          <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '2px' }}>
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '8px 16px',
                  fontWeight: '700',
                  fontSize: '14px',
                  color: activeTab === 'details' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: `3px solid ${activeTab === 'details' ? 'var(--primary)' : 'transparent'}`,
                  marginBottom: '-2px',
                }}
              >
                Culinary Story & Usage
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                style={{
                  padding: '8px 16px',
                  fontWeight: '700',
                  fontSize: '14px',
                  color: activeTab === 'compliance' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: `3px solid ${activeTab === 'compliance' ? 'var(--primary)' : 'transparent'}`,
                  marginBottom: '-2px',
                }}
              >
                Food Compliance & FSSAI 📜
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{
                  padding: '8px 16px',
                  fontWeight: '700',
                  fontSize: '14px',
                  color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: `3px solid ${activeTab === 'reviews' ? 'var(--primary)' : 'transparent'}`,
                  marginBottom: '-2px',
                }}
              >
                Verified Reviews ({product.reviews?.length || product.review_count})
              </button>
            </div>

            {/* Tab 1: Details */}
            {activeTab === 'details' && (
              <div style={{ padding: '20px 0', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                <p>{product.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                    <strong>Oil Used:</strong> {product.oil_type || 'Cold-Pressed Til Oil'}
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                    <strong>Dietary Category:</strong> {product.dietary_type === 'veg' ? '100% Vegetarian' : 'Non-Vegetarian'}
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                    <strong>Origin Region:</strong> {product.regional_style}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: FSSAI Compliance & Regulatory Info */}
            {activeTab === 'compliance' && (
              <div style={{ padding: '20px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '4px' }}>FSSAI License Number</h4>
                    <p style={{ fontSize: '14px', fontWeight: '700' }}>
                      {product.compliance?.fssai_license_no || '10021042000889'}
                    </p>
                  </div>
                  <div style={{ padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '4px' }}>Shelf Life</h4>
                    <p style={{ fontSize: '14px', fontWeight: '700' }}>
                      {product.compliance?.shelf_life || '12 Months from packaging date'}
                    </p>
                  </div>
                  <div style={{ padding: '14px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '4px' }}>Country of Origin</h4>
                    <p style={{ fontSize: '14px', fontWeight: '700' }}>India (Proudly Homemade)</p>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px' }}>Complete Ingredients:</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {product.compliance?.ingredients || 'Handpicked farm-fresh produce, Cold-pressed Sesame/Mustard Oil, Guntur Red Chilli Powder, Yellow Mustard Seeds, Fenugreek, Unrefined Sea Salt, Turmeric, Asafoetida (Hing).'}
                  </p>
                </div>

                <div style={{ marginTop: '16px', padding: '16px', background: 'var(--accent-gold-soft)', borderRadius: '8px', border: '1px solid #ffe082' }}>
                  <h4 style={{ fontSize: '13px', color: '#b76e00', marginBottom: '6px' }}>⚠️ Storage & Care Instructions:</h4>
                  <p style={{ fontSize: '13px', color: '#795548', lineHeight: '1.6' }}>
                    {product.compliance?.storage_instructions || 'Store in a cool dry place. Use only a clean, dry spoon. Ensure a continuous layer of oil remains on top to naturally seal and preserve fresh flavors without artificial chemicals.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === 'reviews' && (
              <div style={{ padding: '20px 0' }}>
                {/* Write Review Form */}
                <form onSubmit={handleReviewSubmit} style={{ padding: '18px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '10px' }}>Share Your Experience</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ color: star <= rating ? '#ffb300' : '#ccc' }}
                      >
                        <Star size={18} fill={star <= rating ? '#ffb300' : 'none'} />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Review headline (e.g. Pure Grandma's Flavor!)"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', marginBottom: '10px' }}
                  />

                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the spice, texture, and aroma..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-medium)', fontSize: '13px', marginBottom: '10px' }}
                  />

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    {reviewSubmitting ? 'Posting...' : 'Post Verified Review'}
                  </button>
                </form>

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev) => (
                      <div key={rev.id} style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{rev.user_name}</strong>
                            {rev.is_verified_purchase && (
                              <span style={{ background: 'var(--curry-green-light)', color: 'var(--curry-green)', fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px' }}>
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={13} fill="#ffb300" color="#ffb300" />
                            ))}
                          </div>
                        </div>
                        {rev.headline && <h5 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{rev.headline}</h5>}
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Be the first pickle lover to review this authentic recipe!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
