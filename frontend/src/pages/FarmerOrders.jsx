
import { useEffect, useState } from 'react';
import './FarmerOrders.css';

const statuses = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Delivered'
];

async function readResponse(response) {
  const body = await response.text();
  if (!body) return {};

  try {
    const data = JSON.parse(body);
    return data && typeof data === 'object'
      ? data
      : { message: String(data) };
  } catch {
    return { message: body };
  }
}

function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingOrder, setSavingOrder] = useState(null);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/orders/farmer-orders',
        {
          method: 'GET',
          credentials: 'include'
        }
      );

      const data = await readResponse(response);
      if (!response.ok) {
        throw new Error(
          data.message || data.detail || 'Unable to load farmer orders. Please log in again.'
        );
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(previous =>
      previous.map(order =>
        order.id === orderId
          ? { ...order, selectedStatus: newStatus }
          : order
      )
    );
  };

  const updateStatus = async (orderId, status) => {
    setSavingOrder(orderId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `http://localhost:8080/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.detail || 'Unable to update order status.'
        );
      }

      const savedStatus = data.status || status;

      setOrders(previous =>
        previous.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: savedStatus,
                selectedStatus: savedStatus
              }
            : order
        )
      );

      setMessage(`Order #${orderId} status updated to ${savedStatus}.`);
    } catch (err) {
      setError(
        typeof err.message === 'string'
          ? err.message
          : 'Unable to update order status.'
      );
    } finally {
      setSavingOrder(null);
    }
  };

  const formatPrice = price =>
    Number(price || 0).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  return (
    <main className="farmer-orders-page">
      <section className="page-banner">
        <span className="section-kicker">FARMER DASHBOARD</span>
        <h1>Customer Orders</h1>
        <p>View and manage orders containing your products.</p>
      </section>

      <section className="farmer-orders-content">

        {message && (
          <div className="farmer-orders-message">
            {message}
          </div>
        )}

        {loading ? (
          <h2>Loading orders...</h2>
        ) : error && orders.length === 0 ? (
          <div className="farmer-orders-empty">
            <h2>Unable to load orders</h2>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="farmer-orders-empty">
            <span>📦</span>
            <h2>No orders yet</h2>
            <p>Customer orders containing your products will appear here.</p>
          </div>
        ) : (
          <>
            {error && (
              <p className="farmer-orders-error">{error}</p>
            )}

            <div className="farmer-orders-list">
              {orders.map(order => (
                <article className="farmer-order-card" key={order.id}>

                  <div className="farmer-order-header">
                    <h2>Order #{order.id}</h2>
                    <span>{order.status}</span>
                  </div>

                  <p>
                    <strong>Customer:</strong> {order.customerName}
                  </p>

                  <p>
                    <strong>Email:</strong> {order.customerEmail}
                  </p>

                  <p>
                    <strong>Date:</strong>{' '}
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleString()
                      : 'Not available'}
                  </p>

                  <h3>Ordered Products</h3>

                  {order.items?.map(item => (
                    <div className="farmer-order-product" key={item.id}>
                      <div>
                        <strong>{item.productName}</strong>
                        <p>Quantity: {item.quantity}</p>
                        <p>Unit price: LKR {formatPrice(item.price)}</p>
                      </div>

                      <strong>
                        LKR {formatPrice(item.subtotal)}
                      </strong>
                    </div>
                  ))}

                  <div className="farmer-order-total">
                    Farmer's total: LKR {formatPrice(order.totalAmount)}
                  </div>

                  <div className="farmer-order-status-control">
                    <label htmlFor={`status-${order.id}`}>
                      Update Order Status
                    </label>

                    <select
                      id={`status-${order.id}`}
                      value={order.selectedStatus ?? order.status}
                      onChange={event =>
                        handleStatusChange(order.id, event.target.value)
                      }
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="farmer-status-button"
                      onClick={() =>
                        updateStatus(
                          order.id,
                          order.selectedStatus ?? order.status
                        )
                      }
                      disabled={
                        savingOrder === order.id ||
                        (order.selectedStatus ?? order.status) === order.status
                      }
                      aria-busy={savingOrder === order.id}
                    >
                      {savingOrder === order.id
                        ? 'Saving...'
                        : 'Save Status'}
                    </button>
                  </div>

                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default FarmerOrders;
