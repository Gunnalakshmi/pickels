import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { PincodeModal } from './components/common/PincodeModal';
import { SearchModal } from './components/common/SearchModal';

import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/order/OrderTrackingPage';
import { MyAccountPage } from './components/account/MyAccountPage';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, Order } from './types';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNavigate = (page: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    if (page === 'products') {
      setSelectedCategory(param);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveOrderId(orderId);
    setCurrentPage('order-tracking');
  };

  const handleReorder = (order: Order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(it => {
        addToCart(it.product_id, it.variant_id, it.quantity);
      });
    }
  };

  // If in dedicated admin portal view
  if (currentPage === 'admin') {
    return (
      <AdminDashboard
        onExitAdmin={() => handleNavigate('home')}
        onViewStore={() => handleNavigate('home')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sticky Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => handleNavigate('login')}
      />

      {/* Main Page Routing */}
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'products' && (
          <ProductsPage
            initialCategory={selectedCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onExplore={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onBackToHome={() => handleNavigate('home')}
            onLoginSuccess={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onBackToCart={() => handleNavigate('home')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPage === 'order-tracking' && activeOrderId && (
          <OrderTrackingPage
            orderId={activeOrderId}
            onBackToHome={() => handleNavigate('home')}
            onReorder={handleReorder}
          />
        )}

        {currentPage === 'account' && (
          <MyAccountPage
            onSelectOrder={(ordId) => {
              setActiveOrderId(ordId);
              setCurrentPage('order-tracking');
            }}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => handleNavigate('login')}
      />

      {/* Modals & Overlays */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProceedToCheckout={() => handleNavigate('checkout')}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToCategory={(catSlug) => {
          handleNavigate('products', catSlug);
          setIsSearchOpen(false);
        }}
      />

      <PincodeModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
