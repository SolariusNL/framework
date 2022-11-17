# Installation

In this article, we'll go over how to self-host your own instance of Framework. This is recommended for users who don't want to use the public instance of Framework, and users who want to completely maintain their anonymity.

## Prerequisites

Before you begin, you'll need to have the following installed on your machine:

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)
- [PostgreSQL](https://www.postgresql.org/download/)

We recommend using a Linux distribution for self-hosting, as we have not tested Framework on Windows or macOS, and do not provide support for these operating systems.

!!! note

    framework-ctl is only available on Linux distributions as it uses several Unix-specific commands,
    such as `sudo` and `systemctl`.

## Installing Framework

We need to get the source code for Framework. First, `cd` into the directory where you want to install Framework. Make sure you have proper permissions set for this directory, as Framework will need to write to it.

Then, run the following command:

```bash
git clone https://github.com/Tsodinq/framework.git
```

!!! note

    If you're on Windows, you might encounter an error when running this command along the lines of `git: command not found`. 

    You may have recently installed Git, and your system hasn't picked up the changes yet in the PATH environment variable. You can fix this by restarting your computer.

Next, we need to install the dependencies for Framework. We'll need to get `yarn`, if you don't already have it installed. You can do this by running the following command:

```bash
npm install -g yarn
```

Then, we can install the dependencies for Framework by running the following command:

```bash
yarn install
```

## Setting up subprojects

Framework consists of several subprojects. We need to set up each of these subprojects before we continue. We have a simple `package.json` script that will do this for us. Run the following command:

```bash
yarn run setup-projects
```

This will:
- Install the dependencies for each subproject
- Generate a config schema for Frameworks master config
- Generate example config files

## Setting up the database

Framework uses PostgreSQL as its database. If you don't already have PostgreSQL, you can download it [here](https://www.postgresql.org/download/).

Remember the username and password you set for PostgreSQL during the installation process? We'll need those to set up some environment variables that'll allow Framework's CRM to interact with the database, and make its initial connection.

