import { Op, ValidationError, ValidationErrorItem } from 'sequelize';
import { BookModel, AuthorModel } from '../../models';
import {
  QueryResolvers,
  MutationResolvers,
  BookResolvers,
} from '../../generated/graphql';

export const bookQueries: QueryResolvers = {
  books: async () => {
    try {
      const books = await BookModel.findAll({
        include: [{ model: AuthorModel, as: 'author' }],
        order: [['id', 'DESC']],
      });
      return books;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new Error('Failed to fetch books');
    }
  },

  book: async (_parent, { id }) => {
    try {
      const book = await BookModel.findByPk(id, {
        include: [{ model: AuthorModel, as: 'author' }],
      });
      if (!book) return null;
      return book;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw new Error('Failed to fetch book');
    }
  },

  searchBooks: async (_parent, { title }) => {
    try {
      const books = await BookModel.findAll({
        where: {
          title: {
            [Op.like]: `%${title}%`,
          },
        },
        include: [{ model: AuthorModel, as: 'author' }],
      });
      return books;
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books');
    }
  },
};

export const bookMutations: MutationResolvers = {
  addBook: async (_parent, { title, authorId, year }) => {
    try {
      const author = await AuthorModel.findByPk(authorId);
      if (!author) {
        throw new Error('Author not found');
      }

      const book = await BookModel.create({
        title,
        author_id: Number(authorId),
        year,
      });

      await book.reload({
        include: [{ model: AuthorModel, as: 'author' }],
      });

      return book;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(
          error.errors.map((e: ValidationErrorItem) => e.message).join(', ')
        );
      }
      console.error('Error adding book:', error);
      throw error instanceof Error ? error : new Error('Failed to add book');
    }
  },

  updateBook: async (_parent, { id, title, authorId, year }) => {
    try {
      const book = await BookModel.findByPk(id);
      if (!book) {
        throw new Error('Book not found');
      }

      if (authorId) {
        const author = await AuthorModel.findByPk(authorId);
        if (!author) {
          throw new Error('Author not found');
        }
      }

      const updates: Partial<{
        title: string;
        author_id: number;
        year: number;
      }> = {};
      if (title !== undefined && title !== null) updates.title = title;
      if (authorId !== undefined && authorId !== null)
        updates.author_id = Number(authorId);
      if (year !== undefined && year !== null) updates.year = year;

      if (Object.keys(updates).length > 0) {
        await book.update(updates);
      }

      await book.reload({
        include: [{ model: AuthorModel, as: 'author' }],
      });

      return book;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(
          error.errors.map((e: ValidationErrorItem) => e.message).join(', ')
        );
      }
      console.error('Error updating book:', error);
      throw error instanceof Error ? error : new Error('Failed to update book');
    }
  },

  deleteBook: async (_parent, { id }) => {
    try {
      const result = await BookModel.destroy({
        where: { id },
      });
      return result > 0;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw new Error('Failed to delete book');
    }
  },
};

export const Book: BookResolvers = {
  created_at: (parent) => parent.created_at?.toLocaleString() || null,
  updated_at: (parent) => parent.updated_at?.toLocaleString() || null,
};
