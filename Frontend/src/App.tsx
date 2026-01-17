import { useChat } from 'ai/react'
import { Send, User, Bot } from 'lucide-react'

function App() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${import.meta.env.VITE_API_URL || ''}/api/chat`,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', width: '600px', margin: '0 auto', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '20px', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>AI Support Agent</h1>
        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
          Orders, Billing, & General Support
        </p>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>
            <p>How can I help you today?</p>
            <small>Try: "Where is my order?" or "I need a refund"</small>
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} style={{ 
            display: 'flex', 
            gap: '10px', 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%' 
          }}>
            <div style={{ 
              width: '30px', height: '30px', borderRadius: '50%', 
              background: m.role === 'user' ? '#007bff' : '#444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div style={{ 
              background: m.role === 'user' ? '#007bff' : '#333',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '12px',
              borderTopLeftRadius: m.role === 'assistant' ? '2px' : '12px',
              borderTopRightRadius: m.role === 'user' ? '2px' : '12px',
              textAlign: 'left'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', marginLeft: '40px', opacity: 0.5 }}>
            Typing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ padding: '20px', background: '#1a1a1a', display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '4px', 
            border: '1px solid #444',
            background: '#242424',
            color: 'white'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            background: isLoading ? '#555' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  )
}

export default App
