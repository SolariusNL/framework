<div align="center">
  <h1>Framework App</h1>
  
[![Main workflow](https://github.com/Tsodinq/framework/actions/workflows/main.yml/badge.svg)](https://github.com/Tsodinq/framework/actions/workflows/main.yml)

  Framework is an online platform that empowers imagination and innovation. This repository is the home to the Framework web application.
  
</div>

## Tech Stack

Framework is built on the following technologies:

- [TypeScript](https://www.typescriptlang.org) - A typed superset of JavaScript that compiles to plain JavaScript
  - [Next.js](https://nextjs.org) - A server-side framework for building blazing fast websites and apps
  - [React](https://reactjs.org) - A declarative, efficient, and flexible JavaScript library for building user interfaces
    - [Mantine](https://mantine.dev) - A modern, flexible, and extensible framework for building websites and apps
- [Postgres](https://www.postgresql.org) - A powerful, open source object-relational database system
  - [Prisma](https://www.prisma.io) - A open source, distributed database layer for modern applications

## Components

Framework has a pretty large, distributed codebase consisting of what we call 'components'. Check them out, and freely research the workings of our platform.

- [framework-flags](https://github.com/Tsodinq/framework-flags) - **ℹ️ Under Development** Our own feature flag implementation, soon to replace HappyKit
- [framework-persistent-file-storage](https://github.com/Tsodinq/framework-persistent-file-storage) - Serve images from static Next.js directories
- [framework-discord](https://github.com/Tsodinq/framework-discord) - Source code of Framework's Discord bot
- [framework-desktop](https://github.com/Tsodinq/framework-desktop) - Framework desktop client
- [framework-wiki](https://github.com/Tsodinq/framework-wiki) - Framework wiki, contains guides, tutorials, API documentation, and lots more

## Directory Structure

- **.vscode** - Visual Studio Code settings
- **cron** - Node.js application that runs scheduled tasks necessary for the application to run
- **prisma** - Prisma migrations, schema
  - **migrations** - Prisma migrations
  - **schema.prisma** - Prisma schema
- **public** - Static assets set up by Next.js
  - **avatars** - Avatar store
- **scripts** - Scripts for building and deploying the application
  - **seed.ts** - Seed database with required data
- **src** - Main source code
  - **components** - Reusable React components
  - **contexts** - React contexts, used for global state management
  - **pages** - Next.js routes
  - **styles** - CSS styles
  - **types** - TypeScript types
  - **util** - Utility functions

## Installation

Framework is very easy to set up and deploy.

- **Set up** PostgreSQL
  - Go to the [PostgreSQL website](https://www.postgresql.org/download/) and download the latest version for your operating system.
  - Install PostgreSQL.
- **Clone** the repository
  - Run `git clone https://github.com/Tsodinq/framework.git` to clone the repository to your local machine.
- **Install** the dependencies
  - Run `yarn setup-projects` to install dependencies for all the projects.
- **Seed** the database
  - Run `yarn run seed` to generate Prisma types and seed the database with initial data.
- **Generate** config schema
  - Run `yarn run create-config-schema` to generate the config schema for intellisense support in the `framework.yml` file.
- **Configure** your `.env` file, some important things may be the database connection url, or optional API keys for extended functionality.
- **Configure** your `framework.yml` file, this is where you can configure the application to your liking, such as editing footer links, enabling or disabling features, and more.
- **Build** the application
  - Run `yarn build` to build the application. This will create a `dist` directory with the compiled application.
- **Deploy** the application
  - Run `yarn run start` to start the application. This will start the application on port 3000.

If you're wanting to set up a development environment, you can run `yarn dev` to start the development server.

## Contributing

All contributions are welcome. Please feel free to open an issue or pull request if you have any questions or suggestions. Thanks!

## License

Framework is licensed under the [MIT License](https://opensource.org/licenses/MIT). Please feel free to use, modify, and redistribute the source code.

The MIT license does not grant you the right to use any trademark, service mark, or other intellectual property of Soodam.re or its affiliates.
