import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Warehouses
  const warehouseData: Prisma.WarehouseCreateManyInput[] = [
    { 
      name: 'Primary Warehouse', 
      location: 'Main Campus',
      capacity: 500 // Add capacity field
    },
    { 
      name: 'Secondary Warehouse', 
      location: 'Backup Facility',
      capacity: 300 // Add capacity field
    },
    { 
      name: 'Distribution Center', 
      location: 'Regional Hub',
      capacity: 400 // Add capacity field
    }
  ]

  const warehouses = await prisma.warehouse.createMany({
    data: warehouseData,
    skipDuplicates: true
  })

  // Create Products
  const productData: Prisma.ProductCreateManyInput[] = [
    { 
      name: 'Widget A', 
      description: 'Standard widget for general use' 
    },
    { 
      name: 'Widget B', 
      description: 'Advanced widget with special features' 
    },
    { 
      name: 'Component X', 
      description: 'Essential electronic component' 
    },
    { 
      name: 'Component Y', 
      description: 'Precision engineering component' 
    }
  ]

  const products = await prisma.product.createMany({
    data: productData,
    skipDuplicates: true
  })

  // Fetch warehouses and products to get their IDs
  const warehouseList = await prisma.warehouse.findMany()
  const productList = await prisma.product.findMany()

  // Create Inventory
  const inventoryEntries: Prisma.InventoryCreateManyInput[] = []
  warehouseList.forEach(warehouse => {
    productList.forEach(product => {
      inventoryEntries.push({
        warehouseId: warehouse.id,
        productId: product.id,
        quantity: Math.floor(Math.random() * 200), // Random quantity between 0-200
        minStock: 30,
        maxStock: 250
      })
    })
  })

  // Insert Inventory
  await prisma.inventory.createMany({
    data: inventoryEntries,
    skipDuplicates: true
  })

  console.log('Seed data inserted successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })