# 05 - TypeScript API Client

A type-safe REST API Client built with TypeScript and modern web standards.

## Learning Objectives
- Master HTTP communication using native `fetch` with full TypeScript typing.
- Understand generic request/response models (`GET`, `POST`, `PUT`, `DELETE`).
- Implement custom HTTP error handling and status code validation.
- Explore interceptors/middleware patterns (auth headers, logging).
- Test asynchronous API integrations using mock implementations in Vitest.

## Project Structure
```text
05-typescript-api-client/
├── src/
├── tests/
├── dist/
├── eslint.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts
- `npm run build`: Compile TypeScript into `./dist` using `tsc`
- `npm run watch`: Run the TypeScript compiler in watch mode
- `npm run test`: Run automated tests using Vitest
- `npm run lint`: Run ESLint checks
- `npm run format:check`: Check code formatting using Prettier
