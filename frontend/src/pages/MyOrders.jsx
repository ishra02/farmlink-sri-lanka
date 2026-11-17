
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch(
          'http://localhost:8080/api/orders/my-orders',
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Unable to load orders. Please log in again.');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  return (
    <main className="cart-page">
      <section className="page-banner">
        <span className="section-kicker">YOUR PURCHASES</span>
        <h1>My Orders</h1>
        <p>Track your FarmLink purchases and order details.</p>
      </section>

      <section className="cart-page-content my-orders-content">

        {loading ? (
          <h2>Loading your orders...</h2>
        ) : error ? (
          <div className="cart-page-empty">
            <h2>Unable to load orders</h2>
            <p>{error}</p>
            <Link className="signup-button" to="/login">
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="cart-page-empty">
            <span>📦</span>
            <h2>No orders yet</h2>
            <p>Your purchases will appear here.</p>
            <Link className="signup-button" to="/products">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-page-items">
            {orders.map(order => (
              <article className="cart-page-item" key={order.id}>
                <div className="cart-page-item-info">

                  <h3>Order #{order.id}</h3>

                  <p>Customer: {order.customerName}</p>
                  <p>Email: {order.customerEmail}</p>

                  <p>
                    Date: {order.orderDate
                      ? new Date(order.orderDate).toLocaleString()
                      : 'Not available'}
                  </p>

                  <div className="order-history-details">
                    <h3>Order Items</h3>

                    {order.items?.length > 0 ? (
                      <div className="order-history-items">
                        {order.items.map(item => (
                          <div className="order-history-item" key={item.id}>
                            <div>
                              <strong>{item.productName}</strong>
                              <p>Quantity: {item.quantity}</p>
                              <p>Unit Price: LKR {formatPrice(item.price)}</p>
                            </div>

                            <strong>
                              LKR {formatPrice(
                                Number(item.price) * Number(item.quantity)
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Product details unavailable.</p>
                    )}
                  </div>

                  <div className="order-history-total">
                    <h3>
                      Total: LKR {formatPrice(order.totalAmount)}
                    </h3>
                    <p>
                      Status: <strong>{order.status}</strong>
                    </p>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}

export default MyOrders;
