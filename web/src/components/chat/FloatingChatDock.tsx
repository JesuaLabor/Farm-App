import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../api/chat';
import type { ChatMessage, ProductCard } from '../../types/chat';

export const FloatingChatDock: React.FC = () => {
  const { user } = useAuth();
  const {
    isOpen,
    isMinimized,
    unreadCount,
    activeConversation,
    conversations,
    closeChat,
    minimizeChat,
    maximizeChat,
    openConversation,
    refreshUnreadCount,
    refreshConversations,
  } = useChat();

  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showList, setShowList] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // If there's an active conversation, fetch its messages and poll every 3s
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const msgs = await chatApi.listMessages(convId);
      setMessages(msgs);
      await chatApi.markAsRead(convId);
      refreshUnreadCount();
    } catch {
      // ignore
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!isOpen || isMinimized || !activeConversation) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    fetchMessages(activeConversation.id);

    pollIntervalRef.current = window.setInterval(() => {
      fetchMessages(activeConversation.id);
    }, 3500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isOpen, isMinimized, activeConversation, fetchMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  // Handle sending a new message
  const handleSendMessage = async (textToSend?: string, attachedCard?: ProductCard) => {
    const text = (textToSend ?? inputText).trim();
    if (!text && !attachedCard) return;
    if (!activeConversation || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      const createdMsg = await chatApi.sendMessage(activeConversation.id, {
        content: text,
        productCard: attachedCard,
      });

      setMessages((prev) => [...prev, createdMsg]);
      refreshConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Find other participant in active conversation
  const otherParticipant = activeConversation?.participants.find((p) => p.userId !== user.id);

  // Filter conversations for the list view
  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const other = c.participants.find((p) => p.userId !== user.id);
    const nameMatch = other?.name.toLowerCase().includes(q);
    const titleMatch = c.context?.title?.toLowerCase().includes(q);
    return nameMatch || titleMatch;
  });

  // Do not render on messages page (which has the dedicated full-page hub), login, or register
  if (
    location.pathname === '/messages' ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) {
    return null;
  }

  // If chat is not open, do not show any floating launcher bubble
  if (!isOpen) {
    return null;
  }

  // 1. Minimized floating pill
  if (isOpen && isMinimized) {
    return (
      <div
        onClick={maximizeChat}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#0E4A27',
          color: '#FFFFFF',
          borderRadius: '28px',
          padding: '10px 18px',
          boxShadow: '0 8px 24px rgba(14, 74, 39, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: '20px' }}>💬</span>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                background: '#DC2626',
                color: '#fff',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <span style={{ fontWeight: 700, fontSize: '14px' }}>
          {otherParticipant ? otherParticipant.name : 'AgriConnect Chat'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeChat();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px',
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  // Open Floating Chat Window
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '390px',
        maxWidth: 'calc(100vw - 32px)',
        height: '560px',
        maxHeight: 'calc(100vh - 48px)',
        zIndex: 9999,
        background: '#FFFFFF',
        borderRadius: '18px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(14, 74, 39, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        fontFamily: 'inherit',
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0E4A27 0%, #166534 100%)',
          color: '#FFFFFF',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {showList || !activeConversation ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Messages</h3>
                <span style={{ fontSize: '11px', opacity: 0.85 }}>AgriConnect Direct Chat</span>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowList(true);
                  refreshConversations();
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
                title="Back to conversations"
              >
                ←
              </button>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  fontWeight: 800,
                  fontSize: '14px',
                  flexShrink: 0,
                  border: '1.5px solid rgba(255,255,255,0.4)',
                }}
              >
                {otherParticipant?.photoUrl ? (
                  <img
                    src={otherParticipant.photoUrl}
                    alt={otherParticipant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (otherParticipant?.name?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {otherParticipant?.name || 'User'}
                  </h4>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.2)',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                    }}
                  >
                    {otherParticipant?.role || 'user'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }}></span>
                  <span style={{ fontSize: '11px', opacity: 0.85 }}>Online now</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={minimizeChat}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 800,
            }}
            title="Minimize"
          >
            —
          </button>
          <button
            onClick={closeChat}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 800,
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ─── Main Body: List View OR Conversation View ─── */}
      {showList || !activeConversation ? (
        /* ─── Conversations List View ─── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F9FAFB' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>💬</span>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>No conversations yet</p>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  Click <strong>"Chat Now"</strong> on any crop listing or supply item to start chatting!
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const other = c.participants.find((p) => p.userId !== user.id);
                const hasUnread = (c.unreadCounts?.[user.id] || 0) > 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      openConversation(c);
                      setShowList(false);
                    }}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                      background: hasUnread ? '#EFFDF5' : '#FFFFFF',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = hasUnread ? '#EFFDF5' : '#FFFFFF')}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#0E4A27',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {other?.photoUrl ? (
                        <img
                          src={other.photoUrl}
                          alt={other.name}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        (other?.name?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: hasUnread ? 800 : 700, color: '#111827' }}>
                          {other?.name || 'User'}
                        </span>
                        {c.lastMessage && (
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      {c.context?.title && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#0E4A27',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          📦 {c.context.title}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '12px',
                          color: hasUnread ? '#111827' : '#6B7280',
                          fontWeight: hasUnread ? 700 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {c.lastMessage?.content || 'Started a conversation'}
                      </div>
                    </div>
                    {hasUnread && (
                      <span
                        style={{
                          background: '#166534',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          padding: '2px 6px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {c.unreadCounts[user.id]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ─── Active Chat Thread View ─── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sticky Product Context Header */}
          {activeConversation.context && activeConversation.context.title && (
            <div
              style={{
                background: '#F0FDF4',
                borderBottom: '1px solid #DCFCE7',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {activeConversation.context.image && (
                <img
                  src={activeConversation.context.image}
                  alt={activeConversation.context.title}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #BBF7D0',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#15803D',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeConversation.context.title}
                </div>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: 800 }}>
                  ₱{activeConversation.context.price?.toLocaleString()}
                  {activeConversation.context.unit ? ` / ${activeConversation.context.unit}` : ''}
                </div>
              </div>
              <button
                onClick={() => {
                  const card: ProductCard = {
                    type: activeConversation.context!.type,
                    id: activeConversation.context!.referenceId || '',
                    title: activeConversation.context!.title || '',
                    image: activeConversation.context!.image || '',
                    price: activeConversation.context!.price || 0,
                    unit: activeConversation.context!.unit,
                  };
                  handleSendMessage('Here is the item I am inquiring about:', card);
                }}
                style={{
                  background: '#15803D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Send Item Card
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: '#F9FAFB',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#6B7280' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>👋</span>
                <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>Say hello!</p>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  Start your negotiation or inquiry with {otherParticipant?.name || 'the seller'}.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Embedded Product Card if present */}
                    {msg.productCard && msg.productCard.title && (
                      <div
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '4px',
                          maxWidth: '82%',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        {msg.productCard.image && (
                          <img
                            src={msg.productCard.image}
                            alt={msg.productCard.title}
                            style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#111827',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {msg.productCard.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#0E4A27', fontWeight: 800 }}>
                            ₱{msg.productCard.price?.toLocaleString()}
                            {msg.productCard.unit ? ` / ${msg.productCard.unit}` : ''}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chat Bubble */}
                    {msg.content && (
                      <div
                        style={{
                          background: isMe ? '#0E4A27' : '#FFFFFF',
                          color: isMe ? '#FFFFFF' : '#1F2937',
                          padding: '9px 13px',
                          borderRadius: isMe ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                          maxWidth: '82%',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                          boxShadow: isMe
                            ? '0 2px 6px rgba(14, 74, 39, 0.25)'
                            : '0 2px 6px rgba(0, 0, 0, 0.05)',
                          border: isMe ? 'none' : '1px solid #E5E7EB',
                        }}
                      >
                        {msg.content}
                      </div>
                    )}

                    {/* Timestamp & Read Status */}
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#9CA3AF',
                        marginTop: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0 4px',
                      }}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <span>{msg.isRead ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Chips */}
          <div
            style={{
              padding: '6px 10px',
              background: '#FFFFFF',
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {[
              'Is this available?',
              'Can I order bulk?',
              'Best price?',
              'When is pickup/delivery?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '10px 12px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder={`Message ${otherParticipant?.name || ''}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '20px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
                background: '#F9FAFB',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: inputText.trim() && !isSending ? '#0E4A27' : '#9CA3AF',
                color: '#FFFFFF',
                border: 'none',
                cursor: inputText.trim() && !isSending ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                transition: 'background 0.15s ease',
                flexShrink: 0,
              }}
              title="Send Message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
