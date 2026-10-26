
import { useState } from 'react';
import './App.css';

const products = [
  { id: 1, name: 'Tomatoes', price: 250, farmer: 'Sunil Fernando', district: 'Kandy', emoji: '🍅' },
  { id: 2, name: 'Carrots', price: 180, farmer: 'Nimal Perera', district: 'Matale', emoji: '🥕' },
  { id: 3, name: 'Green Beans', price: 200, farmer: 'Priyantha Silva', district: 'Kurunegala', emoji: '🫛' },
  { id: 4, name: 'Pumpkin', price: 120, farmer: 'Chandima Wijesinghe', district: 'Anuradhapura', emoji: '🎃' },
  { id: 5, name: 'Banana', price: 150, farmer: 'Ruwan Jayasinghe', district: 'Badulla', emoji: '🍌' },
];

function App() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.farmer} ${product.district}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addToCart(product) {
    setCart((currentCart) => [...currentCart, product]);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">🌿</span>
          <span>FarmLink<small>Sri Lanka</small></span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <span className="cart-count">🛒 {cart.length}</span>
          <button className="login-button" onClick={() => alert('Login will be added later.')}>
            Login
          </button>
          <button className="signup-button" onClick={() => alert('Registration will be added later.')}>
            Sign Up
          </button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">GROWN WITH CARE IN SRI LANKA</p>
          <h1>Fresh from Our Farms to <span>Your Home</span></h1>
          <p>
            Connect directly with local farmers. Discover fresh,
            seasonal produce at fair prices.
          </p>

          <form className="search-box" onSubmit={(event) => {
            event.preventDefault();
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vegetables, fruits, or farmers..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <main>
        <section className="categories">
          <h2>Shop by Category</h2>
          <div className="category-list">
            {[
              ['🥬', 'Vegetables'],
              ['🍌', 'Fruits'],
              ['🌿', 'Leafy Greens'],
              ['🥥', 'Coconut'],
              ['🌾', 'Grains'],
              ['🌶️', 'Spices'],
            ].map(([emoji, name]) => (
              <div className="category" key={name}>
                <span>{emoji}</span>
                <p>{name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <h2>Fresh Picks for You</h2>
              <p>Fresh produce, sourced directly from local farmers.</p>
            </div>
            <span>{filteredProducts.length} products</span>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">{product.emoji}</div>
                <div className="product-details">
                  <span className="fresh-label">FRESH PICK</span>
                  <h3>{product.name}</h3>
                  <p className="price">LKR {product.price} <small>/ kg</small></p>
                  <p className="farmer">👨‍🌾 {product.farmer}</p>
                  <p className="district">📍 {product.district}</p>
                  <button className="add-button" onClick={() => addToCart(product)}>
                    + Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="empty-message">
              No products found. Try another search.
            </p>
          )}
        </section>

        <section className="benefits" id="about">
          <div><span>🌱</span><p><strong>Fresh Products</strong><small>Seasonal produce</small></p></div>
          <div><span>👨‍🌾</span><p><strong>Direct from Farmers</strong><small>Fair prices for everyone</small></p></div>
          <div><span>🛡️</span><p><strong>Secure Shopping</strong><small>Payment integration coming later</small></p></div>
          <div><span>🚚</span><p><strong>Islandwide Delivery</strong><small>Delivery options coming later</small></p></div>
        </section>
      </main>

      <footer>
        <p>🌿 FarmLink Sri Lanka</p>
        <small>Connecting local farmers with communities.</small>
      </footer>
    </div>
  );
}

export default App;
