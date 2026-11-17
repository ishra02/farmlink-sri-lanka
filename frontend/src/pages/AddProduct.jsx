
import { useState } from 'react';
import './AddProduct.css';

function getFarmerName() {
  try {
    const user = JSON.parse(localStorage.getItem('farmlinkUser'));
    return user?.fullName || '';
  } catch {
    return '';
  }
}

async function getErrorMessage(response, fallback) {
  const body = await response.text();
  if (!body) return fallback;

  try {
    const details = JSON.parse(body);
    if (typeof details === 'string') return details;
    return details.message || details.detail || details.error || fallback;
  } catch {
    return body;
  }
}

function AddProduct() {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    farmer: getFarmerName(),
    district: '',
    image: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be smaller than 5 MB.');
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const farmerName = getFarmerName();

      if (!farmerName) {
        throw new Error('Please log in again as a farmer.');
      }

      if (!selectedImage && !product.image) {
        throw new Error('Please choose a product image.');
      }

      let imageUrl = product.image;

      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const uploadResponse = await fetch(
          'http://localhost:8080/api/images/upload',
          {
            method: 'POST',
            credentials: 'include',
            body: formData
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(
            await getErrorMessage(uploadResponse, 'Image upload failed.')
          );
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch(
        'http://localhost:8080/api/products',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...product,
            farmer: farmerName,
            price: Number(product.price),
            image: imageUrl
          })
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first.');
        }

        if (response.status === 403) {
          throw new Error('Only farmers can add products.');
        }

        throw new Error(
          await getErrorMessage(response, 'Failed to add product.')
        );
      }

      setMessage('Product added successfully!');

      setProduct({
        name: '',
        category: '',
        price: '',
        farmer: farmerName,
        district: '',
        image: ''
      });

      setSelectedImage(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setPreview('');
      e.target.reset();

    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <h2>Add a New Product</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={product.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>

          {[
            'Vegetables',
            'Fruits',
            'Leafy Greens',
            'Coconut',
            'Grains',
            'Spices',
            'Dairy'
          ].map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          name="price"
          type="number"
          placeholder="Price (LKR)"
          min="1"
          value={product.price}
          onChange={handleChange}
          required
        />

        <input
          name="farmer"
          placeholder="Farmer Name"
          value={product.farmer}
          readOnly
          required
        />

        <input
          name="district"
          placeholder="District"
          value={product.district}
          onChange={handleChange}
          required
        />

        <label htmlFor="product-image">
          Choose Product Image (required)
        </label>

        <input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={!product.image}
        />

        {preview && (
          <div className="image-preview">
            <p>Image Preview</p>
            <img src={preview} alt="Product preview" />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default AddProduct;
