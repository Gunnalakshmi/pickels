import React, { useState } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, items } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Find default variant (prefer 500g, or default, or first)
  const defaultVariant =
    product.variants?.find(v => v.weight_label === '500g') ||
    product.variants?.find(v => v.is_default) ||
    product.variants?.[0];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [adding, setAdding] = useState(false);

  const isFav = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const cartQuantity = items.find(i => i.variantId === selectedVariant?.id)?.quantity || 0;

  // Spice level out of 5
  const spiceScore = product.spice_rating || (
    product.spice_level === 'extra-spicy' ? 5 :
    product.spice_level === 'spicy' ? 4 :
    product.spice_level === 'medium' ? 3 : 2
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedVariant) return;
    setAdding(true);
    await addToCart(product.id, selectedVariant.id, 1);
    setTimeout(() => setAdding(false), 500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Available weights: 250g, 500g, 750g, 1kg
  const weightOrder = ['250g', '500g', '750g', '1kg'];
  const sortedVariants = product.variants ? [...product.variants].sort((a, b) => {
    return weightOrder.indexOf(a.weight_label) - weightOrder.indexOf(b.weight_label);
  }) : [];

  return (
    <div
      onClick={() => onSelect(product)}
      className="ashok-product-card"
      style={{ cursor: 'pointer' }}
    >
      {/* ========================================================
          UPPER HALF: Product Image & Visual Information
          ======================================================== */}
      <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden', background: '#f5eee6' }}>
        <img
          src={product.primary_image || (product.images && product.images[0]?.image_url) || '/pickle_jar_hero.jpg'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Top-Left Corner: Veg / Non-Veg Symbol */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: '#ffffff',
            borderRadius: '4px',
            padding: '2px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
          title={product.dietary_type === 'veg' ? '100% Vegetarian' : 'Non-Vegetarian'}
        >
          {product.dietary_type === 'veg' ? (
            <span
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '3px',
                border: '1.8px solid #2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#2e7d32',
                }}
              />
            </span>
          ) : (
            <span
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '3px',
                border: '1.8px solid #b71c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
              }}
            >
              <span
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: '7px solid #b71c1c',
                }}
              />
            </span>
          )}
        </div>

        {/* Top-Right Corner: Heart / Wishlist Icon */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFav ? '#d32f2f' : '#8d7b75',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, color 0.15s ease',
            zIndex: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          <Heart size={15} fill={isFav ? '#d32f2f' : 'none'} color={isFav ? '#d32f2f' : 'currentColor'} />
        </button>

        {/* Bottom-Right Corner: Spice Level out of 5 (Chilli symbols) */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(28, 20, 18, 0.88)',
            backdropFilter: 'blur(6px)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '1px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
            zIndex: 2,
          }}
          title={`Spice Level: ${spiceScore}/5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '10px',
                opacity: i < spiceScore ? 1 : 0.25,
                filter: i < spiceScore ? 'none' : 'grayscale(1)',
                lineHeight: 1,
              }}
            >
              🌶️
            </span>
          ))}
        </div>
      </div>

      {/* ========================================================
          LOWER HALF: Product Information
          ======================================================== */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1, background: '#ffffff' }}>
        {/* English Product Name */}
        <h3
          style={{
            fontSize: '14.5px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            lineHeight: '1.25',
            marginBottom: '3px',
            fontFamily: "'Playfair Display', Georgia, serif",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '36px',
          }}
        >
          {product.name}
        </h3>

        {/* Telugu Product Name */}
        {product.telugu_name ? (
          <p
            className="font-telugu"
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#b71c1c',
              marginBottom: '8px',
              letterSpacing: '0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.telugu_name}
          </p>
        ) : (
          <div style={{ height: '18px', marginBottom: '8px' }} />
        )}

        {/* Weight Selection Options: 250g, 500g, 750g, 1kg */}
        <div style={{ marginBottom: '10px' }} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
            }}
          >
            {sortedVariants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  style={{
                    padding: '4px 0',
                    textAlign: 'center',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-muted)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {v.weight_label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer: Original/Current Price & Add to Cart */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Original Price ONLY: No discount, no old price, no save tags */}
          <div>
            <span
              style={{
                fontSize: '17px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
              }}
            >
              ₹{currentPrice}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: 'var(--radius-full)',
              background: cartQuantity > 0 ? '#2e7d32' : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {adding ? (
              <Check size={14} />
            ) : cartQuantity > 0 ? (
              <>
                <Check size={12} />
                <span>{cartQuantity} in Cart</span>
              </>
            ) : (
              <>
                <Plus size={12} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
