import { generateText, streamText, Message } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getOrderDetails, getRecentOrders, getInvoiceDetails, checkRefundStatus, getConversationHistory } from './tools'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const model = google('gemini-2.5-flash')

// --- Agent System Prompts ---

const SYSTEM_PROMPTS = {
  ROUTER: `You are a Router Agent for a customer support system. 
  Your job is to classify the user's intent into one of three categories:
  1. "ORDER" - for questions about order status, tracking, shipping, or modifying orders.
  2. "BILLING" - for questions about invoices, payments, refunds, or subscriptions.
  3. "SUPPORT" - for general inquiries, troubleshooting, FAQs, or if the intent is unclear.
  
  Return ONLY the category name (ORDER, BILLING, or SUPPORT).`,

  ORDER: `You are an Order Support Specialist. 
  You can help users check their order status, track shipments, and view order details.
  You have access to:
  - Product Name
  - Order Status (Processing, Shipped, Delivered, Cancelled)
  - Delivery Date
  - Order Amount
  
  Always be polite and helpful. 
  If you need the user's ID to look up orders and it's not provided in the context, ask for it (or assume the logged-in user context if available).
  Today's date is ${new Date().toLocaleDateString()}`,

  BILLING: `You are a Billing Support Specialist.
  You handle questions about invoices, payments, and refunds.
  You have access to:
  - Invoice Amount and Payment Status
  - Refund Status (None, Requested, Processed)
  - Link to Invoice PDF (Invoice URL)

  Verify details before confirming sensitive financial information.
  Today's date is ${new Date().toLocaleDateString()}`,

  SUPPORT: `You are a General Customer Support Agent.
  You answer FAQs, help with troubleshooting, and provide general assistance.
  You can also query the conversation history to understand past context if needed.
  If you can't answer a question, advise the user to contact human support at support@example.com.`,
}

export async function routeMessage(lastMessage: string): Promise<'ORDER' | 'BILLING' | 'SUPPORT'> {
  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPTS.ROUTER,
    prompt: lastMessage,
  })
  
  const intent = text.trim().toUpperCase()
  if (['ORDER', 'BILLING', 'SUPPORT'].includes(intent)) {
    return intent as 'ORDER' | 'BILLING' | 'SUPPORT'
  }
  return 'SUPPORT' // Fallback
}

export async function streamAgentResponse(
  agentType: 'ORDER' | 'BILLING' | 'SUPPORT',
  messages: Message[],
  userId: string
) {
  let tools = {}
  let systemPrompt = ''

  switch (agentType) {
    case 'ORDER':
      tools = { getOrderDetails, getRecentOrders }
      systemPrompt = SYSTEM_PROMPTS.ORDER + `\n Current User ID: ${userId}`
      break
    case 'BILLING':
      tools = { getInvoiceDetails, checkRefundStatus }
      systemPrompt = SYSTEM_PROMPTS.BILLING + `\n Current User ID: ${userId}`
      break
    case 'SUPPORT':
      tools = { getConversationHistory } // Added tool
      systemPrompt = SYSTEM_PROMPTS.SUPPORT + `\n Current User ID: ${userId}`
      break
  }

  // 1. Find or create conversation (Simplified logic: assumes one active conversation per user for now, or creates new if none)
  // Ideally, conversationId should be passed from frontend
  let conversation = await prisma.conversation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId, title: 'New Conversation' }
    })
  }

  // 2. Save User Message
  const lastUserMessage = messages[messages.length - 1]
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: lastUserMessage.content
    }
  })

  // Sliding Window: Keep only the last 10 messages for context
  const recentMessages = messages.slice(-10);

  // We only send the last user message + history to the specific agent
  const result = await streamText({
    model,
    system: systemPrompt,
    messages: recentMessages,
    tools: tools,
    maxSteps: 5, // Allow multi-step tool calls
    onFinish: async (event) => {
      // 3. Save Assistant Response
      await prisma.message.create({
        data: {
          conversationId: conversation!.id,
          role: 'assistant',
          content: event.text
        }
      })
    }
  })

  return result
}
