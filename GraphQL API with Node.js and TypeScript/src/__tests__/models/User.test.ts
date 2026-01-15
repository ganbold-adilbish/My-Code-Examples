import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
} from "../helpers/testHelper";

describe("User Model", () => {
  const { sequelize, UserModel } = createTestDatabase();

  beforeAll(async () => {
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
  });

  afterEach(async () => {
    await UserModel.destroy({ where: {}, truncate: true });
  });

  describe("Create User", () => {
    it("should create a user with valid data", async () => {
      const user = await UserModel.create({
        name: "John Doe",
        email: "john@example.com",
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("john@example.com");
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it("should fail with invalid email", async () => {
      await expect(
        UserModel.create({
          name: "John Doe",
          email: "invalid-email",
        })
      ).rejects.toThrow();
    });

    it("should fail with duplicate email", async () => {
      await UserModel.create({
        name: "User 1",
        email: "test@example.com",
      });

      await expect(
        UserModel.create({
          name: "User 2",
          email: "test@example.com",
        })
      ).rejects.toThrow();
    });

    it("should fail with short name", async () => {
      await expect(
        UserModel.create({
          name: "J",
          email: "test@example.com",
        })
      ).rejects.toThrow();
    });
  });

  describe("Update User", () => {
    it("should update user fields", async () => {
      const user = await UserModel.create({
        name: "Original Name",
        email: "original@example.com",
      });

      await user.update({ name: "Updated Name" });

      expect(user.name).toBe("Updated Name");
      expect(user.email).toBe("original@example.com");
    });

    it("should fail when updating to duplicate email", async () => {
      await UserModel.create({
        name: "User 1",
        email: "user1@example.com",
      });

      const user2 = await UserModel.create({
        name: "User 2",
        email: "user2@example.com",
      });

      await expect(
        user2.update({ email: "user1@example.com" })
      ).rejects.toThrow();
    });
  });

  describe("Delete User", () => {
    it("should delete a user", async () => {
      const user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
      });

      await user.destroy();

      const found = await UserModel.findByPk(user.id);
      expect(found).toBeNull();
    });
  });

  describe("Find Users", () => {
    it("should find all users", async () => {
      await UserModel.bulkCreate([
        { name: "User 1", email: "user1@example.com" },
        { name: "User 2", email: "user2@example.com" },
      ]);

      const users = await UserModel.findAll();
      expect(users).toHaveLength(2);
    });

    it("should find user by id", async () => {
      const user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
      });

      const found = await UserModel.findByPk(user.id);
      expect(found?.name).toBe("Test User");
    });
  });
});
