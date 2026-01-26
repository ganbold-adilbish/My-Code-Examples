import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
  createTestUser,
  createTestAuthor,
  callResolver,
} from '../helpers/testHelper';
import {
  authorQueries,
  authorMutations,
} from '../../graphql/resolvers/author.resolvers';

describe('Author Resolvers', () => {
  const { sequelize, AuthorModel, UserModel } = createTestDatabase();

  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await AuthorModel.destroy({ where: {}, truncate: true });
    await UserModel.destroy({ where: {}, truncate: true });
  });

  describe('Queries', () => {
    describe('authors', () => {
      it('should return all authors', async () => {
        await createTestAuthor(AuthorModel, UserModel, {
          user_name: 'Author 1',
          user_email: 'author1@example.com',
          bio: 'Author 1 Bio',
        });
        await createTestAuthor(AuthorModel, UserModel, {
          user_name: 'Author 2',
          user_email: 'author2@example.com',
          bio: 'Author 2 Bio',
        });

        const authors = await callResolver(authorQueries.authors);
        expect(authors).toHaveLength(2);
      });

      it('should return empty array when no authors', async () => {
        const authors = await callResolver(authorQueries.authors);
        expect(authors).toHaveLength(0);
      });

      it('should throw error when fetching authors fails', async () => {
        jest
          .spyOn(AuthorModel, 'findAll')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(callResolver(authorQueries.authors)).rejects.toThrow(
          'Failed to fetch authors'
        );

        expect(console.error).toHaveBeenCalledWith(
          'Error fetching authors:',
          expect.any(Error)
        );
      });
    });

    describe('author', () => {
      it('should return an author by id', async () => {
        const testAuthor = await createTestAuthor(AuthorModel, UserModel, {
          user_name: 'Test Author',
          user_email: 'testauthor@example.com',
          bio: 'Test Bio',
        });

        const author = await callResolver(
          authorQueries.author,
          {},
          { id: testAuthor.id.toString() }
        );

        expect(author).not.toBeNull();
        expect(author?.bio).toBe('Test Bio');
      });

      it('should return null for non-existent id', async () => {
        const author = await callResolver(
          authorQueries.author,
          {},
          { id: '999' }
        );
        expect(author).toBeNull();
      });

      it('should throw error when fetching author fails', async () => {
        jest
          .spyOn(AuthorModel, 'findByPk')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(
          callResolver(authorQueries.author, {}, { id: '1' })
        ).rejects.toThrow('Failed to fetch author');

        expect(console.error).toHaveBeenCalledWith(
          'Error fetching author:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Mutations', () => {
    describe('createAuthorProfile', () => {
      it('should create a new author profile', async () => {
        const user = await createTestUser(UserModel);
        const author = await callResolver(
          authorMutations.createAuthorProfile,
          {},
          {
            userId: user.id.toString(),
            bio: 'New Author Bio',
            website: 'https://newauthor.com',
          }
        );

        expect(author.id).toBeDefined();
        expect(author.user_id).toBe(user.id);
        expect(author.bio).toBe('New Author Bio');
        expect(author.website).toBe('https://newauthor.com');
      });

      it('should fail with empty bio', async () => {
        const user = await createTestUser(UserModel);
        await expect(
          callResolver(
            authorMutations.createAuthorProfile,
            {},
            {
              userId: user.id.toString(),
              bio: '',
            }
          )
        ).rejects.toThrow();
      });

      it('should fail if user does not exist', async () => {
        await expect(
          callResolver(
            authorMutations.createAuthorProfile,
            {},
            {
              userId: '999',
              bio: 'Bio',
            }
          )
        ).rejects.toThrow('User not found');
      });

      it('should fail if author profile already exists', async () => {
        const user = await createTestUser(UserModel);
        await createTestAuthor(AuthorModel, UserModel, {
          user_id: user.id,
          bio: 'Existing Bio',
        });

        await expect(
          callResolver(
            authorMutations.createAuthorProfile,
            {},
            {
              userId: user.id.toString(),
              bio: 'New Bio',
            }
          )
        ).rejects.toThrow('Author profile already exists for this user');
      });

      it('should throw generic error when create fails', async () => {
        const user = await createTestUser(UserModel);
        jest
          .spyOn(AuthorModel, 'create')
          .mockRejectedValueOnce(new Error('DB error'));

        await expect(
          callResolver(
            authorMutations.createAuthorProfile,
            {},
            {
              userId: user.id.toString(),
              bio: 'Bio',
            }
          )
        ).rejects.toThrow('Failed to create author profile');

        expect(console.error).toHaveBeenCalledWith(
          'Error creating author profile:',
          expect.any(Error)
        );
      });
    });

    describe('updateAuthorProfile', () => {
      it('should update author profile', async () => {
        const testAuthor = await createTestAuthor(AuthorModel, UserModel, {
          bio: 'Original Bio',
        });

        const updated = await callResolver(
          authorMutations.updateAuthorProfile,
          {},
          {
            id: testAuthor.id.toString(),
            bio: 'Updated Bio',
            website: 'https://updatedauthor.com',
          }
        );

        expect(updated?.bio).toBe('Updated Bio');
      });

      it('should fail with empty bio', async () => {
        const testAuthor = await createTestAuthor(AuthorModel, UserModel, {
          bio: 'Original Bio',
        });

        await expect(
          callResolver(
            authorMutations.updateAuthorProfile,
            {},
            {
              id: testAuthor.id.toString(),
              bio: '',
            }
          )
        ).rejects.toThrow();
      });

      it('should throw error for non-existent author', async () => {
        await expect(
          callResolver(
            authorMutations.updateAuthorProfile,
            {},
            {
              id: '999',
              bio: 'Updated',
            }
          )
        ).rejects.toThrow('Author profile not found');
      });

      it('should throw generic error when update fails with non-Error object', async () => {
        const testAuthor = await createTestAuthor(AuthorModel, UserModel);

        jest.spyOn(AuthorModel, 'findByPk').mockResolvedValueOnce({
          ...testAuthor,
          update: jest.fn().mockRejectedValueOnce('String error'),
        } as Partial<InstanceType<typeof AuthorModel>> as InstanceType<
          typeof AuthorModel
        >);

        await expect(
          callResolver(
            authorMutations.updateAuthorProfile,
            {},
            {
              id: testAuthor.id.toString(),
              bio: 'Updated Bio',
            }
          )
        ).rejects.toThrow('Failed to update author profile');

        expect(console.error).toHaveBeenCalledWith(
          'Error updating author profile:',
          'String error'
        );
      });
    });
  });
});
