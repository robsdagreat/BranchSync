import { Context } from '../context';
import { Resolvers } from "../generated/graphql";
import { hashPassword, comparePasswords, generateToken } from "../utils/auth.js";
import { AuthenticationError, ForbiddenError } from 'apollo-server';
import { Prisma, Role } from '@prisma/client';

export const resolvers: Resolvers<Context> = {
    Query: {
        warehouses: async (_parent, _args, { prisma, user }) => {
            if (!user) {
              throw new AuthenticationError('Not authenticated');
            }
      
            if (user.role === 'ADMIN') {
              return prisma.warehouse.findMany();
            }
      
            
            return prisma.warehouse.findMany({
              where: {
                users: {
                  some: {
                    userId: user.id,
                    permissions: {
                      has: 'READ'
                    }
                    }
                }
            }
        });
        },

        warehouse: async (_parent, { id }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            return prisma.warehouse.findUnique({
                where: { id },
            });
        },

        products: async (_parent, _args, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            return prisma.product.findMany();
        },

        inventory: async (_, { warehouseId, productId }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            
            return prisma.inventory.findFirst({
                where: {
                    warehouseId,
                    productId,
                },
                include: {
                    warehouse: true,
                    product: true,
                }
            });
        },

        inventoryById: async(_parents, {id}, {prisma, user})=>{
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            } 

            return prisma.inventory.findFirst({
                where:{
                     id
                },
                include:{
                    warehouse: true,
                    product: true, 
                }
            })
        },

        users: async (_parent, _args, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can list all users');
            }
            return prisma.user.findMany();
        },

        user: async (_parent, { id }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN' && user.id !== id) {
                throw new ForbiddenError('Access denied');
            }
            return prisma.user.findUnique({ where: { id } });
        },

        me: async (_parent, _args, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            return prisma.user.findUnique({ where: { id: user.id } });
        },

        warehouseUsers: async (_parent, { warehouseId }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }

            const hasAccess = await prisma.warehouseUser.findFirst({
                where: {
                    warehouseId,
                    userId: user.id,
                    permissions: { has: 'READ' }
                }
            });

            if (!hasAccess && user.role !== 'ADMIN') {
                throw new ForbiddenError('Access denied');
            }

            return prisma.warehouseUser.findMany({
                where: { warehouseId },
                include: { user: true }
            });
        }
    },

    Mutation: {
        createWarehouse: async (_parent, { input }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can create warehouses');
            }
            return prisma.warehouse.create({
                data: input,
            });
        },

        createProduct: async (_parent, { input }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can create products');
            }
            return prisma.product.create({
                data: input,
            });
        },

        updateInventory: async (_parent, { input }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }

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

        createUser: async (_parent, { input }, { prisma, user }) => {
            const userCount = await prisma.user.count();

            if (userCount > 0) {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can create users');
            }
            }

            const existingUser = await prisma.user.findUnique({
                where: { email: input.email }
            });
        
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await hashPassword(input.password);
        
            const userData: Prisma.UserCreateInput = {
                email: input.email,
                password: hashedPassword,
                role: input.role as Role || 'USER'  // Ensure role is properly typed
            };

            return prisma.user.create({
                data: userData
            });
        },

        addUserToWarehouse: async (_parent, { input }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can add users to warehouses');
            }

            return prisma.warehouseUser.create({
                data: input,
                include: {
                    user: true,
                    warehouse: true
                }
            });
        },

        updateWarehouseUserPermissions: async (_parent, { input }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can update permissions');
            }

            return prisma.warehouseUser.update({
                where: {
                    userId_warehouseId: {
                        userId: input.userId,
                        warehouseId: input.warehouseId
                    }
                },
                data: {
                    permissions: input.permissions
                },
                include: {
                    user: true,
                    warehouse: true
                }
            });
        },

        removeUserFromWarehouse: async (_parent, { userId, warehouseId }, { prisma, user }) => {
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }
            if (user.role !== 'ADMIN') {
                throw new ForbiddenError('Only admins can remove users from warehouses');
            }

            return prisma.warehouseUser.delete({
                where: {
                    userId_warehouseId: {
                        userId,
                        warehouseId
                    }
                }
            });
        },

        login: async (_parent, { email, password }, { prisma }) => {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new AuthenticationError('Invalid credentials');
            }

            const validPassword = await comparePasswords(password, user.password);
            if (!validPassword) {
                throw new AuthenticationError('Invalid credentials');
            }

            const token = generateToken(user);
            return { token, user };
        }
    },

    User: {
        warehouses: ({ id }, _args, { prisma }) => {
            return prisma.warehouseUser.findMany({
                where: { userId: id },
                include: { warehouse: true }
            });
        }
    }
};