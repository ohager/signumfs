/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["mocks", "data"],
  collectCoverage: true,
  moduleNameMapper: {
    "^@lib/(.*)": "<rootDir>/src/lib/$1",
    "^@commands/(.*)": "<rootDir>/src/commands/$1",
  },
};
