import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ForumPost {
  id: string;
  author: string;
  location: string;
  category: string;
  title: string;
  repliesCount: number;
  likesCount: number;
  expertAnswered: boolean;
  expertName?: string;
  expertReply?: string;
  time: string;
}

interface FarmingGuide {
  id: string;
  category: 'pest' | 'crop' | 'soil' | 'water' | 'postharvest';
  categoryLabel: string;
  badgeColor: string;
  title: string;
  readTime: string;
  author: string;
  authorRole: string;
  summary: string;
  keySteps: string[];
  fullContent: {
    overview: string;
    materials: string[];
    steps: { stepTitle: string; stepDesc: string }[];
    warnings: string;
  };
}

const samplePosts: ForumPost[] = [
  {
    id: 'post-1',
    author: 'Mang Cardo',
    location: 'Bukidnon',
    category: 'Crop Care',
    title: '🌱 What is the best fertilizer for red tomatoes during the rainy season?',
    repliesCount: 42,
    likesCount: 19,
    expertAnswered: true,
    expertName: 'Dr. Ramon Santos (Senior Agronomist)',
    expertReply: 'Apply high-potassium organic fertilizer (0-0-60 or fermented fruit juice) and ensure raised beds with drainage furrows to prevent bacterial wilt and root rot during heavy downpours.',
    time: '2 hours ago',
  },
  {
    id: 'post-2',
    author: 'Elena Cruz',
    location: 'Misamis Oriental',
    category: 'Pest Control',
    title: '🐛 How do I manage corn fall armyworm naturally without toxic synthetic sprays?',
    repliesCount: 27,
    likesCount: 34,
    expertAnswered: true,
    expertName: 'Agronomist Maria Clara (Pest Specialist)',
    expertReply: 'Deploy Trichogramma parasitoid cards within 14–21 days of emergence. For foliar spraying, use Neem seed kernel extract (50g/L) mixed with mild soap early in the morning before larvae burrow deep.',
    time: '4 hours ago',
  },
  {
    id: 'post-3',
    author: 'Benito Ramos',
    location: 'Cagayan de Oro',
    category: 'Market & Sales',
    title: '💰 Where can I sell bulk Carabao mangoes directly to institutional buyers in CDO?',
    repliesCount: 18,
    likesCount: 12,
    expertAnswered: false,
    time: '6 hours ago',
  },
  {
    id: 'post-4',
    author: 'Aling Tessie',
    location: 'Lanao del Norte',
    category: 'Soil & Fertilizer',
    title: '🧪 How to correct acidic soil pH (5.2) before planting yellow sweet corn?',
    repliesCount: 31,
    likesCount: 22,
    expertAnswered: true,
    expertName: 'Engr. Dan Bautista (Soil Scientist)',
    expertReply: 'Broadcast agricultural lime (calcitic or dolomitic) at 2 to 3 tons per hectare at least 3 weeks prior to furrowing. Incorporate well into the top 15cm of soil and water lightly.',
    time: '1 day ago',
  },
];

