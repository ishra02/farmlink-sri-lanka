
import { useState } from 'react';
import { Link } from 'react-router';
import './ProductCard.css';

function ProductCard({ product, onAddToCart }) {
  const [favorite, setFavorite] = useState(false);
  const user = JSON.parse(localStorage.getItem('farmlinkUser') || 'null');
  const isFarmer = user?.role === 'farmer';

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://farmlink-sri-lanka.onrender.com/api/products/${product.id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first.');
        }

        if (response.status === 403) {
          throw new Error('Only farmers can delete products.');
        }

        throw new Error('Delete failed');
      }

      alert('Product deleted successfully!');
      window.location.reload();

    } catch (error) {
      alert(error.message || 'Failed to delete product. Please try again.');
    }
  };

  return (
    <article className="product-card">
      <div className="product-image">
        <img
          src={
            product.image?.startsWith('/uploads/')
              ? `https://farmlink-sri-lanka.onrender.com${product.image}`
              : product.image
          }
          alt={product.name}
        />

        <span className="fresh-badge">Farm Fresh</span>

        <button
          className="heart-button"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorite}
          onClick={() => setFavorite(!favorite)}
        >
          {favorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-details">
        <span className="product-category">{product.category}</span>

        <h3>{product.name}</h3>

        <p className="farmer-name">
          👨‍🌾 {product.farmer}
        </p>

        <p className="farmer-location">
          📍 {product.district}, Sri Lanka
        </p>

        <div className="product-bottom">
          <div className="product-price">
            <strong>
              LKR {product.price.toLocaleString('en-LK')}
            </strong>
            <span>/ kg or unit</span>
          </div>

          <button
            className="add-button"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAddToCart(product)}
          >
            +
          </button>
        </div>

        {isFarmer && (
          <>
            <Link
              to={`/edit-product/${product.id}`}
              className="edit-product-button"
            >
              Edit
            </Link>

            <button
              className="delete-product-button"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
