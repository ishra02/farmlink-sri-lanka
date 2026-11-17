
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import './FarmerDashboard.css';

function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const user = JSON.parse(localStorage.getItem('farmlinkUser'));

        if (!user || user.role !== 'farmer') {
          throw new Error('Please log in using your farmer account.');
        }

        const [productsResponse, ordersResponse] = await Promise.all([
          fetch('http://localhost:8080/api/products'),
          fetch('http://localhost:8080/api/orders/farmer-orders', {
            credentials: 'include'
          })
        ]);

        if (!productsResponse.ok || !ordersResponse.ok) {
          throw new Error('Unable to load dashboard information.');
        }

        const allProducts = await productsResponse.json();
        const farmerOrders = await ordersResponse.json();

        const farmerProducts = allProducts.filter(
          product =>
            product.farmer?.toLowerCase() === user.fullName?.toLowerCase()
        );

        setProducts(farmerProducts);
        setOrders(farmerOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalOrderValue = orders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0
  );

  const formatPrice = price =>
    Number(price || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  return (
    <main className="farmer-dashboard-page">
      <section className="page-banner">
        <span className="section-kicker">FARMLINK FARMER AREA</span>
        <h1>Farmer Dashboard</h1>
        <p>Manage your products and monitor your customer orders.</p>
      </section>

      <section className="farmer-dashboard-content">
        {loading ? (
          <h2>Loading your dashboard...</h2>
        ) : error ? (
          <div className="farmer-dashboard-empty">
            <h2>Unable to load dashboard</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="farmer-dashboard-welcome">
              <h2>Welcome back!</h2>
              <p>Here is an overview of your FarmLink activity.</p>
            </div>

            <div className="farmer-dashboard-stats">
              <article className="farmer-stat-card">
                <span>🌱</span>
                <h3>Total Products</h3>
                <strong>{products.length}</strong>
              </article>

              <article className="farmer-stat-card">
                <span>📦</span>
                <h3>Total Orders</h3>
                <strong>{orders.length}</strong>
              </article>

              <article className="farmer-stat-card">
                <span>💰</span>
                <h3>Total Order Value</h3>
                <strong>LKR {formatPrice(totalOrderValue)}</strong>
              </article>
            </div>

            <div className="farmer-dashboard-actions">
              <Link to="/add-product" className="farmer-dashboard-button">
                + Add New Product
              </Link>

              <Link to="/farmer-orders" className="farmer-dashboard-button">
                View Customer Orders
              </Link>

              <Link to="/products" className="farmer-dashboard-button secondary">
                Browse Products
              </Link>
            </div>

            <div className="farmer-dashboard-recent">
              <h2>Recent Orders</h2>

              {orders.length === 0 ? (
                <p>No customer orders yet.</p>
              ) : (
                orders.slice(0, 5).map(order => (
                  <div className="farmer-dashboard-order" key={order.id}>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <p>{order.customerName}</p>
                    </div>

                    <div>
                      <strong>LKR {formatPrice(order.totalAmount)}</strong>
                      <p>{order.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default FarmerDashboard;
