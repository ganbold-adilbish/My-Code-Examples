import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
} from '../helpers/testHelper';

describe('Author Model', () => {
  const { sequelize, AuthorModel, UserModel } = createTestDatabase();

  beforeAll(async () => {
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
  });

  afterEach(async () => {
    await AuthorModel.destroy({ where: {}, truncate: true });
    await UserModel.destroy({ where: {}, truncate: true });
  });

  describe('Create Author', () => {
    it('should create an author with valid data', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Author Bio',
        website: 'https://test-author.com',
      });

      expect(author.id).toBeDefined();
      expect(author.user_id).toBeDefined();
      expect(author.bio).toBe('Test Author Bio');
      expect(author.website).toBe('https://test-author.com');
    });

    it('should fail without required fields', async () => {
      // @ts-expect-error Testing validation for missing required fields
      await expect(AuthorModel.create({ user_id: 1 })).rejects.toThrow();
    });

    it('should fail with invalid website URL', async () => {
      await expect(
        AuthorModel.create({
          user_id: 1,
          bio: 'Test Bio',
          website: 'invalid-url',
        })
      ).rejects.toThrow();
    });

    it('should fail with duplicate user_id', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      await AuthorModel.create({
        user_id: user.id,
        bio: 'First Author',
      });

      await expect(
        AuthorModel.create({
          user_id: user.id,
          bio: 'Second Author',
        })
      ).rejects.toThrow();
    });
  });

  describe('Update Author', () => {
    it('should update author fields', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Original Bio',
      });

      await author.update({ bio: 'Updated Bio' });

      expect(author.bio).toBe('Updated Bio');
    });
  });

  describe('Delete Author', () => {
    it('should delete an author', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });
      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Bio',
      });

      await author.destroy();

      const found = await AuthorModel.findByPk(author.id);
      expect(found).toBeNull();
    });
  });

  describe('Find Authors', () => {
    it('should find all authors', async () => {
      const user1 = await UserModel.create({
        name: 'Test Author 1',
        email: 'test.author.1@example.com',
      });
      const user2 = await UserModel.create({
        name: 'Test Author 2',
        email: 'test.author.2@example.com',
      });

      await AuthorModel.create({
        user_id: user1.id,
        bio: 'Bio 1',
      });
      await AuthorModel.create({
        user_id: user2.id,
        bio: 'Bio 2',
      });

      const authors = await AuthorModel.findAll();
      expect(authors).toHaveLength(2);
    });

    it('should find author by id', async () => {
      const user = await UserModel.create({
        name: 'Test Author',
        email: 'test.author@example.com',
      });

      const author = await AuthorModel.create({
        user_id: user.id,
        bio: 'Test Bio',
      });

      const found = await AuthorModel.findByPk(author.id);
      expect(found?.bio).toBe('Test Bio');
    });
  });
});
