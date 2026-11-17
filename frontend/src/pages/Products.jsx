

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { categories } from '../data/products';
import ProductCard from '../components/ProductCard';

function Products({ onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Products will now come from the Spring Boot backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  // Fetch products from Spring Boot
  useEffect(() => {
    let isMounted = true;

    fetch('http://localhost:8080/api/products')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setProducts(data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setError(error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep URL search and category filters synchronized
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  function updateFilters(nextSearch, nextCategory) {
    const params = new URLSearchParams();

    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    if (nextCategory !== 'All') params.set('category', nextCategory);

    setSearchParams(params);
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = [
      product.name,
      product.farmer,
      product.district,
      product.category,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="products-page">
      <section className="page-banner">
        <span className="section-kicker">FROM LOCAL FARMS TO YOU</span>
        <h1>Our Fresh Products</h1>
        <p>Discover fruits, vegetables, and more from Sri Lankan farmers.</p>
      </section>

      <section className="products-section">
        <div className="product-toolbar">
          <input
            className="product-search"
            type="search"
            placeholder="Search products, farmers, or districts..."
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              updateFilters(value, category);
            }}
          />

          <select
            className="product-select"
            value={category}
            onChange={(event) => {
              const value = event.target.value;
              setCategory(value);
              updateFilters(search, value);
            }}
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {categories.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="section-title">
          <div>
            <h2>{category === 'All' ? 'All Products' : category}</h2>
            <p>Browse available products from our farmers.</p>
          </div>
          <span className="results-count">
            {filteredProducts.length} products
          </span>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <div className="no-products">
            <h3>Unable to load products</h3>
            <p>{error}. Please check whether the backend is running.</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <span>🔎</span>
            <h3>No products found</h3>
            <p>Try another search or choose a different category.</p>
            <button
              className="signup-button"
              onClick={() => {
                setSearch('');
                setCategory('All');
                setSearchParams({});
              }}
            >
              Show All Products
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Products;
