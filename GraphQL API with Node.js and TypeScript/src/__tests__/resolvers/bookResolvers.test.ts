import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
  createTestBook,
  callResolver,
} from '../helpers/testHelper';
import {
  bookQueries,
  bookMutations,
} from '../../graphql/resolvers/bookResolvers';

describe('Book Resolvers', () => {
  const { sequelize, BookModel } = createTestDatabase();

  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await BookModel.destroy({ where: {}, truncate: true });
  });

  describe('Queries', () => {
    describe('books', () => {
      it('should return all books', async () => {
        await BookModel.bulkCreate([
          { title: 'Book 1', author: 'Author 1', year: 2021 },
          { title: 'Book 2', author: 'Author 2', year: 2022 },
        ]);

        const books = await callResolver(bookQueries.books);

        expect(books).toHaveLength(2);
        expect(books[0].title).toBeDefined();
      });

      it('should return empty array when no books', async () => {
        const books = await callResolver(bookQueries.books);
        expect(books).toHaveLength(0);
      });

      it('should return books in descending order by id', async () => {
        const book1 = await createTestBook(BookModel, { title: 'First' });
        const book2 = await createTestBook(BookModel, { title: 'Second' });
        const book3 = await createTestBook(BookModel, { title: 'Third' });

        const books = await callResolver(bookQueries.books);

        expect(books[0].id).toBe(book3.id);
        expect(books[1].id).toBe(book2.id);
        expect(books[2].id).toBe(book1.id);
      });

      it('should throw error when fetching books fails', async () => {
        jest
          .spyOn(BookModel, 'findAll')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(callResolver(bookQueries.books)).rejects.toThrow(
          'Failed to fetch books'
        );

        expect(console.error).toHaveBeenCalledWith(
          'Error fetching books:',
          expect.any(Error)
        );
      });
    });

    describe('book', () => {
      it('should return a book by id', async () => {
        const testBook = await createTestBook(BookModel, {
          title: 'Test Book',
        });

        const book = await callResolver(
          bookQueries.book,
          {},
          { id: testBook.id.toString() }
        );

        expect(book).not.toBeNull();
        expect(book?.title).toBe('Test Book');
      });

      it('should return null for non-existent id', async () => {
        const book = await callResolver(bookQueries.book, {}, { id: '999' });
        expect(book).toBeNull();
      });

      it('should throw error when fetching book fails', async () => {
        jest
          .spyOn(BookModel, 'findByPk')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(
          callResolver(bookQueries.book, {}, { id: '1' })
        ).rejects.toThrow('Failed to fetch book');

        expect(console.error).toHaveBeenCalledWith(
          'Error fetching book:',
          expect.any(Error)
        );
      });
    });

    describe('searchBooks', () => {
      it('should find books by title', async () => {
        await BookModel.bulkCreate([
          {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            year: 1925,
          },
          {
            title: 'Great Expectations',
            author: 'Charles Dickens',
            year: 1861,
          },
          { title: '1984', author: 'George Orwell', year: 1949 },
        ]);

        const books = await callResolver(
          bookQueries.searchBooks,
          {},
          { title: 'Great' }
        );

        expect(books).toHaveLength(2);
        expect(books.every((b: any) => b.title.includes('Great'))).toBe(true);
      });

      it('should return empty array when no matches', async () => {
        await createTestBook(BookModel);

        const books = await callResolver(
          bookQueries.searchBooks,
          {},
          { title: 'NonExistent' }
        );

        expect(books).toHaveLength(0);
      });

      it('should be case insensitive', async () => {
        await createTestBook(BookModel, { title: 'Test Book' });

        const books = await callResolver(
          bookQueries.searchBooks,
          {},
          { title: 'test' }
        );

        expect(books).toHaveLength(1);
      });

      it('should handle empty string search', async () => {
        await BookModel.bulkCreate([
          { title: 'Book 1', author: 'Author 1', year: 2021 },
          { title: 'Book 2', author: 'Author 2', year: 2022 },
        ]);

        const books = await callResolver(
          bookQueries.searchBooks,
          {},
          { title: '' }
        );

        expect(books).toHaveLength(2);
      });

      it('should handle special characters in search', async () => {
        await createTestBook(BookModel, { title: 'Test & Book: Special' });

        const books = await callResolver(
          bookQueries.searchBooks,
          {},
          { title: '&' }
        );

        expect(books).toHaveLength(1);
      });

      it('should throw error when search fails', async () => {
        jest
          .spyOn(BookModel, 'findAll')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(
          callResolver(bookQueries.searchBooks, {}, { title: 'Test' })
        ).rejects.toThrow('Failed to search books');

        expect(console.error).toHaveBeenCalledWith(
          'Error searching books:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Mutations', () => {
    describe('addBook', () => {
      it('should create a new book', async () => {
        const book = await callResolver(
          bookMutations.addBook,
          {},
          {
            title: 'New Book',
            author: 'New Author',
            year: 2024,
          }
        );

        expect(book.id).toBeDefined();
        expect(book.title).toBe('New Book');
        expect(book.author).toBe('New Author');
        expect(book.year).toBe(2024);
      });

      it('should fail with invalid year', async () => {
        await expect(
          callResolver(
            bookMutations.addBook,
            {},
            {
              title: 'Test',
              author: 'Test',
              year: 500,
            }
          )
        ).rejects.toThrow();
      });

      it('should accept year 1000 (minimum valid year)', async () => {
        const book = await callResolver(
          bookMutations.addBook,
          {},
          {
            title: 'Ancient Book',
            author: 'Ancient Author',
            year: 1000,
          }
        );

        expect(book.year).toBe(1000);
      });

      it('should accept current year', async () => {
        const currentYear = new Date().getFullYear();
        const book = await callResolver(
          bookMutations.addBook,
          {},
          {
            title: 'Current Book',
            author: 'Modern Author',
            year: currentYear,
          }
        );

        expect(book.year).toBe(currentYear);
      });

      it('should handle special characters in title', async () => {
        const specialTitle = "Test & Book: A 'Special' Edition (2024)";
        const book = await callResolver(
          bookMutations.addBook,
          {},
          {
            title: specialTitle,
            author: 'Test Author',
            year: 2024,
          }
        );

        expect(book.title).toBe(specialTitle);
      });

      it('should throw generic error when create fails', async () => {
        jest
          .spyOn(BookModel, 'create')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(
          callResolver(
            bookMutations.addBook,
            {},
            {
              title: 'Test',
              author: 'Test',
              year: 2024,
            }
          )
        ).rejects.toThrow('Failed to add book');

        expect(console.error).toHaveBeenCalledWith(
          'Error adding book:',
          expect.any(Error)
        );
      });
    });

    describe('updateBook', () => {
      it('should update book fields', async () => {
        const testBook = await createTestBook(BookModel);

        const updated = await callResolver(
          bookMutations.updateBook,
          {},
          {
            id: testBook.id.toString(),
            title: 'Updated Title',
          }
        );

        expect(updated?.title).toBe('Updated Title');
        expect(updated?.author).toBe(testBook.author);
      });

      it('should throw error for non-existent book', async () => {
        await expect(
          callResolver(
            bookMutations.updateBook,
            {},
            {
              id: '999',
              title: 'Updated',
            }
          )
        ).rejects.toThrow('Book not found');
      });

      it('should not update if no fields provided', async () => {
        const testBook = await createTestBook(BookModel);

        const updated = await callResolver(
          bookMutations.updateBook,
          {},
          {
            id: testBook.id.toString(),
          }
        );

        expect(updated?.title).toBe(testBook.title);
      });

      it('should update multiple fields at once', async () => {
        const testBook = await createTestBook(BookModel);

        const updated = await callResolver(
          bookMutations.updateBook,
          {},
          {
            id: testBook.id.toString(),
            title: 'New Title',
            author: 'New Author',
            year: 2025,
          }
        );

        expect(updated?.title).toBe('New Title');
        expect(updated?.author).toBe('New Author');
        expect(updated?.year).toBe(2025);
      });

      it('should handle validation error on update', async () => {
        const testBook = await createTestBook(BookModel);

        await expect(
          callResolver(
            bookMutations.updateBook,
            {},
            {
              id: testBook.id.toString(),
              year: 500,
            }
          )
        ).rejects.toThrow();
      });

      it('should throw generic error when update fails with non-Error object', async () => {
        const testBook = await createTestBook(BookModel);

        jest.spyOn(BookModel, 'findByPk').mockResolvedValueOnce({
          ...testBook,
          update: jest.fn().mockRejectedValueOnce('String error'),
        } as any);

        await expect(
          callResolver(
            bookMutations.updateBook,
            {},
            {
              id: testBook.id.toString(),
              title: 'Updated',
            }
          )
        ).rejects.toThrow('Failed to update book');

        expect(console.error).toHaveBeenCalledWith(
          'Error updating book:',
          'String error'
        );
      });
    });

    describe('deleteBook', () => {
      it('should delete a book', async () => {
        const testBook = await createTestBook(BookModel);

        const result = await callResolver(
          bookMutations.deleteBook,
          {},
          {
            id: testBook.id.toString(),
          }
        );

        expect(result).toBe(true);

        const found = await BookModel.findByPk(testBook.id);
        expect(found).toBeNull();
      });

      it('should return false for non-existent book', async () => {
        const result = await callResolver(
          bookMutations.deleteBook,
          {},
          {
            id: '999',
          }
        );

        expect(result).toBe(false);
      });

      it('should throw error when delete fails', async () => {
        jest
          .spyOn(BookModel, 'destroy')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(
          callResolver(
            bookMutations.deleteBook,
            {},
            {
              id: '1',
            }
          )
        ).rejects.toThrow('Failed to delete book');

        expect(console.error).toHaveBeenCalledWith(
          'Error deleting book:',
          expect.any(Error)
        );
      });
    });
  });
});
