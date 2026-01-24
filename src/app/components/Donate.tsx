import { Heart, Users, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'NGN', label: 'NGN (₦)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
];

type Notice = { type: 'success' | 'error' | 'info'; message: string };

export function Donate() {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const txRef = params.get('tx_ref') || '';
    const transactionId = params.get('transaction_id');

    if (!status) return;

    if (status === 'successful' && transactionId) {
      setNotice({ type: 'info', message: 'Verifying your donation...' });
      fetch(
        `/api/flutterwave/verify?transaction_id=${encodeURIComponent(
          transactionId
        )}&tx_ref=${encodeURIComponent(txRef)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setNotice({
              type: 'success',
              message: 'Thank you! Your donation was successful.',
            });
          } else {
            setNotice({
              type: 'error',
              message:
                'We could not verify your donation yet. Please contact us.',
            });
          }
        })
        .catch(() => {
          setNotice({
            type: 'error',
            message: 'Verification failed. Please contact us.',
          });
        });
    } else if (status === 'cancelled') {
      setNotice({
        type: 'error',
        message: 'Donation cancelled. You can try again anytime.',
      });
    } else if (status === 'failed') {
      setNotice({
        type: 'error',
        message: 'Donation failed. Please try again.',
      });
    }

    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}#donate`
    );
  }, []);

  const handleDonate = async () => {
    setNotice(null);

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setNotice({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }
    if (!email || !email.includes('@')) {
      setNotice({ type: 'error', message: 'Please enter a valid email.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/flutterwave/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNumber,
          currency,
          email,
          name,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment init failed');
      }

      window.location.href = data.link;
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Payment init failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="donate"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1a4d5d] to-[#0f3642] text-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Support Our Mission</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Your generous contribution helps us continue Timothy and Ruth&apos;s
            legacy of compassion and service
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#8b3a3a] rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Every Gift Matters</h3>
                <p className="text-blue-100">
                  Whether large or small, every donation helps us reach more
                  people and create lasting change in communities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#8b3a3a] rounded-lg flex items-center justify-center flex-shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Direct Impact</h3>
                <p className="text-blue-100">
                  100% of your donation goes directly to our programs, ensuring
                  maximum impact for those we serve.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#8b3a3a] rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Ongoing Support</h3>
                <p className="text-blue-100">
                  Consider becoming a monthly donor to provide sustainable
                  support for our long-term initiatives.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl">
            <h3 className="text-2xl font-bold text-[#1a4d5d] mb-6">
              Make a Donation
            </h3>

            {notice && (
              <div
                className={`mb-6 rounded-lg px-4 py-3 text-sm ${
                  notice.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : notice.type === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {notice.message}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1a4d5d] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1a4d5d] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 555 5555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1a4d5d] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1a4d5d] focus:outline-none"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter donation amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1a4d5d] focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleDonate}
              disabled={isSubmitting}
              className="w-full bg-[#8b3a3a] text-white py-4 rounded-lg hover:bg-[#6d2d2d] transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
            >
              <Heart size={20} />
              {isSubmitting ? 'Redirecting...' : 'Donate Now'}
            </button>

            <p className="text-sm text-gray-500 text-center mt-4">
              Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
