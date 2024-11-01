import { Context } from "vm";
import { Resolvers } from "../generated/graphql";
import { Prisma } from "@prisma/client";

export const resolvers: Resolvers<Context> = {
    Query: {
        warehouses: async (_parent,_args, {prisma}) =>{
            return prisma.warehouse.findMany();
        },
        warehouse: async (_parent, {id}, {prisma})=>{
            return prisma.warehouse.findUnique({
                where: {id},
            });
        } ,
        products: async(_parent, _args, {prisma}) => {
            return prisma.product.findMany();
        },
        inventory: async (_, { warehouseId, productId }, context) => {
            // Add some logging to debug
            console.log('Searching for inventory with:', { warehouseId, productId });
            
            const inventory = await context.prisma.inventory.findUnique({
              where: {
                // Make sure this matches your Prisma schema's unique constraint
                warehouseId_productId: {
                  warehouseId,
                  productId,
                }
              },
              include: {
                warehouse: true,
                product: true,
              }
            });
      
            console.log('Found inventory:', inventory);
            return inventory;
          }
        }
    ,

    Mutation: {
        createWarehouse: async(_parent, {input}, {prisma}) =>{
            return prisma.warehouse.create({
                data: input,
            });
        },

        createProduct: async(_parent, {input}, {Prisma}) =>{
            return Prisma.product.create({
                data: input,
            });
        },

        updateInventory: async(_parents, {input}, {prisma}) =>{
            const { warehouseId, productId, ...data } = input;
            return prisma.inventory.upsert({
                where: {
                    warehouseId_productId: {
                        warehouseId,
                        productId,
                    },
                },
                update: data,
                create: input,
            });
        
    },
    },
};