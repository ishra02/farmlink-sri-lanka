
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

function Cart({ cart, onRemove, onUpdateQuantity, onOrderPlaced }) {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem('farmlinkUser') || 'null'
  );

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const total = cart.reduce(
    (sum, product) =>
      sum + Number(product.price) * (product.quantity || 1),
    0
  );

  const totalItems = cart.reduce(
    (sum, product) => sum + (product.quantity || 1),
    0
  );

  async function handleCheckout(event) {
    event.preventDefault();
    setMessage('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      setMessage('Only customer accounts can place orders.');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setMessage('Please enter your name and email.');
      return;
    }

    setLoading(true);

    const orderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      items: cart.map(product => ({
        productId: product.id,
        quantity: product.quantity || 1
      }))
    };

    try {
      const response = await fetch('https://farmlink-sri-lanka.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Unable to place your order.');
      }

      onOrderPlaced();

      alert(
        `Order placed successfully! Your Order ID is ${JSON.parse(responseText).id}`
      );

      navigate('/');

    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cart-page">
      <section className="page-banner">
        <span className="section-kicker">YOUR SELECTION</span>
        <h1>Shopping Cart</h1>
        <p>Review the fresh produce you've selected.</p>
      </section>

      <section className="cart-page-content">
        {cart.length === 0 ? (
          <div className="cart-page-empty">
            <span>🛒</span>
            <h2>Your cart is empty</h2>
            <p>Explore our products and choose something fresh.</p>

            <Link className="signup-button" to="/products">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-page-items">
              {cart.map(product => (
                <article className="cart-page-item" key={product.id}>
                  <img
                    src={
                      product.image?.startsWith('/uploads/')
                        ? `https://farmlink-sri-lanka.onrender.com${product.image}`
                        : product.image
                    }
                    alt={product.name}
                  />

                  <div className="cart-page-item-info">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <p>
                      {product.farmer} · {product.district}
                    </p>

                    <strong>
                      LKR {Number(product.price).toLocaleString('en-LK')}
                    </strong>

                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, -1)}
                      >
                        −
                      </button>

                      <span>{product.quantity || 1}</span>

                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(product.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <p>
                      Item total: LKR {
                        (
                          Number(product.price) * (product.quantity || 1)
                        ).toLocaleString('en-LK')
                      }
                    </p>
                  </div>

                  <button
                    className="remove-cart-item"
                    onClick={() => onRemove(product.id)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>

            <div className="cart-page-summary">
              <h2>Order Summary</h2>

              <div>
                <span>Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div>
                <span>Subtotal</span>
                <strong>
                  LKR {total.toLocaleString('en-LK')}
                </strong>
              </div>

              <p>Delivery charges are not included.</p>

              <button
                className="cart-checkout"
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else if (user.role !== 'customer') {
                    setMessage('Only customers can place orders.');
                  } else {
                    setShowCheckout(!showCheckout);
                    setMessage('');
                  }
                }}
              >
                {showCheckout ? 'Close Checkout' : 'Proceed to Checkout →'}
              </button>

              {showCheckout && (
                <form onSubmit={handleCheckout}>
                  <h3>Checkout Details</h3>

                  <label>Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />

                  <label>Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    required
                  />

                  <p>
                    Total to pay: <strong>
                      LKR {total.toLocaleString('en-LK')}
                    </strong>
                  </p>

                  {message && (
                    <p style={{ color: 'red' }}>{message}</p>
                  )}

                  <button
                    className="cart-checkout"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              )}

              {!showCheckout && message && (
                <p style={{ color: 'red' }}>{message}</p>
              )}

              <Link className="continue-shopping" to="/products">
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Cart;
