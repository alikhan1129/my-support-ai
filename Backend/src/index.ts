import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { streamText } from 'hono/streaming'
import { routeMessage, streamAgentResponse } from './ai/service'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => {
  return c.text('Support AI Backend is running!')
})

// Schema for the chat request
const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  userId: z.string().optional().default('a7b50481-1089-49a0-97b0-5939536d53d1') // Default to our seeded user for now
})

// Main Chat Endpoint
app.post('/api/chat', zValidator('json', chatSchema as any), async (c) => {
  const { messages, userId } = c.req.valid('json')
  
  // Get the last user message to determine intent
  const lastMessage = messages[messages.length - 1]
  if (lastMessage.role !== 'user') {
    return c.json({ error: 'Last message must be from user' }, 400)
  }

  // 1. Route the intent
  const agentType = await routeMessage(lastMessage.content)
  console.log(`Routed to: ${agentType}`)

  // 2. Stream the response from the specific agent
  const result = await streamAgentResponse(agentType, messages as any, userId)

  return result.toDataStreamResponse()
})

// Error handling middleware
app.onError((err, c) => {
  console.error('Global Error:', err)
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

const port = Number(process.env.PORT) || 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})