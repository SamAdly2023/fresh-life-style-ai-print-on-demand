
import React, { useState } from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { AppRoute } from '../types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import { api } from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Checkout: React.FC = () => {
  const { user, cart, removeFromCart, clearCart } = useApp();
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    email: user?.email || ''
  });

  const subtotal = cart.reduce((acc, item) => acc + 29.99 * item.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handlePaymentSuccess = async (stripePaymentIntentId: string) => {
    // Create Order in DB with payment intent
    if (user) {
      try {
        await api.createOrder({
          id: '',
          userId: user.id,
          items: cart,
          total: total,
          status: 'paid',
          createdAt: new Date().toISOString(),
          shippingAddress: shippingAddress,
          stripePaymentIntentId: stripePaymentIntentId
        });
      } catch (e) {
        console.error("Failed to create order", e);
        alert("Payment successful but order creation failed. Please contact support with your payment ID: " + stripePaymentIntentId);
      }
    }

    setStep('success');
    setTimeout(() => clearCart(), 100);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.email) {
      alert("Please fill in all required shipping fields.");
      return;
    }

    // Create payment intent before moving to payment step
    setPaymentLoading(true);
    try {
      const response = await api.createPaymentIntent(total);
      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
      setStep('payment');
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-8">
          <i className="fa-solid fa-basket-shopping text-4xl text-gray-200"></i>
        </div>
        <h1 className="text-3xl font-black uppercase mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Looks like you haven't added any fresh designs yet. Start creating now!</p>
        <Link to={AppRoute.CREATE} className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition-all">
          EXPLORE CREATOR
        </Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-8 relative">
          <i className="fa-solid fa-circle-check text-6xl text-green-500 z-10"></i>
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">Order Success!</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Thank you for choosing Fresh Life Style. We've received your order and started the printing process. You'll receive a confirmation email shortly.
        </p>
        <div className="space-x-4">
          <Link to={AppRoute.HOME} className="bg-black text-white px-10 py-4 rounded-full font-bold">RETURN HOME</Link>
          <button className="bg-gray-100 text-black px-10 py-4 rounded-full font-bold">VIEW ORDER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Cart Items / Forms */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm">
            <div className="flex items-center space-x-4 mb-12">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step === 'cart' ? 'bg-black text-white border-black' : 'text-gray-300 border-gray-100'}`}>1</span>
              <div className="h-[2px] w-12 bg-gray-100"></div>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step === 'shipping' ? 'bg-black text-white border-black' : 'text-gray-300 border-gray-100'}`}>2</span>
              <div className="h-[2px] w-12 bg-gray-100"></div>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step === 'payment' ? 'bg-black text-white border-black' : 'text-gray-300 border-gray-100'}`}>3</span>
            </div>

            {step === 'cart' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black uppercase">Shopping Cart</h2>
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.id} className="py-6 flex space-x-6 items-center">
                      <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 relative">
                        <img
                          src="https://www.freeiconspng.com/uploads/t-shirt-png-t-shirt-png-image-32.png"
                          className="w-full h-full object-contain p-2"
                          style={{ backgroundColor: '#f3f4f6' }}
                        />
                        {item.customDesignUrl && (
                          <img
                            src={item.customDesignUrl}
                            className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[40%] object-contain mix-blend-multiply"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">Premium Tee</h4>
                            <p className="text-sm text-gray-500">{item.size} / {item.color}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md">-</button>
                            <span className="font-bold">{item.quantity}</span>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md">+</button>
                          </div>
                          <span className="font-black">$29.99</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('shipping')}
                  className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  CONTINUE TO SHIPPING
                </button>
              </div>
            )}

            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-8">
                <h2 className="text-2xl font-black uppercase">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.name}
                      onChange={e => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Email for updates</label>
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={e => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.line1}
                      onChange={e => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">State / Province</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Country Code</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={shippingAddress.country}
                      onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value.toUpperCase() })}
                      className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-black"
                      placeholder="US"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep('cart')} className="flex-1 py-5 bg-gray-100 rounded-2xl font-bold">BACK</button>
                  <button type="submit" disabled={paymentLoading} className="flex-[2] py-5 bg-black text-white rounded-2xl font-bold disabled:opacity-50">
                    {paymentLoading ? 'INITIALIZING PAYMENT...' : 'CONTINUE TO PAYMENT'}
                  </button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase">Secure Payment</h2>
                  <div className="flex space-x-2 grayscale opacity-50">
                    <i className="fa-brands fa-cc-visa text-2xl"></i>
                    <i className="fa-brands fa-cc-mastercard text-2xl"></i>
                    <i className="fa-brands fa-cc-stripe text-2xl"></i>
                  </div>
                </div>

                <div className="p-8 border-2 border-black rounded-3xl">
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeCheckoutForm
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading payment form...</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button onClick={() => setStep('shipping')} className="flex-1 py-5 bg-gray-100 rounded-2xl font-bold">BACK</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm sticky top-28">
            <h3 className="text-xl font-black uppercase mb-8 border-b border-gray-50 pb-4">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className={`font-bold ${shipping === 0 ? 'text-green-500' : 'text-black'}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 border-t border-gray-50 pt-4">
                <span className="text-lg font-black text-black">Total</span>
                <span className="text-2xl font-black text-black">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3">
              <i className="fa-solid fa-shield-check text-blue-500 mt-1"></i>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Your transaction is encrypted with 256-bit SSL. Fresh Life Style does not store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
