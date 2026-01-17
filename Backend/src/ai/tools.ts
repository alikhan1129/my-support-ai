import { PrismaClient } from '@prisma/client'
import { tool } from 'ai'
import { z } from 'zod'

const prisma = new PrismaClient()

// --- Support Tools ---
export const getConversationHistory = tool({
  description: 'Query the conversation history for a user to understand past context or find specific information from previous chats.',
  parameters: z.object({
    userId: z.string().describe('The unique ID of the user'),
    limit: z.number().optional().default(10).describe('Number of recent messages to retrieve'),
  }),
  execute: async ({ userId, limit }) => {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Take last 5 messages from each conversation
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // Last 5 conversations
    })

    // Flatten and format for the agent
    const history = conversations.map(conv => ({
      conversationId: conv.id,
      date: conv.createdAt,
      messages: conv.messages.reverse().map(m => ({
        role: m.role,
        content: m.content
      }))
    }))

    return { history }
  },
})

// --- Order Tools ---
export const getOrderDetails = tool({
  description: 'Get details of a specific order by Order ID',
  parameters: z.object({
    orderId: z.string().describe('The unique ID of the order'),
  }),
  execute: async ({ orderId }) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })
    
    if (!order) return { error: `Order ${orderId} not found.` }

    return {
      id: order.id,
      status: order.status,
      amount: order.amount,
      date: order.createdAt.toLocaleDateString(),
      items: order.productName // Schema has productName, acting as description
    }
  },
})

export const getRecentOrders = tool({
  description: 'Get the most recent orders for a user',
  parameters: z.object({
    userId: z.string().describe('The unique ID of the user'),
    limit: z.number().optional().default(5),
  }),
  execute: async ({ userId, limit }) => {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (orders.length === 0) return { message: "No recent orders found." }

    return {
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        amount: o.amount,
        date: o.createdAt.toLocaleDateString()
      }))
    }
  },
})

// --- Billing Tools ---
export const getInvoiceDetails = tool({
  description: 'Get details of a specific invoice by Invoice ID or Order ID',
  parameters: z.object({
    id: z.string().describe('The unique ID of the invoice or the associated Order ID'),
  }),
  execute: async ({ id }) => {
    // Try finding by invoice ID first
    let invoice = await prisma.invoice.findUnique({
      where: { id: id },
    })

    // If not found, try finding by order ID
    if (!invoice) {
      invoice = await prisma.invoice.findFirst({
        where: { orderId: id },
      })
    }
    
    if (!invoice) return { error: `Invoice for ID ${id} not found.` }

    return {
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.paymentStatus,
      url: invoice.invoiceUrl
    }
  },
})

export const checkRefundStatus = tool({
  description: 'Check the status of a refund for a specific order',
  parameters: z.object({
    orderId: z.string().describe('The unique ID of the order'),
  }),
  execute: async ({ orderId }) => {
    const invoice = await prisma.invoice.findFirst({
      where: { orderId: orderId },
    })

    if (!invoice) return { error: 'Invoice not found for this order, cannot check refund status.' }
    
    return {
      refundStatus: invoice.refundStatus || 'None',
      amount: invoice.amount
    }
  },
})