import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Clean up existing data
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create a User
  const user = await prisma.user.create({
    data: {
      id: 'a7b50481-1089-49a0-97b0-5939536d53d1', // Fixed ID for easier testing
      email: 'alice@example.com',
      name: 'Alice Johnson',
    },
  })
  console.log(`Created user: ${user.name} (${user.id})`)

  // 3. Create Orders & Invoices

  // A. Happy Path Order (Delivered, No Refund)
  const orderHappy = await prisma.order.create({
    data: {
      id: 'ORD-123',
      userId: user.id,
      productName: 'Wireless Headphones',
      status: 'Delivered',
      deliveryDate: new Date(new Date().setDate(new Date().getDate() - 2)), // Delivered 2 days ago
      amount: 120.50,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
  })

  await prisma.invoice.create({
    data: {
      orderId: orderHappy.id,
      userId: user.id,
      amount: 120.50,
      paymentStatus: 'Paid',
      refundStatus: 'None',
      invoiceUrl: 'https://example.com/invoice/ORD-123.pdf',
    },
  })
  console.log('Created Happy Path Order (ORD-123)')

  // B. Problem Path Order (Processing/Delayed)
  const orderProblem = await prisma.order.create({
    data: {
      id: 'ORD-456',
      userId: user.id,
      productName: 'Gaming Monitor',
      status: 'Processing',
      deliveryDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Expected in 5 days
      amount: 450.00,
      createdAt: new Date(),
    },
  })
  
  await prisma.invoice.create({
    data: {
      orderId: orderProblem.id,
      userId: user.id,
      amount: 450.00,
      paymentStatus: 'Paid',
      refundStatus: 'None',
      invoiceUrl: 'https://example.com/invoice/ORD-456.pdf',
    },
  })
  console.log('Created Problem Path Order (ORD-456)')

  // C. Billing Issue Order (Cancelled, Refund Processed)
  const orderBilling = await prisma.order.create({
    data: {
      id: 'ORD-789',
      userId: user.id,
      productName: 'Smart Watch',
      status: 'Cancelled',
      deliveryDate: null,
      amount: 200.00,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    },
  })

  await prisma.invoice.create({
    data: {
      orderId: orderBilling.id,
      userId: user.id,
      amount: 200.00,
      paymentStatus: 'Paid', // Was paid, then refunded
      refundStatus: 'Processed',
      invoiceUrl: 'https://example.com/invoice/ORD-789.pdf',
    },
  })
  console.log('Created Billing Issue Order (ORD-789)')

  // 4. Create Conversation History
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Order Inquiry',
    },
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: 'user',
        content: 'Hi, where are you located?',
      },
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: 'We are an online-only store with headquarters in San Francisco.',
      },
    ],
  })
  console.log('Created conversation history')

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })