import { ValidationError, ValidationErrorItem } from 'sequelize';
import { AuthorModel, BookModel, UserModel } from '../../models';
import {
  QueryResolvers,
  MutationResolvers,
  AuthorResolvers,
} from '../../generated/graphql';

export const authorQueries: QueryResolvers = {
  authors: async () => {
    try {
      const authors = await AuthorModel.findAll({
        include: [
          { model: BookModel, as: 'books' },
          { model: UserModel, as: 'user' },
        ],
        order: [['id', 'DESC']],
      });
      return authors;
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw new Error('Failed to fetch authors');
    }
  },

  author: async (_parent, { id }) => {
    try {
      const author = await AuthorModel.findByPk(id, {
        include: [
          { model: BookModel, as: 'books' },
          { model: UserModel, as: 'user' },
        ],
      });
      if (!author) return null;
      return author;
    } catch (error) {
      console.error('Error fetching author:', error);
      throw new Error('Failed to fetch author');
    }
  },
};

export const authorMutations: MutationResolvers = {
  createAuthorProfile: async (_parent, { userId, bio, website }) => {
    try {
      const user = await UserModel.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const existingProfile = await AuthorModel.findOne({
        where: { user_id: userId },
      });
      if (existingProfile) {
        throw new Error('Author profile already exists for this user');
      }

      const author = await AuthorModel.create({
        user_id: Number(userId),
        bio,
        website: website ?? undefined,
      });

      await author.reload({
        include: [{ model: UserModel, as: 'user' }],
      });

      return author;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(
          error.errors.map((e: ValidationErrorItem) => e.message).join(', ')
        );
      }
      console.error('Error creating author profile:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to create author profile');
    }
  },

  updateAuthorProfile: async (_parent, { id, bio, website }) => {
    try {
      const author = await AuthorModel.findByPk(id);
      if (!author) {
        throw new Error('Author profile not found');
      }

      const updates: Partial<{ bio: string; website: string }> = {};
      if (bio !== undefined && bio !== null) updates.bio = bio;
      if (website !== undefined && website !== null) updates.website = website;

      if (Object.keys(updates).length > 0) {
        await author.update(updates);
      }

      await author.reload({
        include: [{ model: UserModel, as: 'user' }],
      });

      return author;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(
          error.errors.map((e: ValidationErrorItem) => e.message).join(', ')
        );
      }
      console.error('Error updating author profile:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to update author profile');
    }
  },
};

export const Author: AuthorResolvers = {
  created_at: (parent) => parent.created_at?.toLocaleString() || null,
  updated_at: (parent) => parent.updated_at?.toLocaleString() || null,
};
