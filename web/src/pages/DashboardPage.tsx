import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { RoleGuard } from '../components/RoleGuard';
import type { Role } from '../types/auth';

type FeatureCard = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

const roleFeatures: Record<Role, FeatureCard[]> = {
  farmer: [
    {
      title: 'Crop marketplace',
      description: 'List your upcoming or harvested crops for direct sale to verified buyers.',
      icon: '🌾',
      href: '/produce',
    },
    {
      title: 'Market price tracker',
      description: 'Check daily commodity rates and pricing trends across Philippine regions.',
      icon: '📈',
      href: '/market-prices',
    },
    {
      title: 'Farm finances',
      description: 'Log income, expenses, and yields to understand your farm profitability.',
      icon: '📒',
      href: '/finances',
    },
    {
      title: 'Community forum',
      description: 'Ask questions, share techniques, and learn from fellow farmers.',
      icon: '💬',
      href: '/community',
    },
  ],
  buyer: [
    {
      title: 'Browse produce',
      description: 'Discover fresh crops and livestock from verified local farmers.',
      icon: '📦',
      href: '/produce',
    },
    {
      title: 'Supply store',
      description: 'Order agricultural inputs, equipment, and materials from trusted suppliers.',
      icon: '🛒',
      href: '/supply',
    },
  ],
  supplier: [
    {
      title: 'Product catalog',
      description: 'List seeds, fertilizers, tools, and heavy machinery for farmers to order.',
      icon: '🌱',
      href: '/supply/manage',
    },
    {
      title: 'Manage orders',
      description: 'Track incoming orders and fulfill supply requests from farmers.',
      icon: '📋',
      href: '/supply/orders',
    },
  ],
  expert: [
    {
      title: 'Community hub',
      description: 'Answer crop diagnosis queries and publish farming guides for the community.',
      icon: '🎓',
      href: '/community',
    },
    {
      title: 'Market data',
      description: 'Record and verify commodity price data across regions.',
      icon: '📊',
      href: '/market-prices/manage',
    },
  ],
  lgu_staff: [
    {
      title: 'User Approvals',
      description: 'Review and approve farmer, buyer, supplier, and expert accounts for your LGU.',
      icon: '👥',
      href: '/lgu/approvals',
    },
    {
      title: 'Regional analytics',
      description: 'Monitor harvest yields, food security metrics, and commodity trends.',
      icon: '🗺️',
      href: '/lgu/dashboard',
    },
    {
      title: 'Government programs',
      description: 'Publish and manage agricultural subsidy programs for registered farmers.',
      icon: '🏛️',
      href: '/programs/manage',
    },
    {
      title: 'Price monitoring',
      description: 'Record official market prices and broadcast alerts to the farming community.',
      icon: '📡',
      href: '/market-prices/manage',
    },
  ],
  super_admin: [
    {
      title: 'LGU Staff Approvals',
      description: 'Approve or reject LGU Staff accounts across all Philippine regions.',
      icon: '👑',
      href: '/admin/approvals',
    },
    {
      title: 'Regional Analytics',
      description: 'System-wide monitoring of agricultural activity and price trends.',
      icon: '📊',
      href: '/lgu/dashboard',
    },
    {
      title: 'Community Forum',
      description: 'View community discussions and system announcements.',
      icon: '💬',
      href: '/community',
    },
  ],
};

const roleDisplayName: Record<Role, string> = {
  farmer:      'Farmer',
  buyer:       'Buyer',
  supplier:    'Supplier',
  expert:      'Agricultural Expert',
  lgu_staff:   'LGU Staff',
  super_admin: 'Super Admin',
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleName = roleDisplayName[user.role];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main id="main-content" style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Welcome banner — single unified design */}
        <div
          className="animate-fade-in"
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            marginBottom: '40px',
            padding: '48px 52px',
            background: 'linear-gradient(150deg, var(--green-800) 0%, var(--green-600) 70%, var(--green-500) 100%)',
            color: '#fff',
          }}
        >
          {/* Ambient overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 85% 50%, rgba(255,255,255,0.06) 0%, transparent 55%), ' +
                'radial-gradient(ellipse at 10% 90%, rgba(0,0,0,0.12) 0%, transparent 40%)',
              pointerEvents: 'none',
            }}
          />

          {/* Large decorative letter */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '48px',
              bottom: '-16px',
              fontSize: '130px',
              opacity: 0.12,
              userSelect: 'none',
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-4px',
              color: '#fff',
            }}
          >
            {roleName[0]}
          </div>

          <div style={{ position: 'relative' }}>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                marginBottom: '14px',
                display: 'inline-block',
                letterSpacing: '0.08em',
                fontSize: '11px',
              }}
            >
              {roleName}
            </span>

            <h1
              style={{
                fontSize: 'clamp(26px, 4vw, 38px)',
                fontWeight: 800,
                marginBottom: '10px',
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
              }}
            >
              Welcome back, {user.firstName}
            </h1>

            <p
              style={{
                fontSize: '15px',
                opacity: 0.82,
                maxWidth: '520px',
                lineHeight: 1.65,
                textWrap: 'pretty' as any,
              }}
            >
              {user.region
                ? `Showing data for ${user.region}.`
                : 'Update your region in your profile for regional insights.'}{' '}
              Use the links below to get started.
            </p>
          </div>
        </div>

        {/* Info row */}
        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-4)',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div className="text-label" style={{ marginBottom: '6px' }}>Account status</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--green-600)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--green-500)',
                  display: 'inline-block',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
              Active
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div className="text-label" style={{ marginBottom: '6px' }}>Region</div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>
              {user.region || 'Not set — update profile'}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div className="text-label" style={{ marginBottom: '6px' }}>Email</div>
            <div
              style={{
                fontWeight: 500,
                fontSize: '14px',
                color: 'var(--color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
          </div>
        </div>

        {/* Feature Modules */}
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-text-light)',
            marginBottom: '16px',
          }}
        >
          Your modules
        </h2>

        {/* Farmer, Buyer, Supplier, Expert, LGU views */}
        {(['farmer', 'buyer', 'supplier', 'expert', 'lgu_staff'] as Role[]).map((role) => (
          <RoleGuard key={role} allowedRoles={[role]}>
            <div
              className="stagger-children"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {roleFeatures[role].map((card) => (
                <Link
                  key={card.href}
                  to={card.href}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article
                    className="card"
                    style={{
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-accent-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <h3
                        className="text-title"
                        style={{
                          marginBottom: '4px',
                          color: 'var(--color-text)',
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.55,
                          textWrap: 'pretty' as any,
                        }}
                      >
                        {card.description}
                      </p>
                    </div>
                    <div
                      style={{
                        marginTop: 'auto',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Open →
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </RoleGuard>
        ))}
      </main>
    </div>
  );
};
