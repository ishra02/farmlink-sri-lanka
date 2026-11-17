
import { Link, useNavigate } from 'react-router';
import { categories, products } from '../data/products';
import ProductCard from '../components/ProductCard';

function Home({ onAddToCart }) {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-label">
            🌱 SUPPORTING LOCAL FARMERS
          </span>

          <h1>
            Fresh from Our Farms
            <br />
            to <span>Your Home</span>
          </h1>

          <p>
            Discover fresh, locally grown produce directly from
            Sri Lankan farmers. Better food, fair prices, stronger communities.
          </p>

          <form
            className="search-box"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get('search');
              navigate(`/products?search=${encodeURIComponent(value)}`);
            }}
          >
            <span className="search-icon">⌕</span>
            <input
              name="search"
              type="search"
              placeholder="Search vegetables, fruits, or farmers..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <Link className="hero-cta" to="/products">
            Explore Fresh Produce <span>→</span>
          </Link>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-title">
          <div>
            <span className="section-kicker">FRESH FROM LOCAL FARMS</span>
            <h2>Shop by Category</h2>
            <p>Discover your favourites from Sri Lankan farmers.</p>
          </div>
          <Link className="text-link" to="/products">
            View all products →
          </Link>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <button
              className="category-card"
              key={category.name}
              onClick={() =>
                navigate(`/products?category=${encodeURIComponent(category.name)}`)
              }
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="products-section">
        <div className="section-title product-title">
          <div>
            <span className="section-kicker">FRESHNESS YOU CAN TRUST</span>
            <h2>Fresh Picks for You</h2>
            <p>Explore our selection of locally sourced produce.</p>
          </div>
          <Link className="text-link" to="/products">
            See all →
          </Link>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        <div className="view-more">
          <Link to="/products">Explore All Products →</Link>
        </div>
      </section>

      <section className="farm-about">
        <div className="about-photo">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85"
            alt="Green agricultural fields"
            loading="lazy"
          />
        </div>

        <div className="about-content">
          <span className="section-kicker">OUR STORY</span>
          <h2>From Our Farms to Your Family</h2>

          <p>
            FarmLink Sri Lanka connects local farmers and customers
            through one convenient agricultural marketplace.
          </p>

          <p>
            Discover seasonal produce, explore products from different
            districts, and support the people who grow your food.
          </p>

          <Link className="about-button" to="/about">
            Discover Our Story →
          </Link>
        </div>
      </section>

      <section className="benefits">
        <div className="benefit-item">
          <span className="benefit-icon">🌱</span>
          <div><h3>Farm Fresh Quality</h3><p>Seasonal produce</p></div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🤝</span>
          <div><h3>Support Local Farmers</h3><p>Fair prices for farmers</p></div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🛡️</span>
          <div><h3>Safe Shopping</h3><p>Convenient browsing</p></div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🚚</span>
          <div><h3>Islandwide Delivery</h3><p>Delivery plans coming later</p></div>
        </div>
      </section>
    </>
  );
}

export default Home;

