import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
} from '../helpers/testHelper';

describe('Book Model', () => {
  const { sequelize, BookModel, AuthorModel, UserModel } = createTestDatabase();

  beforeAll(async () => {
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
  });

  afterEach(async () => {
    await BookModel.destroy({ where: {}, truncate: true });
    await AuthorModel.destroy({ where: {}, truncate: true });
    await UserModel.destroy({ where: {}, truncate: true });
  });

  describe('Create Book', () => {
    it('should create a book with valid data', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });

      const book = await BookModel.create({
        author_id: author.id,
        title: '1984',
        year: 1949,
      });

      expect(book.id).toBeDefined();
      expect(book.author_id).toBe(author.id);
      expect(book.title).toBe('1984');
      expect(book.year).toBe(1949);
      expect(book.created_at).toBeDefined();
      expect(book.updated_at).toBeDefined();
    });

    it('should fail without required fields', async () => {
      // @ts-expect-error Testing validation for missing required fields
      await expect(BookModel.create({ title: 'Test' })).rejects.toThrow();
    });

    it('should fail with invalid year', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });
      await expect(
        BookModel.create({
          author_id: author.id,
          title: 'Test Book',
          year: 500,
        })
      ).rejects.toThrow();
    });

    it('should fail with empty title', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });
      await expect(
        BookModel.create({
          author_id: author.id,
          title: '',
          year: 2024,
        })
      ).rejects.toThrow();
    });
  });

  describe('Update Book', () => {
    it('should update book fields', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });
      const book = await BookModel.create({
        author_id: author.id,
        title: 'Original Title',
        year: 2020,
      });

      await book.update({ title: 'Updated Title', year: 2026 });

      expect(book.author_id).toBe(author.id);
      expect(book.title).toBe('Updated Title');
      expect(book.year).toBe(2026);
    });
  });

  describe('Delete Book', () => {
    it('should delete a book', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });
      const book = await BookModel.create({
        author_id: author.id,
        title: 'Test Book',
        year: 2024,
      });

      await book.destroy();

      const found = await BookModel.findByPk(book.id);
      expect(found).toBeNull();
    });
  });

  describe('Find Books', () => {
    it('should find all books', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });
      await BookModel.bulkCreate([
        { title: 'Book 1', author_id: author.id, year: 2021 },
        { title: 'Book 2', author_id: author.id, year: 2022 },
        { title: 'Book 3', author_id: author.id, year: 2023 },
      ]);

      const books = await BookModel.findAll();
      expect(books).toHaveLength(3);
    });

    it('should find book by id', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });
      const book = await BookModel.create({
        author_id: author.id,
        title: 'Test Book',
        year: 2024,
      });

      const found = await BookModel.findByPk(book.id);
      expect(found?.title).toBe('Test Book');
    });
  });
});
