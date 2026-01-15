import {
  createTestDatabase,
  syncTestDatabase,
  closeTestDatabase,
  createTestUser,
  callResolver,
} from "../helpers/testHelper";
import {
  userQueries,
  userMutations,
} from "../../graphql/resolvers/userResolvers";

describe("User Resolvers", () => {
  const { sequelize, UserModel } = createTestDatabase();

  beforeAll(async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    await syncTestDatabase(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase(sequelize);
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await UserModel.destroy({ where: {}, truncate: true });
  });

  describe("Queries", () => {
    describe("users", () => {
      it("should return all users", async () => {
        await UserModel.bulkCreate([
          { name: "User 1", email: "user1@example.com" },
          { name: "User 2", email: "user2@example.com" },
        ]);

        const users = await callResolver(userQueries.users);

        expect(users).toHaveLength(2);
        expect(users[0].name).toBeDefined();
      });

      it("should return empty array when no users", async () => {
        const users = await callResolver(userQueries.users);
        expect(users).toHaveLength(0);
      });

      it("should return users in descending order by id", async () => {
        const user1 = await createTestUser(UserModel, {
          name: "First",
          email: "first@example.com",
        });
        const user2 = await createTestUser(UserModel, {
          name: "Second",
          email: "second@example.com",
        });
        const user3 = await createTestUser(UserModel, {
          name: "Third",
          email: "third@example.com",
        });

        const users = await callResolver(userQueries.users);

        expect(users[0].id).toBe(user3.id);
        expect(users[1].id).toBe(user2.id);
        expect(users[2].id).toBe(user1.id);
      });

      it("should throw error when fetching users fails", async () => {
        jest
          .spyOn(UserModel, "findAll")
          .mockRejectedValueOnce(new Error("DB error"));

        await expect(callResolver(userQueries.users)).rejects.toThrow(
          "Failed to fetch users"
        );

        expect(console.error).toHaveBeenCalledWith(
          "Error fetching users:",
          expect.any(Error)
        );
      });
    });

    describe("user", () => {
      it("should return a user by id", async () => {
        const testUser = await createTestUser(UserModel, { name: "Test User" });

        const user = await callResolver(
          userQueries.user,
          {},
          { id: testUser.id.toString() }
        );

        expect(user).not.toBeNull();
        expect(user?.name).toBe("Test User");
      });

      it("should return null for non-existent id", async () => {
        const user = await callResolver(userQueries.user, {}, { id: "999" });
        expect(user).toBeNull();
      });

      it("should throw error when fetching user fails", async () => {
        jest
          .spyOn(UserModel, "findByPk")
          .mockRejectedValueOnce(new Error("DB error"));

        await expect(
          callResolver(userQueries.user, {}, { id: "1" })
        ).rejects.toThrow("Failed to fetch user");

        expect(console.error).toHaveBeenCalledWith(
          "Error fetching user:",
          expect.any(Error)
        );
      });
    });
  });

  describe("Mutations", () => {
    describe("addUser", () => {
      it("should create a new user", async () => {
        const user = await callResolver(
          userMutations.addUser,
          {},
          {
            name: "New User",
            email: "new@example.com",
          }
        );

        expect(user.id).toBeDefined();
        expect(user.name).toBe("New User");
        expect(user.email).toBe("new@example.com");
      });

      it("should fail with invalid email", async () => {
        await expect(
          callResolver(
            userMutations.addUser,
            {},
            {
              name: "Test User",
              email: "invalid-email",
            }
          )
        ).rejects.toThrow();
      });

      it("should fail with duplicate email", async () => {
        await createTestUser(UserModel, { email: "test@example.com" });

        await expect(
          callResolver(
            userMutations.addUser,
            {},
            {
              name: "Another User",
              email: "test@example.com",
            }
          )
        ).rejects.toThrow("Email already exists");
      });

      it("should fail with empty name", async () => {
        await expect(
          callResolver(
            userMutations.addUser,
            {},
            {
              name: "",
              email: "test@example.com",
            }
          )
        ).rejects.toThrow();
      });

      it("should handle email case insensitivity for duplicates", async () => {
        await createTestUser(UserModel, { email: "test@example.com" });

        await expect(
          callResolver(
            userMutations.addUser,
            {},
            {
              name: "Another User",
              email: "TEST@EXAMPLE.COM",
            }
          )
        ).rejects.toThrow("Email already exists");
      });

      it("should handle special characters in name", async () => {
        const specialName = "O'Brien-Smith";
        const user = await callResolver(
          userMutations.addUser,
          {},
          {
            name: specialName,
            email: "obrien@example.com",
          }
        );

        expect(user.name).toBe(specialName);
      });

      it("should throw generic error when create fails", async () => {
        jest
          .spyOn(UserModel, "create")
          .mockRejectedValueOnce(new Error("DB error"));

        await expect(
          callResolver(
            userMutations.addUser,
            {},
            {
              name: "Test User",
              email: "test@example.com",
            }
          )
        ).rejects.toThrow("Failed to add user");

        expect(console.error).toHaveBeenCalledWith(
          "Error adding user:",
          expect.any(Error)
        );
      });
    });

    describe("updateUser", () => {
      it("should update user fields", async () => {
        const testUser = await createTestUser(UserModel);

        const updated = await callResolver(
          userMutations.updateUser,
          {},
          {
            id: testUser.id.toString(),
            name: "Updated Name",
          }
        );

        expect(updated?.name).toBe("Updated Name");
        expect(updated?.email).toBe(testUser.email);
      });

      it("should throw error for non-existent user", async () => {
        await expect(
          callResolver(
            userMutations.updateUser,
            {},
            {
              id: "999",
              name: "Updated",
            }
          )
        ).rejects.toThrow("User not found");
      });

      it("should fail when updating to duplicate email", async () => {
        await createTestUser(UserModel, { email: "existing@example.com" });
        const user2 = await createTestUser(UserModel, {
          email: "user2@example.com",
        });

        await expect(
          callResolver(
            userMutations.updateUser,
            {},
            {
              id: user2.id.toString(),
              email: "existing@example.com",
            }
          )
        ).rejects.toThrow("Email already exists");
      });

      it("should not update if no fields provided", async () => {
        const testUser = await createTestUser(UserModel);

        const updated = await callResolver(
          userMutations.updateUser,
          {},
          {
            id: testUser.id.toString(),
          }
        );

        expect(updated?.name).toBe(testUser.name);
      });

      it("should update multiple fields at once", async () => {
        const testUser = await createTestUser(UserModel);

        const updated = await callResolver(
          userMutations.updateUser,
          {},
          {
            id: testUser.id.toString(),
            name: "New Name",
            email: "newemail@example.com",
          }
        );

        expect(updated?.name).toBe("New Name");
        expect(updated?.email).toBe("newemail@example.com");
      });

      it("should fail with invalid email on update", async () => {
        const testUser = await createTestUser(UserModel);

        await expect(
          callResolver(
            userMutations.updateUser,
            {},
            {
              id: testUser.id.toString(),
              email: "invalid-email",
            }
          )
        ).rejects.toThrow();
      });

      it("should handle email case insensitivity when checking duplicates", async () => {
        await createTestUser(UserModel, { email: "existing@example.com" });
        const user2 = await createTestUser(UserModel, {
          email: "user2@example.com",
        });

        await expect(
          callResolver(
            userMutations.updateUser,
            {},
            {
              id: user2.id.toString(),
              email: "EXISTING@EXAMPLE.COM",
            }
          )
        ).rejects.toThrow("Email already exists");
      });

      it("should throw generic error when update fails with non-Error object", async () => {
        const testUser = await createTestUser(UserModel);

        jest.spyOn(UserModel, "findByPk").mockResolvedValueOnce({
          ...testUser,
          update: jest.fn().mockRejectedValueOnce("String error"),
        } as any);

        await expect(
          callResolver(
            userMutations.updateUser,
            {},
            {
              id: testUser.id.toString(),
              name: "Updated Name",
            }
          )
        ).rejects.toThrow("Failed to update user");

        expect(console.error).toHaveBeenCalledWith(
          "Error updating user:",
          "String error"
        );
      });
    });

    describe("deleteUser", () => {
      it("should delete a user", async () => {
        const testUser = await createTestUser(UserModel);

        const result = await callResolver(
          userMutations.deleteUser,
          {},
          {
            id: testUser.id.toString(),
          }
        );

        expect(result).toBe(true);

        const found = await UserModel.findByPk(testUser.id);
        expect(found).toBeNull();
      });

      it("should return false for non-existent user", async () => {
        const result = await callResolver(
          userMutations.deleteUser,
          {},
          {
            id: "999",
          }
        );

        expect(result).toBe(false);
      });

      it("should throw error when delete fails", async () => {
        jest
          .spyOn(UserModel, "destroy")
          .mockRejectedValueOnce(new Error("DB error"));

        await expect(
          callResolver(
            userMutations.deleteUser,
            {},
            {
              id: "1",
            }
          )
        ).rejects.toThrow("Failed to delete user");

        expect(console.error).toHaveBeenCalledWith(
          "Error deleting user:",
          expect.any(Error)
        );
      });
    });
  });
});
