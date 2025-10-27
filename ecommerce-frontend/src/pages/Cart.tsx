import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import NotificationModal from '../components/NotificationModal';

const Cart: React.FC = () => {
  const { cart, isLoading, updateCartItem, removeFromCart, cartTotal } = useCart();
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });

  const handleCheckout = () => {
    setNotification({
      isOpen: true,
      type: 'success',
      message: 'Checkout functionality coming soon! 🚀',
    });
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty.</p>
            <Link
              to="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image';
                        }}
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">No Image</span>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600">${item.product.price}</p>
                  </div>

                  <div className="flex items-center">
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-t border-b border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  <div className="ml-6">
                    <p className="text-lg font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="ml-6">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 text-center block"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        <NotificationModal
          isOpen={notification.isOpen}
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      </div>
    </div>
  );
};

export default Cart;
