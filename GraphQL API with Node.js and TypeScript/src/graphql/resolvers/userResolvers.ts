import { UserModel } from '../../models/index';
import {
  QueryResolvers,
  MutationResolvers,
  UserResolvers,
} from '../../generated/graphql';

export const userQueries: QueryResolvers = {
  users: async () => {
    try {
      const users = await UserModel.findAll({
        order: [['id', 'DESC']],
      });
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  user: async (_parent, { id }) => {
    try {
      const user = await UserModel.findByPk(id);
      if (!user) return null;
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  },
};

export const userMutations: MutationResolvers = {
  addUser: async (_parent, { name, email }) => {
    try {
      const user = await UserModel.create({ name, email });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error('Email already exists');
        }
        if (error.name === 'SequelizeValidationError') {
          const validationError = error as any;
          throw new Error(
            validationError.errors.map((e: any) => e.message).join(', ')
          );
        }
      }
      console.error('Error adding user:', error);
      throw new Error('Failed to add user');
    }
  },

  updateUser: async (_parent, { id, name, email }) => {
    try {
      const user = await UserModel.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      const updates: Partial<{ name: string; email: string }> = {};
      if (name !== undefined && name !== null) updates.name = name;
      if (email !== undefined && email !== null) updates.email = email;

      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error('Email already exists');
        }
        if (error.name === 'SequelizeValidationError') {
          const validationError = error as any;
          throw new Error(
            validationError.errors.map((e: any) => e.message).join(', ')
          );
        }
      }
      console.error('Error updating user:', error);
      throw error instanceof Error ? error : new Error('Failed to update user');
    }
  },

  deleteUser: async (_parent, { id }) => {
    try {
      const result = await UserModel.destroy({
        where: { id },
      });
      return result > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  },
};

export const User: UserResolvers = {
  created_at: (parent) => parent.created_at?.toLocaleString() || null,
  updated_at: (parent) => parent.updated_at?.toLocaleString() || null,
};
