// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false); // ← ADD THIS

  // Update cart statistics
  const updateCartStats = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const total = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  // Load cart from localStorage on mount - UPDATED
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      console.log('🔄 Loading cart from localStorage:', savedCart);
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('✅ Parsed cart items:', parsedCart);
        setCart(parsedCart);
        updateCartStats(parsedCart);
      } else {
        console.log('⚠️ No cart found in localStorage');
        setCart([]);
        updateCartStats([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
      updateCartStats([]);
    } finally {
      setIsLoaded(true); // ← ADD THIS - Mark as loaded
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) { // ← ADD THIS - Only save after initial load
      console.log('💾 Saving cart to localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartStats(cart);
      
      // Dispatch event for navbar to update
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('storage'));
    }
  }, [cart, isLoaded]);

  // Add item to cart
  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      // Use _id or id for comparison
      const itemId = item._id || item.id;
      const existingItem = prevCart.find(i => (i._id === itemId || i.id === itemId));
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(i =>
          (i._id === itemId || i.id === itemId)
            ? { ...i, quantity: (i.quantity || 1) + quantity }
            : i
        );
      } else {
        // Add new item - ensure both _id and id are present
        const newItem = {
          _id: itemId,
          id: itemId,
          name: item.name,
          price: item.price || 0,
          quantity: quantity,
          image: item.image || '',
          isVegetarian: item.isVegetarian || false
        };
        return [...prevCart, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => (item._id !== itemId && item.id !== itemId)));
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        (item._id === itemId || item.id === itemId) ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart'); // ← ADD THIS - Also clear from localStorage
  };

  // Get cart item count
  const getCartCount = () => cartCount;

  // Get cart total
  const getCartTotal = () => cartTotal;

  // Check if item is in cart - FIXED to check both _id and id
  const isInCart = (itemId) => {
    return cart.some(item => item._id === itemId || item.id === itemId);
  };

  // Get item quantity in cart - FIXED to check both _id and id
  const getItemQuantity = (itemId) => {
    const item = cart.find(item => item._id === itemId || item.id === itemId);
    return item ? (item.quantity || 1) : 0;
  };

  const value = {
    cart,
    cartCount,
    cartTotal,
    isLoaded, // ← ADD THIS - Export isLoaded
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;