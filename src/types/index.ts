import { PrismaClient } from "@prisma/client";

export interface Context {
    prisma: PrismaClient;
}

export interface CreateWarehouseInput {
    name: string;
    location: string;
    capacity: number;
}

export interface CreateProductInput {
    name: string;
    description?: string
}

export interface updateInventoryInput{
    warehouseId: string;
    productId: string;
    quantity: number;
    minStock: number;
    maxStock: number; 
}