const sampleGuides: FarmingGuide[] = [
  {
    id: 'guide-1',
    category: 'pest',
    categoryLabel: '🐛 Pest & Disease Control',
    badgeColor: '#BA3C3C',
    title: 'Fall Armyworm (Spodoptera frugiperda) Management in Corn',
    readTime: '6 min read',
    author: 'Dr. Ramon Santos',
    authorRole: 'Licensed Agronomist • DA Region X',
    summary: 'A field handbook for early scout detection, mechanical trap installation, biological wasp release, and organic repellent spraying.',
    keySteps: [
      'Scout fields twice a week starting at V2 seedling emergence.',
      'Check the whorl of corn plants for "window-pane" feeding holes and moist frass.',
      'Apply Trichogramma chilonis beneficial biocontrol cards at 70 cards per hectare.',
      'Target organic Bacillus thuringiensis (Bt) sprays directly into the whorl in the evening.',
    ],
    fullContent: {
      overview: 'Fall Armyworm can devastate up to 80% of corn yield if not addressed before the 3rd larval instar stage. Integrated Pest Management (IPM) balances biological prevention with timely bio-pesticides.',
      materials: [
        'Trichogramma biocontrol cards (free from local DA-BAR or MAO office)',
        'Neem seed kernel extract or Neem oil (cold pressed)',
        'Handheld knapsack sprayer with cone nozzle',
        'Yellow sticky traps for monitoring adult moths',
      ],
      steps: [
        {
          stepTitle: 'Step 1: Early Scouting & Egg Cluster Removal',
          stepDesc: 'Inspect 20 consecutive plants in 5 different quadrants of your field. Look under lower leaves for felt-like, cream-colored egg masses and crush them manually.',
        },
        {
          stepTitle: 'Step 2: Biocontrol Deployment',
          stepDesc: 'Attach Trichogramma cards to the underside of middle leaves spaced 10 meters apart across the field when plants are knee-high.',
        },
        {
          stepTitle: 'Step 3: Targeted Botanical Spraying',
          stepDesc: 'If whorl infestation exceeds 10%, spray Neem extract (50ml/16L knapsack) at 4:30 PM to 6:00 PM so UV sunlight does not degrade the active Azadirachtin compound.',
        },
      ],
      warnings: 'Avoid spraying broad-spectrum pyrethroid chemicals that kill beneficial ladybugs, spiders, and parasitoid wasps.',
    },
  },
  {
    id: 'guide-2',
    category: 'crop',
    categoryLabel: '🌱 Crop Care & Planting',
    badgeColor: '#176B3A',
    title: 'High-Yield Rainy Season Tomato Production & Drainage Guide',
    readTime: '5 min read',
    author: 'Maria Clara, MSc',
    authorRole: 'Horticulture Specialist',
    summary: 'Best practices for raised bed preparation, nylon trellis support, mulching, and prevention of bacterial wilt in wet tropical conditions.',
    keySteps: [
      'Build raised beds at least 25–30cm high with 50cm furrow trenches for rapid water runoff.',
      'Install silver-black plastic mulch to prevent soil splashing onto bottom leaves.',
      'Staking with bamboo trellises allows optimal airflow and reduces fungal spores.',
      'Prune lower suckers up to 20cm above the soil line after first fruit cluster.',
    ],
    fullContent: {
      overview: 'Wet season tomato production offers peak market prices (up to ₱80/kg), but requires rigorous field sanitation and elevated drainage beds to prevent fungal blight and bacterial wilt.',
      materials: [
        'Bacterial wilt-resistant tomato seedlings (e.g. Diamante Max)',
        'Silver-black polyethylene mulch film (1.2m width)',
        'Bamboo poles (1.5m length) and plastic twine',
        'Copper hydroxide fungicide for rainy day protection',
      ],
      steps: [
        {
          stepTitle: 'Step 1: Bed Preparation & Furrowing',
          stepDesc: 'Plow and rotovate the soil twice. Construct raised planting beds 1 meter wide and 30cm high. Space beds 60cm apart for deep drainage furrows.',
        },
        {
          stepTitle: 'Step 2: Mulch Installation & Spacing',
          stepDesc: 'Stretch plastic mulch tightly over beds with silver side facing up. Punch holes 50cm apart in a double-row staggered layout.',
        },
        {
          stepTitle: 'Step 3: Staking and Trellising',
          stepDesc: 'Erect bamboo stakes 2 weeks after transplanting. Tie main stems loosely with twine using figure-8 knots to support heavy fruit clusters.',
        },
      ],
      warnings: 'Never handle or prune wet tomato vines to prevent mechanical transmission of Xanthomonas bacterial spot.',
    },
  },
  {
    id: 'guide-3',
    category: 'soil',
    categoryLabel: '🧪 Soil & Fertilizers',
    badgeColor: '#D97706',
    title: 'Low-Cost Organic Foliar Fertilizer & Compost Tea Preparation',
    readTime: '7 min read',
    author: 'Engr. Dan Bautista',
    authorRole: 'Soil & Plant Nutritionist',
    summary: 'Step-by-step fermentation recipe using local banana trunks, molasses, and aged manure to provide bioavailable nitrogen and potassium.',
    keySteps: [
      'Chop fresh tender banana pseudo-stems or bamboo shoots finely.',
      'Mix 1 part plant material with 1 part crude molasses or brown sugar in an airtight container.',
      'Ferment for 7 days in a shaded, well-ventilated area.',
      'Dilute 2 tablespoons of extracted liquid per 1 liter of non-chlorinated water for foliar spraying.',
    ],
    fullContent: {
      overview: 'Fermented Plant Juice (FPJ) and Fermented Fruit Juice (FFJ) provide beneficial microorganisms, plant growth hormones, and readily absorbable macronutrients at minimal input costs.',
      materials: [
        'Fresh tender vegetative tips (Banana shoot, Kangkong, or Madre de Cacao)',
        'Crude sugarcane molasses or raw muscovado sugar',
        'Food-grade plastic bucket with airtight lid and breather hole',
        'Cheesecloth or fine strainer',
      ],
      steps: [
        {
          stepTitle: 'Step 1: Harvesting Plant Tissues',
          stepDesc: 'Harvest plant materials before sunrise when plant vigor and microbial counts are at their daily peak. Do not wash with chlorinated tap water.',
        },
        {
          stepTitle: 'Step 2: Layering & Compacting',
          stepDesc: 'Chop materials into 1-inch pieces. Layer alternately with molasses in the container. Press down firmly until container is 80% full.',
        },
        {
          stepTitle: 'Step 3: Fermentation & Extraction',
          stepDesc: 'Seal with porous paper or cloth. Store in cool dark room for 7 days. Strain liquid into sanitized glass or plastic bottles with loose caps.',
        },
      ],
      warnings: 'Do not spray foliar nutrients under intense midday sun to prevent leaf scorching. Apply between 6:00 AM – 8:00 AM.',
    },
  },
  {
    id: 'guide-4',
    category: 'water',
    categoryLabel: '💧 Water & Irrigation',
    badgeColor: '#0284C7',
    title: 'Gravity-Fed Drip Irrigation for Smallholder Vegetable Plots',
    readTime: '4 min read',
    author: 'Engr. Rafael Gomez',
    authorRole: 'Agri-Infrastructure Consultant',
    summary: 'Design and assemble an efficient low-cost irrigation system using an elevated 200L drum and perforated drip lines.',
    keySteps: [
      'Elevate a 200-liter drum 1.5 to 2.0 meters above bed level to produce natural 0.2 bar water head.',
      'Install a 120-mesh screen filter at the tank outlet to prevent emitter clogging.',
      'Run a 16mm PE mainline connecting to 12mm lateral lines with 20cm emitter spacing.',
      'Saves up to 60% water compared to furrow flooding and eliminates soil erosion.',
    ],
    fullContent: {
      overview: 'Gravity-fed drip systems deliver uniform root-zone moisture without requiring diesel or electric water pumps, dramatically lowering production costs.',
      materials: [
        '200-liter plastic drum on sturdy timber/concrete stand',
        '1-inch PVC ball valve and threaded bulkhead fitting',
        '120-mesh T-filter (disc or screen)',
        '16mm Polyethylene tubing and micro-drip lateral tapes',
      ],
      steps: [
        {
          stepTitle: 'Step 1: Tank Setup and Elevation',
          stepDesc: 'Place water reservoir on a raised platform at the highest elevation point in your garden. Cover top with fine mosquito netting.',
        },
        {
          stepTitle: 'Step 2: Filter and Sub-main Assembly',
          stepDesc: 'Connect ball valve and mesh filter immediately after the tank drain. Direct mainline along the head of the planting rows.',
        },
        {
          stepTitle: 'Step 3: Laying Drip Lines',
          stepDesc: 'Unroll lateral drip tapes with emitters facing upward. Anchor ends with plastic stakes and flush the lines before sealing the ends with figure-8 clips.',
        },
      ],
      warnings: 'Flush lateral lines every 2 weeks by uncapping ends for 60 seconds to discharge silt and algae accumulations.',
    },
  },
];

