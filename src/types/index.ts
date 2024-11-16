import { PrismaClient, Role, Permission } from "@prisma/client";

// Context Type
export interface Context {
    prisma: PrismaClient
    user?: { id: string } 
}

// Auth Types
export interface AuthPayload {
    token: string
    user: {
      id: string
      email: string
      role: Role
    }
}

// Input Types
export interface CreateWarehouseInput {
    name: string
    location: string
    capacity: number
}

export interface CreateProductInput {
    name: string
    description?: string
}

export interface UpdateInventoryInput {
    warehouseId: string
    productId: string
    quantity: number
    minStock: number
    maxStock: number
}

export interface CreateUserInput {
    email: string
    password: string
    role?: Role
}

export interface UpdateUserInput {
    email?: string
    password?: string
    role?: Role
}

export interface AddUserToWarehouseInput {
    userId: string
    warehouseId: string
    permissions: Permission[]
}

export interface UpdateWarehouseUserPermissionsInput {
    userId: string
    warehouseId: string
    permissions: Permission[]
}

// Model Types (Optional: if you need specific type shapes different from Prisma)
export interface User {
    id: string
    email: string
    role: Role
    warehouses: WarehouseUser[]
    createdAt: Date
    updatedAt: Date
}

export interface WarehouseUser {
    id: string
    user: User
    warehouse: Warehouse
    permissions: Permission[]
    createdAt: Date
    updatedAt: Date
}

export interface Warehouse {
    id: string
    name: string
    location: string
    capacity: number
    inventory: Inventory[]
    createdAt: Date
    updatedAt: Date
}

export interface Product {
    id: string
    name: string
    description: string
    inventory: Inventory[]
    createdAt: Date
    updatedAt: Date
}

export interface Inventory {
    id: string
    warehouse: Warehouse
    product: Product
    quantity: number
    minStock: number
    maxStock: number
    createdAt: Date
    updatedAt: Date
}


export type QueryResolvers = {
    warehouses: (parent: any, args: {}, context: Context) => Promise<Warehouse[]>
    warehouse: (parent: any, args: { id: string }, context: Context) => Promise<Warehouse | null>
    products: (parent: any, args: {}, context: Context) => Promise<Product[]>
    product: (parent: any, args: { id: string }, context: Context) => Promise<Product | null>
    inventory: (parent: any, args: { warehouseId: string, productId: string }, context: Context) => Promise<Inventory | null>
    users: (parent: any, args: {}, context: Context) => Promise<User[]>
    user: (parent: any, args: { id: string }, context: Context) => Promise<User | null>
    me: (parent: any, args: {}, context: Context) => Promise<User | null>
    warehouseUsers: (parent: any, args: { warehouseId: string }, context: Context) => Promise<WarehouseUser[]>
}

export type MutationResolvers = {
    createWarehouse: (parent: any, args: { input: CreateWarehouseInput }, context: Context) => Promise<Warehouse>
    createProduct: (parent: any, args: { input: CreateProductInput }, context: Context) => Promise<Product>
    updateInventory: (parent: any, args: { input: UpdateInventoryInput }, context: Context) => Promise<Inventory>
    createUser: (parent: any, args: { input: CreateUserInput }, context: Context) => Promise<User>
    updateUser: (parent: any, args: { id: string, input: UpdateUserInput }, context: Context) => Promise<User>
    deleteUser: (parent: any, args: { id: string }, context: Context) => Promise<User>
    addUserToWarehouse: (parent: any, args: { input: AddUserToWarehouseInput }, context: Context) => Promise<WarehouseUser>
    updateWarehouseUserPermissions: (parent: any, args: { input: UpdateWarehouseUserPermissionsInput }, context: Context) => Promise<WarehouseUser>
    removeUserFromWarehouse: (parent: any, args: { userId: string, warehouseId: string }, context: Context) => Promise<WarehouseUser>
    login: (parent: any, args: { email: string, password: string }, context: Context) => Promise<AuthPayload>
}