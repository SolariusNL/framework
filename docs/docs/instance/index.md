# Framework Instances

Framework is a FOSS open-source project, and because of that, you can self-host it. This means that you can run your own instance of Framework, and you can invite your friends to use it. This is a great way to have a private community or even an instance that federates with other instances.

## How to run your own instance

- **Retrieve the source code from the [GitHub repository](https://github.com/Tsodinq/framework)**
  : You can either download the source code as a zip file, or clone the repository using git.

- **Install required dependencies**
  : Yarn is the package manager used by the Framework Node.js project. You can install it using the [official documentation](https://yarnpkg.com/en/docs/install).
  : PostgreSQL is the database used by Framework and its database interface, Prisma. Find the installation instructions for your operating system [here](https://www.postgresql.org/download/).

- **Run yarn setup scripts**
  : Run `yarn run setup-projects && yarn run migrate && yarn run seed && yarn` to install all dependencies, run the database migrations, and seed the database.

- **Run the server**
  : Run `yarn run dev` in your terminal to start a development server. You can also run `yarn run build && yarn run start` to build the project and run it in production mode.

You're all set! You can now invite your friends to your instance by sharing the link to your instance. Framework does not require any special configuration, so you can just run it as-is. You can also run it behind a reverse proxy such as [nginx](https://nginx.org/en/) or [Apache](https://httpd.apache.org/).

## Troubleshooting

- **I'm getting an error when running yarn run setup-projects**
  : Make sure you have yarn installed on your system and that it is in your PATH. You can check this by running `yarn --version` in your terminal. If you get an error, you can install yarn using the [official documentation](https://yarnpkg.com/en/docs/install).

- **I'm getting an error when running yarn run migrate**
  : Make sure you have PostgreSQL installed on your system and that it is in your PATH. You can check this by running `psql --version` in your terminal. If you get an error, you can install PostgreSQL using the [official documentation](https://www.postgresql.org/download/).

Create an issue on the [GitHub repository](https://github.com/Tsodinq/framework) if you have any other issues that are not listed here.
