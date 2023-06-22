<div align="center">
  <img src="https://invent.solarius.me/Soodam.re/framework/-/raw/main/public/logo-dark.png" />
  <h1>Framework</h1>
  
  Framework is a free and open-source decentralized and federated alternative to Roblox. Our goal is to provide users with a platform that prioritizes privacy and freedom of expression while still allowing for the creation and sharing of user-generated content.
  
</div>

## Tech Stack

Framework is built on the following technologies:

- **Next.js**: Framework is built using Next.js, a framework for building server-rendered React applications. Next.js provides a powerful set of features out of the box, including automatic code splitting, static site generation, and easy development with hot reloading.

- **react-email**: react-email is used for creating responsive and accessible email templates with React.

- **Prisma & Postgres**: Prisma is an ORM (Object-Relational Mapping) tool that allows for easy communication between the application and the database. We are using Postgres as our database management system.

- **Zustand**: Zustand is a lightweight state management library for React that allows for easy and efficient state management in the application.

- **Socket.io**: Socket.io is used for real-time communication between clients and the server. This allows for real-time updates, such as chat and multiplayer functionality, to be implemented easily.

- ...and more

## Components

Framework has a pretty large, distributed codebase. Check out these other projects that integrate with the platform.

- [framework-flags](https://invent.solarius.me/Soodam.re/framework-flags) - **ℹ️ Under development** Our own feature flag implementation, soon to replace HappyKit
- [framework-persistent-file-storage](https://invent.solarius.me/Soodam.re/framework-persistent-file-storage) - Serve images from static Next.js directories
- [framework-discord](https://invent.solarius.me/Soodam.re/framework-discord) - Source code of Framework's Discord bot
- [framework-desktop](https://invent.solarius.me/Soodam.re/framework-desktop) - Framework desktop client
- [framework-wiki](https://invent.solarius.me/Soodam.re/framework-wiki) - Framework wiki, contains guides, tutorials, API documentation, and lots more

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

### Clone the repository:

Start by cloning the Framework repository from the link provided https://invent.solarius.me/Soodam.re/framework.git onto your local machine:

`git clone https://invent.solarius.me/Soodam.re/framework.git`

### Requirements:

Make sure you have the following installed on your machine:

- Node.js
- Yarn package manager
- Postgres

### Setup the project:

In the root directory of the cloned repository, run the command `yarn run setup-projects` to install all of the necessary dependencies and set up the project.

### Migrate the database:

After the project is set up, run the command yarn run migrate to create the necessary database tables for the application.

### Seed the database:

Run the command `yarn run seed` to seed the database with initial data.

### Edit the `.env` file:

In the root directory of the cloned repository, you will find a file called `.env`. Edit this file to fill in the connection URL for your Postgres database, email delivery settings, and configure other optional integrations.

Each property is documented to assist you.

### Edit the `framework.yml` file:

In the root directory of the cloned repository, you will find a file called `framework.yml`. Edit this file to configure the installation.

### Set the admin user's password:

Run the command `yarn run ctl --set-pwd {password}` to set the admin user's (username is **Framework**) password.

### Build and start the application:

Run the command yarn run build to build the application, and then `yarn run start` to start the application. The application should now be running on your local machine and can be accessed at http://localhost:3000

**Note:** Make sure to update the .env and framework.yml file to match your environment.

## Contributing

We welcome contributions of all forms, including bug reports, feature requests, and code contributions. Please feel free to open an issue or pull request if you have any questions or suggestions. Thanks!

## License

Framework is licensed under the [MIT License](https://opensource.org/licenses/MIT). Please feel free to use, modify, and redistribute the source code.

The MIT license does not grant you the right to use any trademark, service mark, or other intellectual property of Solarius or its affiliates.
