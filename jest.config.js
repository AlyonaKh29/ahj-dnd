module.exports = {
  projects: [
    {
      displayName: "unit",
      testEnvironment: "jsdom",
      testMatch: ["**/src/js/**/*.test.js"],
    },
    {
      displayName: "e2e",
      testEnvironment: "node",
      testMatch: ["**/e2e/*.e2e.test.js"],
      setupFilesAfterEnv: ["./jest-e2e-setup.js"],
    },
  ],
};
