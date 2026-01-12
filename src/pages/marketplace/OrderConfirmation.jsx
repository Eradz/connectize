import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Printer,
  Download
} from 'lucide-react';
import marketplaceApi from '../../api-services/marketplace';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getOrderById(id);
      setOrder(response);
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'bank_transfer': 'Bank Transfer',
      'card': 'Credit/Debit Card',
      'stripe': 'Card (Stripe)',
      'paypal': 'PayPal',
      'cash': 'Cash on Delivery',
      'wallet': 'Wallet',
      'crypto': 'Cryptocurrency',
    };
    return methods[method] || method?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Card';
  };

  const formatPaymentStatus = (status) => {
    const statuses = {
      'pending': 'Pending',
      'paid': 'Paid',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'partial_refund': 'Partially Refunded',
    };
    return statuses[status] || status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Pending';
  };

  const handlePrintReceipt = () => {
    const shippingAddr = order.shipping_address || {};
    const addressStr = typeof shippingAddr === 'object' 
      ? `${shippingAddr.name || ''}<br/>${shippingAddr.address || ''}<br/>${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.postal_code || ''}<br/>${shippingAddr.country || ''}<br/>${shippingAddr.phone ? 'Phone: ' + shippingAddr.phone : ''}`
      : shippingAddr;

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title || item.listing?.title || 'Product'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.unit_price || 0).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.line_total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .order-info div { flex: 1; }
          .section-title { font-weight: bold; font-size: 14px; color: #666; margin-bottom: 5px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
          th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
          th:nth-child(2) { text-align: center; }
          .totals { margin-top: 20px; text-align: right; }
          .totals div { margin: 5px 0; }
          .totals .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ORDER RECEIPT</h1>
          <p>Order #${order.order_number}</p>
          <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        <div class="order-info">
          <div>
            <div class="section-title">Shipping Address</div>
            <div>${addressStr}</div>
          </div>
          <div style="text-align: right;">
            <div class="section-title">Payment Info</div>
            <div>Method: ${formatPaymentMethod(order.payment_method)}</div>
            <div>Status: ${formatPaymentStatus(order.payment_status)}</div>
            <div>Order Status: ${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div>Subtotal: $${Number(order.subtotal || 0).toFixed(2)}</div>
          ${Number(order.shipping_total || 0) > 0 ? `<div>Shipping: $${Number(order.shipping_total).toFixed(2)}</div>` : ''}
          ${Number(order.tax_total || 0) > 0 ? `<div>Tax: $${Number(order.tax_total).toFixed(2)}</div>` : ''}
          ${Number(order.discount_total || 0) > 0 ? `<div>Discount: -$${Number(order.discount_total).toFixed(2)}</div>` : ''}
          <div class="total">Total: $${Number(order.total || 0).toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const orderSteps = [
    { status: 'pending', label: 'Order Placed', icon: CheckCircle },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: MapPin }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error || 'Order not found'}</span>
        </div>
        <Link
          to="/marketplace/orders"
          className="mt-4 text-blue-600 hover:underline inline-block"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            .print-area .bg-white {
              border: 1px solid #e5e7eb !important;
            }
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto px-4 py-6 print-area">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Thank you for your order. We've received it and will begin processing shortly.
        </p>
        <p className="text-lg font-semibold text-blue-600 mt-2">
          Order #{order.order_number}
        </p>
      </div>

      {/* Order Progress */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
              />
            </div>
            
            {orderSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.status} className="relative flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`mt-2 text-sm ${
                    isCompleted ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-500" />
            Shipping Address
          </h2>
          <div className="text-gray-700">
            {order.shipping_address ? (
              typeof order.shipping_address === 'object' ? (
                <>
                  {order.shipping_address.name && <p className="font-medium">{order.shipping_address.name}</p>}
                  {order.shipping_address.address && <p>{order.shipping_address.address}</p>}
                  <p>
                    {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                  {order.shipping_address.phone && <p className="text-gray-500 mt-2">Phone: {order.shipping_address.phone}</p>}
                </>
              ) : (
                <p className="whitespace-pre-line">{order.shipping_address}</p>
              )
            ) : (
              <p className="text-gray-400">No shipping address provided</p>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            Order Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Date:</span>
              <span className="text-gray-900">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="text-gray-900 flex items-center gap-1">
                <CreditCard size={14} />
                {formatPaymentMethod(order.payment_method)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                order.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {formatPaymentStatus(order.payment_status)}
              </span>
            </div>
            {order.tracking_number && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking #:</span>
                <span className="text-blue-600 font-mono">{order.tracking_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.listing?.images?.[0] ? (
                  <img
                    src={item.listing.images[0].image}
                    alt={item.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={28} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{item.title || item.listing?.title || 'Product'}</h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-500">
                  ${Number(item.unit_price || item.price || 0).toFixed(2)} each
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${Number(item.line_total || (item.quantity * Number(item.unit_price || item.price || 0))).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">
              ${Number(order.subtotal || 0).toFixed(2)}
            </span>
          </div>
          {(order.shipping_total || order.shipping_cost) && Number(order.shipping_total || order.shipping_cost) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900">${Number(order.shipping_total || order.shipping_cost).toFixed(2)}</span>
            </div>
          )}
          {(order.tax_total || order.tax_amount) && Number(order.tax_total || order.tax_amount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax</span>
              <span className="text-gray-900">${Number(order.tax_total || order.tax_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-blue-600">
              ${Number(order.total || order.total_amount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipment Tracking - Show if shipment request exists */}
      {order.shipment_request_id && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Shipment Created</h3>
                <p className="text-sm text-green-700">
                  A shipment request has been created for your order.
                </p>
              </div>
            </div>
            <Link
              to={`/logistics/shipments/${order.shipment_request_id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
            >
              Track Shipment
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center no-print">
        <Link
          to="/marketplace/orders"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          View All Orders
        </Link>
        <Link
          to="/marketplace"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          Continue Shopping
          <ChevronRight size={18} />
        </Link>
        <button
          onClick={handlePrintReceipt}
          className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center gap-2"
        >
          <Printer size={18} />
          Print Receipt
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-6 bg-blue-50 rounded-xl no-print">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 text-sm">
          If you have any questions about your order, please contact our support team or 
          reach out to the seller directly. We're here to help!
        </p>
      </div>
    </div>
    </>
  );
};

export default OrderConfirmation;
