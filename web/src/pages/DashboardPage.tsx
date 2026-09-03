import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'farmer';

  const roleNameMap: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Wholesale Buyer',
    supplier: 'Supplier Partner',
    expert: 'Agronomist',
    lgu_staff: 'LGU Officer',
    super_admin: 'Super Admin',
  };

  const userName = user
    ? user.firstName || user.lastName || roleNameMap[role] || 'User'
    : 'User';

  const subtitleMap: Record<string, string> = {
    farmer: 'How can AgriConnect help your farm today?',
    buyer: 'Source fresh wholesale produce directly from local verified farmers.',
    supplier: 'Manage your agricultural supply inventory and customer orders.',
    expert: 'Provide agronomic advice, answer queries, and share crop guides.',
    lgu_staff: `Local Agriculture Office • ${user?.municipality ? `${user.municipality}, ` : ''}${user?.region || 'Regional Jurisdiction'}`,
    super_admin: 'Platform governance, staff approvals, and regional agricultural monitoring.',
  };

  const actionCards = (() => {
    switch (role) {
      case 'super_admin':
        return [
          {
            title: '1. Staff & Account Approvals',
            subtitle: 'Review pending LGU staff, supplier, and expert accounts',
            icon: '🛡️',
            bg: '#176B3A',
            path: '/admin/approvals',
          },
          {
            title: '2. LGU Regional Monitoring',
            subtitle: 'Inspect province & municipal agricultural activity',
            icon: '🏛️',
            bg: '#0E4A27',
            path: '/lgu/dashboard',
          },
          {
            title: '3. Manage Government Programs',
            subtitle: 'Publish subsidies and agricultural assistance programs',
            icon: '📜',
            bg: '#2B72B3',
            path: '/programs/manage',
          },
        ];
      case 'lgu_staff':
        return [
          {
            title: '1. Account Approvals',
            subtitle: `Verify farmers, buyers, and suppliers in ${user?.municipality || 'your jurisdiction'}`,
            icon: '📋',
            bg: '#176B3A',
            path: '/lgu/approvals',
          },
          {
            title: '2. Regional Farm Dashboard',
            subtitle: 'Track local crop harvests, yields, and food security',
            icon: '🏛️',
            bg: '#0E4A27',
            path: '/lgu/dashboard',
          },
          {
            title: '3. Manage Municipal Programs',
            subtitle: 'Publish agricultural assistance and subsidies',
            icon: '📜',
            bg: '#2B72B3',
            path: '/programs/manage',
          },
        ];
      case 'supplier':
        return [
          {
            title: '1. Manage Supply Products',
            subtitle: 'Add and update seeds, fertilizers, and machinery items',
            icon: '🚜',
            bg: '#176B3A',
            path: '/supply/manage',
          },
          {
            title: '2. Customer Supply Orders',
            subtitle: 'View and fulfill pending supply purchases from farmers',
            icon: '📦',
            bg: '#0E4A27',
            path: '/supply/orders',
          },
          {
            title: '3. Check Produce Marketplace',
            subtitle: 'Explore local farms and prevailing commodity rates',
            icon: '📈',
            bg: '#2B72B3',
            path: '/produce',
          },
        ];
      case 'buyer':
        return [
          {
            title: '1. Browse Produce Marketplace',
            subtitle: 'Order fresh vegetables, grains, and fruits from farms',
            icon: '🥦',
            bg: '#176B3A',
            path: '/produce',
          },
          {
            title: '2. Track Purchase Orders',
            subtitle: 'Monitor delivery progress and order confirmations',
            icon: '📦',
            bg: '#0E4A27',
            path: '/produce/orders',
          },
          {
            title: '3. Check Daily Market Prices',
            subtitle: 'Review prevailing price benchmarks and trends',
            icon: '📈',
            bg: '#2B72B3',
            path: '/market-prices',
          },
        ];
      case 'expert':
        return [
          {
            title: '1. Answer Farmer Inquiries',
            subtitle: 'Provide technical answers and diagnosis in Community',
            icon: '💬',
            bg: '#176B3A',
            path: '/community',
          },
          {
            title: '2. Publish Guides & Tips',
            subtitle: 'Share agronomic best practices and disease alerts',
            icon: '📖',
            bg: '#0E4A27',
            path: '/community#guides',
          },
          {
            title: '3. Review Market & Programs',
            subtitle: 'Check government programs and commodity prices',
            icon: '🏛️',
            bg: '#2B72B3',
            path: '/programs',
          },
        ];
      default: // farmer
        return [
          {
            title: '1. Sell My Crops',
            subtitle: 'Add a crop listing to sell to buyers',
            icon: '🥦',
            bg: '#176B3A',
            path: '/produce/manage?action=new',
          },
          {
            title: '2. Check Market Prices',
            subtitle: "See today's crop prices in Northern Mindanao",
            icon: '📈',
            bg: '#0E4A27',
            path: '/market-prices',
          },
          {
            title: '3. View My Orders',
            subtitle: 'See buyers who want to buy your crops',
            icon: '📦',
            bg: '#2B72B3',
            path: '/produce/orders',
          },
        ];
    }
  })();

  const summary = (() => {
    switch (role) {
      case 'super_admin':
        return {
          title: 'Platform Governance Summary',
          cards: [
            { label: '🛡️ Registered Users', value: '1,420', sub: 'Across 17 Philippine regions', color: '#176B3A' },
            { label: '🏛️ Active LGUs', value: '38 Offices', sub: 'Monitoring local agriculture', color: '#2B72B3' },
            { label: '📜 Assistance Programs', value: '14 Active', sub: 'National & regional subsidies', color: '#B26A00' },
          ],
        };
      case 'lgu_staff':
        return {
          title: 'Local Jurisdiction Overview',
          cards: [
            { label: '🧑‍🌾 Registered Farmers', value: '184', sub: `In ${user?.municipality || 'your municipality'}`, color: '#176B3A' },
            { label: '🥦 Active Crop Listings', value: '52 Harvests', sub: 'Available for wholesale trade', color: '#2B72B3' },
            { label: '⏳ Pending Approvals', value: '6 Accounts', sub: 'Awaiting your verification', color: '#BA3C3C' },
          ],
        };
      case 'supplier':
        return {
          title: 'Your Supply Business Summary',
          cards: [
            { label: '🚜 Products in Catalog', value: '24 Items', sub: 'Seeds, fertilizer, tools', color: '#176B3A' },
            { label: '📦 Orders to Fulfill', value: '8 Orders', sub: 'Ready for shipping/pickup', color: '#2B72B3' },
            { label: '💰 Revenue (This Month)', value: '₱56,200', sub: '↑ 18.2% vs last month', color: '#1E7E45' },
          ],
        };
      case 'buyer':
        return {
          title: 'Your Wholesale Purchasing Summary',
          cards: [
            { label: '📦 Active Orders', value: '4 Shipments', sub: 'In transit from local farms', color: '#2B72B3' },
            { label: '🥦 Produce Sourced', value: '1,850 kg', sub: 'This month across 6 farms', color: '#176B3A' },
            { label: '💰 Total Purchased', value: '₱92,400', sub: 'Direct from verified farmers', color: '#0E4A27' },
          ],
        };
      case 'expert':
        return {
          title: 'Your Advisory Activity',
          cards: [
            { label: '💬 Questions Answered', value: '47 Answers', sub: 'Helping local crop growers', color: '#176B3A' },
            { label: '📖 Guides Published', value: '6 Guides', sub: 'Pest control & soil nutrition', color: '#2B72B3' },
            { label: '⭐ Expert Rating', value: '4.9 / 5.0', sub: 'From verified farmer reviews', color: '#B26A00' },
          ],
        };
      default: // farmer
        return {
          title: 'Your Farm Summary',
          cards: [
            { label: '💚 Money Earned (This Month)', value: '₱24,850', sub: '↑ 12.4% higher than last month', color: '#176B3A' },
            { label: '🥦 Active Crops for Sale', value: '12 Crops', sub: '3 selling actively today', color: '#2B72B3' },
            { label: '💸 Money Spent (Expenses)', value: '₱8,420', sub: 'Spent on seeds & fertilizer', color: '#BA3C3C' },
          ],
        };
    }
  })();

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* ─── Compact Greeting & Location Banner ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: '#FFFFFF',
          padding: '28px 32px',
          borderRadius: '24px',
          border: '2.5px solid #E4E2DC',
          marginBottom: '32px',
          boxShadow: '0 4px 14px rgba(26, 28, 26, 0.04)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27', lineHeight: 1.2 }}>
            Hello, {userName}! 👋
          </h1>
          <p style={{ fontSize: '20px', color: '#525450', marginTop: '6px', fontWeight: 600 }}>
            {subtitleMap[role] || subtitleMap.farmer}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 22px',
            background: '#EAF6EE',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: 800,
            color: '#176B3A',
            border: '2px solid rgba(23, 107, 58, 0.3)',
          }}
        >
          <span>📍</span>
          <span>
            {user?.municipality
              ? user.municipality
              : user?.province
              ? user.province
              : user?.region || 'Set your location'}
          </span>
        </div>
      </div>

      {/* ─── Section 1: THREE BIG PRIMARY ACTION CARDS ─── */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1C1A', marginBottom: '20px' }}>
          What would you like to do?
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {actionCards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => navigate(card.path)}
              className={`big-action-card ${card.primary ? 'big-action-card-primary' : ''}`}
            >
              <div className="big-action-icon-box" style={{ background: card.bg }}>
                {card.icon}
              </div>
              <div>
                <div className="big-action-title">{card.title}</div>
                <div className="big-action-subtitle">{card.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Section 2: SUMMARY SECTION (Adaptive Plain Blocks) ─── */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1A1C1A', marginBottom: '20px' }}>
          {summary.title}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {summary.cards.map((c, idx) => (
            <div key={idx} className="card" style={{ borderLeft: `8px solid ${c.color}`, background: '#FFFFFF' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#525450', textTransform: 'uppercase' }}>
                {c.label}
              </div>
              <div style={{ fontSize: '38px', fontWeight: 800, color: '#0E4A27', margin: '8px 0 4px 0' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '17px', color: c.color, fontWeight: 800 }}>
                {c.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Section 3: TODAY'S CROP PRICES ─── */}
      <section style={{ marginBottom: '40px' }}>
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27' }}>
                Today's Crop Prices
              </h2>
              <p style={{ fontSize: '17px', color: '#525450', marginTop: '2px' }}>
                Verified prices from Department of Agriculture Region X
              </p>
            </div>
            <Link to="/market-prices" className="btn btn-secondary" style={{ fontSize: '17px' }}>
              View All Prices →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { crop: 'Tomato (Kamatis)', price: '₱65 per kg', trend: '↑ Price Going UP by 8%', color: '#1E7E45', icon: '🍅' },
              { crop: 'Corn (Mais)', price: '₱42 per kg', trend: '↓ Price Going DOWN by 3%', color: '#BA3C3C', icon: '🌽' },
              { crop: 'Rice (Palay)', price: '₱52 per kg', trend: '↑ Price Going UP by 2%', color: '#1E7E45', icon: '🌾' },
              { crop: 'Mango (Mangga)', price: '₱95 per kg', trend: '→ Price STABLE at 0%', color: '#525450', icon: '🥭' },
              { crop: 'Eggplant (Talong)', price: '₱48 per kg', trend: '↑ Price Going UP by 1%', color: '#1E7E45', icon: '🍆' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: '#F8F7F3',
                  border: '2px solid #E4E2DC',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '32px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1A1C1A' }}>{item.crop}</div>
                    <div style={{ fontSize: '16px', color: item.color, fontWeight: 800, marginTop: '2px' }}>{item.trend}</div>
                  </div>
                </div>

                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 4: PHONE ASSISTANCE HOTLINE BANNER ─── */}
      <section>
        <div
          style={{
            padding: '28px',
            borderRadius: '24px',
            background: '#EAF6EE',
            border: '3px solid #176B3A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0E4A27' }}>
              📞 Need Help Over the Phone?
            </div>
            <div style={{ fontSize: '18px', color: '#1A1C1A', marginTop: '6px', fontWeight: 600 }}>
              Speak directly to our friendly support team. We assist in Tagalog & Bisaya.
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#176B3A', marginTop: '8px' }}>
              Call Hotline: 0917-123-4567 (Free Toll)
            </div>
          </div>

          <button
            onClick={() => alert('Calling AgriConnect Farmer Hotline 0917-123-4567...')}
            className="btn btn-primary btn-large"
            style={{ fontSize: '20px' }}
          >
            📞 Call Support Now
          </button>
        </div>
      </section>
    </div>
  );
};