interface CommunityHubPageProps {
  initialTab?: 'community' | 'guides';
}

export const CommunityHubPage: React.FC<CommunityHubPageProps> = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL hash, props, or path
  const [activeTab, setActiveTab] = useState<'community' | 'guides'>(() => {
    if (initialTab) return initialTab;
    if (location.pathname.includes('/guides') || location.hash === '#guides') return 'guides';
    return 'community';
  });

  // Sync state if URL hash or pathname changes
  useEffect(() => {
    if (location.pathname.includes('/guides') || location.hash === '#guides') {
      setActiveTab('guides');
    } else if (location.hash === '#community' || location.pathname === '/community') {
      setActiveTab('community');
    }
  }, [location.hash, location.pathname]);

  const handleTabChange = (tab: 'community' | 'guides') => {
    setActiveTab(tab);
    if (tab === 'guides') {
      navigate('/community#guides', { replace: true });
    } else {
      navigate('/community', { replace: true });
    }
  };

  // Community Forum State
  const [posts, setPosts] = useState<ForumPost[]>(samplePosts);
  const [forumCategory, setForumCategory] = useState('All');
  const [showAskModal, setShowAskModal] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Crop Care');
  const [questionDetails, setQuestionDetails] = useState('');

  // Guides State
  const [guidesSearch, setGuidesSearch] = useState('');
  const [selectedGuideCategory, setSelectedGuideCategory] = useState('all');
  const [activeGuideModal, setActiveGuideModal] = useState<FarmingGuide | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      author: 'Juan Dela Cruz',
      location: 'Northern Mindanao',
      category: questionCategory,
      title: `🌱 ${questionTitle}`,
      repliesCount: 0,
      likesCount: 1,
      expertAnswered: false,
      time: 'Just now',
    };

    setPosts([newPost, ...posts]);
    setShowAskModal(false);
    setQuestionTitle('');
    setQuestionDetails('');
  };

  // Filtered Forum Posts
  const filteredPosts = forumCategory === 'All'
    ? posts
    : posts.filter((p) => p.category.toLowerCase().includes(forumCategory.toLowerCase()));

  // Filtered Guides
  const filteredGuides = sampleGuides.filter((g) => {
    const matchesCat = selectedGuideCategory === 'all' || g.category === selectedGuideCategory;
    const matchesSearch = !guidesSearch.trim() ||
      g.title.toLowerCase().includes(guidesSearch.toLowerCase()) ||
      g.summary.toLowerCase().includes(guidesSearch.toLowerCase()) ||
      g.author.toLowerCase().includes(guidesSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="app-container" style={{ paddingBottom: '50px' }}>
      {/* ─── Page Header ─── */}
      <div style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
            {activeTab === 'community' ? 'Farmer Forum & Community Q&A' : 'Agricultural Learning Hub & Field Guides'}
          </h1>
          <p style={{ fontSize: '19px', color: '#525450', marginTop: '6px', marginBottom: '20px' }}>
            {activeTab === 'community'
              ? 'Ask crop questions, discuss local farm prices, and receive verified recommendations from licensed agronomists.'
              : 'Practical, step-by-step agricultural handbooks, pest identification sheets, and crop management manuals.'}
          </p>
        </div>

        {/* ─── Top Segregated Navigation Tabs ─── */}
        <div
          style={{
            display: 'inline-flex',
            background: '#EAECE9',
            padding: '6px',
            borderRadius: '16px',
            gap: '6px',
          }}
        >
          <button
            onClick={() => handleTabChange('community')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '17px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'community' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'community' ? '#0E4A27' : '#525450',
              boxShadow: activeTab === 'community' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <span>💬</span>
            <span>Community Forum</span>
          </button>

          <button
            onClick={() => handleTabChange('guides')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '17px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'guides' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'guides' ? '#0E4A27' : '#525450',
              boxShadow: activeTab === 'guides' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <span>📖</span>
            <span>Learn & Field Guides</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: COMMUNITY FORUM (Q&A Feed & Verified Expert Answers)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'community' && (
        <div>
          {/* Forum Action & Filter Bar */}
          <div className="card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Crop Care', 'Pest Control', 'Soil & Fertilizer', 'Market & Sales'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForumCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: forumCategory === cat ? '2px solid #0E4A27' : '1px solid #CBD5E1',
                    background: forumCategory === cat ? '#EAF6EE' : '#FFFFFF',
                    color: forumCategory === cat ? '#0E4A27' : '#525450',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAskModal(true)}
              className="btn btn-primary btn-large"
              style={{ fontSize: '17px' }}
            >
              + Ask a Farming Question
            </button>
          </div>

          {/* Forum Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {filteredPosts.map((post) => (
              <div key={post.id} className="card" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge" style={{ background: '#F1F5F9', color: '#475569', fontSize: '13px', fontWeight: 700 }}>
                      🏷️ {post.category}
                    </span>
                    <span style={{ fontSize: '15px', color: '#525450', fontWeight: 700 }}>
                      👤 {post.author} ({post.location}) • {post.time}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', color: '#176B3A', fontWeight: 800 }}>
                      💬 {post.repliesCount} replies
                    </span>
                    <span style={{ fontSize: '15px', color: '#525450', fontWeight: 700 }}>
                      👍 {post.likesCount}
                    </span>
                  </div>
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27', marginBottom: '16px', lineHeight: 1.3 }}>
                  {post.title}
                </h2>

                {/* Verified Expert Answer Box */}
                {post.expertAnswered && (
                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: '#EAF6EE',
                      border: '2px solid #176B3A',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-verified" style={{ background: '#FFFFFF', fontSize: '14px' }}>
                        ✓ Licensed Agronomist Verified
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0E4A27' }}>
                        {post.expertName}
                      </span>
                    </div>
                    <p style={{ fontSize: '17px', color: '#1A1C1A', lineHeight: 1.6, margin: 0 }}>
                      "{post.expertReply}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: LEARN & FIELD GUIDES (Handbooks, Pest ID, & Agronomic Manuals)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'guides' && (
        <div>
          {/* Guides Search & Category Filters */}
          <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 800 }}>Search Agricultural Guides</label>
                <input
                  type="text"
                  value={guidesSearch}
                  onChange={(e) => setGuidesSearch(e.target.value)}
                  placeholder="e.g. armyworm, fertilizer, tomato blight, drip irrigation..."
                  className="form-input"
                  style={{ fontSize: '17px', height: '52px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 800 }}>Category Topic</label>
                <select
                  value={selectedGuideCategory}
                  onChange={(e) => setSelectedGuideCategory(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '17px', height: '52px' }}
                >
                  <option value="all">All Guide Topics (4)</option>
                  <option value="pest">Pest & Disease Control</option>
                  <option value="crop">Crop Care & Planting</option>
                  <option value="soil">Soil & Organic Fertilizers</option>
                  <option value="water">Water & Irrigation</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Guides' },
                { key: 'pest', label: '🐛 Pest Control' },
                { key: 'crop', label: '🌱 Crop Production' },
                { key: 'soil', label: '🧪 Soil & Fertilizers' },
                { key: 'water', label: '💧 Irrigation' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setSelectedGuideCategory(pill.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: selectedGuideCategory === pill.key ? '2px solid #0E4A27' : '1px solid #E2E8F0',
                    background: selectedGuideCategory === pill.key ? '#EAF6EE' : '#FFFFFF',
                    color: selectedGuideCategory === pill.key ? '#0E4A27' : '#525450',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guides Catalog Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '26px' }}>
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '28px',
                  borderTop: `6px solid ${guide.badgeColor}`,
                  borderRadius: '18px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: '#F1F5F9',
                        color: guide.badgeColor,
                        fontWeight: 800,
                        fontSize: '13px',
                      }}
                    >
                      {guide.categoryLabel}
                    </span>
                    <span style={{ fontSize: '14px', color: '#525450', fontWeight: 600 }}>
                      ⏱️ {guide.readTime}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0E4A27', marginBottom: '10px', lineHeight: 1.3 }}>
                    {guide.title}
                  </h3>

                  <div style={{ fontSize: '14px', color: '#525450', marginBottom: '14px', fontWeight: 600 }}>
                    ✍️ By <strong>{guide.author}</strong> ({guide.authorRole})
                  </div>

                  <p style={{ fontSize: '16px', color: '#334155', lineHeight: 1.5, marginBottom: '18px' }}>
                    {guide.summary}
                  </p>

                  <div style={{ background: '#F8FAF8', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0E4A27', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Key Field Action Checklist:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                      {guide.keySteps.slice(0, 3).map((s, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveGuideModal(guide)}
                  className="btn btn-primary btn-full"
                  style={{ fontSize: '16px', fontWeight: 800 }}
                >
                  Read Full Guide & Protocol →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Ask Question Modal ─── */}
      {showAskModal && (
        <div className="modal-backdrop" onClick={() => setShowAskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0E4A27', margin: 0 }}>
                + Ask a Farming Question
              </h2>
              <button
                onClick={() => setShowAskModal(false)}
                style={{ background: '#F8F7F3', border: 'none', fontSize: '22px', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Question Title / Crop Issue</label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="e.g. Yellow leaves on bell peppers after transplanting..."
                  className="form-input"
                  style={{ fontSize: '18px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '17px' }}
                >
                  <option value="Crop Care">Crop Care & Health</option>
                  <option value="Pest Control">Pest & Disease Control</option>
                  <option value="Soil & Fertilizer">Soil & Fertilizer</option>
                  <option value="Market & Sales">Market Prices & Bulk Selling</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '26px' }}>
                <label className="form-label">Additional Details (Symptoms, Crop Age, Soil Condition)</label>
                <textarea
                  value={questionDetails}
                  onChange={(e) => setQuestionDetails(e.target.value)}
                  placeholder="Provide details to help licensed agronomists accurately diagnose..."
                  rows={4}
                  className="form-input"
                  style={{ fontSize: '17px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button type="button" onClick={() => setShowAskModal(false)} className="btn btn-secondary btn-large" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-large" style={{ flex: 2 }}>
                  Post Question →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Guide Reader Modal ─── */}
      {activeGuideModal && (
        <div className="modal-backdrop" onClick={() => setActiveGuideModal(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '36px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    background: '#F1F5F9',
                    color: activeGuideModal.badgeColor,
                    fontWeight: 800,
                    fontSize: '14px',
                  }}
                >
                  {activeGuideModal.categoryLabel}
                </span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0E4A27', margin: '12px 0 6px 0' }}>
                  {activeGuideModal.title}
                </h2>
                <div style={{ fontSize: '15px', color: '#525450', fontWeight: 600 }}>
                  👨‍🌾 Prepared by <strong>{activeGuideModal.author}</strong> ({activeGuideModal.authorRole}) • ⏱️ {activeGuideModal.readTime}
                </div>
              </div>

              <button
                onClick={() => setActiveGuideModal(null)}
                style={{ background: '#F8F7F3', border: 'none', fontSize: '22px', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '18px', background: '#F8FAF8', borderRadius: '14px', borderLeft: `6px solid ${activeGuideModal.badgeColor}`, marginBottom: '24px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0E4A27', marginBottom: '4px' }}>
                Protocol Overview:
              </div>
              <p style={{ margin: 0, fontSize: '16px', color: '#334155', lineHeight: 1.6 }}>
                {activeGuideModal.fullContent.overview}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '12px' }}>
                🛠️ Required Inputs & Materials
              </h3>
              <ul style={{ margin: 0, paddingLeft: '22px', fontSize: '16px', color: '#334155', lineHeight: 1.6 }}>
                {activeGuideModal.fullContent.materials.map((m, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{m}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0E4A27', marginBottom: '14px' }}>
                📋 Practical Step-by-Step Procedure
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeGuideModal.fullContent.steps.map((st, idx) => (
                  <div key={idx} style={{ padding: '18px', borderRadius: '14px', background: '#FFFFFF', border: '1.5px solid #E2E8F0' }}>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#0E4A27', marginBottom: '6px' }}>
                      {st.stepTitle}
                    </div>
                    <p style={{ margin: 0, fontSize: '16px', color: '#475569', lineHeight: 1.6 }}>
                      {st.stepDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Field Warning */}
            <div style={{ padding: '18px', borderRadius: '14px', background: '#FEF2F2', border: '2px solid #F87171', marginBottom: '28px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️</span> Critical Field Safety Warning:
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '15px', color: '#7F1D1D', lineHeight: 1.5 }}>
                {activeGuideModal.fullContent.warnings}
              </p>
            </div>

            <button
              onClick={() => setActiveGuideModal(null)}
              className="btn btn-secondary btn-full btn-large"
              style={{ fontSize: '17px' }}
            >
              Close Guide Reader
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
