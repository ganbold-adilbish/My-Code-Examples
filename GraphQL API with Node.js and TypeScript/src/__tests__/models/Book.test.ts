import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
} from '../helpers/testHelper';

describe('Book Model', () => {
  const { sequelize, BookModel } = createTestDatabase();

  beforeAll(async () => {
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
  });

  afterEach(async () => {
    await BookModel.destroy({ where: {}, truncate: true });
  });

  describe('Create Book', () => {
    it('should create a book with valid data', async () => {
      const book = await BookModel.create({
        title: '1984',
        author: 'George Orwell',
        year: 1949,
      });

      expect(book.id).toBeDefined();
      expect(book.title).toBe('1984');
      expect(book.author).toBe('George Orwell');
      expect(book.year).toBe(1949);
      expect(book.created_at).toBeDefined();
      expect(book.updated_at).toBeDefined();
    });

    it('should fail without required fields', async () => {
      // @ts-expect-error Testing validation for missing required fields
      await expect(BookModel.create({ title: 'Test' })).rejects.toThrow();
    });

    it('should fail with invalid year', async () => {
      await expect(
        BookModel.create({
          title: 'Test Book',
          author: 'Test Author',
          year: 500,
        })
      ).rejects.toThrow();
    });

    it('should fail with empty title', async () => {
      await expect(
        BookModel.create({
          title: '',
          author: 'Test Author',
          year: 2024,
        })
      ).rejects.toThrow();
    });
  });

  describe('Update Book', () => {
    it('should update book fields', async () => {
      const book = await BookModel.create({
        title: 'Original Title',
        author: 'Original Author',
        year: 2020,
      });

      await book.update({ title: 'Updated Title' });

      expect(book.title).toBe('Updated Title');
      expect(book.author).toBe('Original Author');
    });
  });

  describe('Delete Book', () => {
    it('should delete a book', async () => {
      const book = await BookModel.create({
        title: 'Test Book',
        author: 'Test Author',
        year: 2024,
      });

      await book.destroy();

      const found = await BookModel.findByPk(book.id);
      expect(found).toBeNull();
    });
  });

  describe('Find Books', () => {
    it('should find all books', async () => {
      await BookModel.bulkCreate([
        { title: 'Book 1', author: 'Author 1', year: 2021 },
        { title: 'Book 2', author: 'Author 2', year: 2022 },
      ]);

      const books = await BookModel.findAll();
      expect(books).toHaveLength(2);
    });

    it('should find book by id', async () => {
      const book = await BookModel.create({
        title: 'Test Book',
        author: 'Test Author',
        year: 2024,
      });

      const found = await BookModel.findByPk(book.id);
      expect(found?.title).toBe('Test Book');
    });
  });
});
