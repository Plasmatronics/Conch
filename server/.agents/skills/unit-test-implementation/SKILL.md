---
name: unit-test-implementation
description: Implement or expand unit tests using Vitest. Use when asked to add tests, improve test coverage, test a function/service/module, reproduce bugs with tests, or cover edge cases including happy paths, failure paths, malformed/null inputs, and relevant concurrency behavior.
---

# Unit Test Guidelines

Before writing tests, inspect the implementation under test and nearby existing test files to match established project patterns, helpers, factories, fixtures, and mocking conventions.
Every unit test should test exactly one unit of behavior. That is, each unit test should have exactly one behavioral expectation or scenario.
We should test happy paths, sad paths, malformed/null input paths, concurrency scenarios only when necessary to verify race-condition handling, and other relevant edge cases.
Mock modules/services only when and to the extent necessary.
Before implementing any mocks or normilization functions yourself, you should first check the vitest setup files and leverage these.
Prefer vitest 'test' over 'it' conventions.
Do not omit or change tests simply because they don't pass a use case, especially if it reveals a problem in production code.
