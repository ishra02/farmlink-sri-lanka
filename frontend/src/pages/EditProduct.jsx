
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import './AddProduct.css';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    farmer: '',
    district: '',
    image: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('https://farmlink-sri-lanka.onrender.com/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        return response.json();
      })
      .then(products => {
        const found = products.find(
          item => String(item.id) === id
        );

        if (!found) {
          setMessage('Product not found.');
          return;
        }

        setProduct(found);
      })
      .catch(() => {
        setMessage('Failed to load product.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch(
        `https://farmlink-sri-lanka.onrender.com/api/products/${id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...product,
            price: Number(product.price)
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first.');
        }

        if (response.status === 403) {
          throw new Error('Only farmers can edit products.');
        }

        throw new Error('Update failed');
      }

      alert('Product updated successfully!');
      navigate('/products');

    } catch (error) {
      setMessage(
        error.message || 'Failed to update product. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (!product.name) {
    return <p>{message}</p>;
  }

  return (
    <div className="add-product-page">
      <h2>Edit Product</h2>

      <form onSubmit={handleSubmit}>
        <label>Product Name</label>
        <input
          name="name"
          value={product.name}
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <input
          name="category"
          value={product.category}
          onChange={handleChange}
          required
        />

        <label>Price (LKR)</label>
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          required
          min="1"
        />

        <label>Farmer Name</label>
        <input
          name="farmer"
          value={product.farmer || ''}
          onChange={handleChange}
        />

        <label>District</label>
        <input
          name="district"
          value={product.district || ''}
          onChange={handleChange}
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default EditProduct;
