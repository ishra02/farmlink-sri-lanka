
import { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import MyOrders from './pages/MyOrders';
import FarmerOrders from './pages/FarmerOrders';
import FarmerDashboard from './pages/FarmerDashboard';

function FarmerRoute({ children }) {
  const user = JSON.parse(
    localStorage.getItem('farmlinkUser') || 'null'
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'farmer') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('farmlinkCart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('farmlinkCart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    setCart(currentCart => {
      const existingProduct = currentCart.find(
        item => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCart(currentCart =>
      currentCart.filter(item => item.id !== productId)
    );
  }

  function updateQuantity(productId, change) {
    setCart(currentCart =>
      currentCart
        .map(item => {
          if (item.id === productId) {
            return {
              ...item,
              quantity: (item.quantity || 1) + change
            };
          }

          return item;
        })
        .filter(item => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <div id="top" className="app">
      <Navbar cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={<Home onAddToCart={addToCart} />}
        />
        <Route
  path="/farmer-orders"
  element={
    <FarmerRoute>
      <FarmerOrders />
    </FarmerRoute>
  }
/>
<Route
  path="/farmer-dashboard"
  element={
    <FarmerRoute>
      <FarmerDashboard />
    </FarmerRoute>
  }
/>

        <Route
          path="/products"
          element={<Products onAddToCart={addToCart} />}
        
        />
        <Route
  path="/my-orders"
  element={<MyOrders />}
/>

        <Route
          path="/add-product"
          element={
            <FarmerRoute>
              <AddProduct />
            </FarmerRoute>
          }
        />

        <Route
          path="/edit-product/:id"
          element={
            <FarmerRoute>
              <EditProduct />
            </FarmerRoute>
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onOrderPlaced={clearCart}
            />
          }
        />

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route
          path="*"
          element={
            <main className="page-banner">
              <h1>Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <a className="about-button" href="/">
                Return Home
              </a>
            </main>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
