This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, clone the repository and install the dependencies:

```bash
git clone
cd the-stack
npm install
```

Next, create a `.env` file in the root directory and add your environment variables. You can use the provided `.env.example` as a template.

```bash
cp .env.example .env
```

Make sure to fill in the required values in `.env`.

Now you need to create 2 directories inside the `DATA_FOLDER` folder:

- json (copy the files from the `src/data`folder inside it)
- photos (copy the `data/photos/statue-houdain.jpg` inside it)

Next, you need to set up the database. This project uses MySQL, and you can run it using Docker. Make sure you have Docker installed and running on your machine.
To start the MySQL database, run the following command:

```bash
docker compose -f docker-compose.dev.yml --env-file .env up
```

This command will start the MySQL service defined in `docker-compose.dev.yml` using the environment variables specified in `.env`.
After the database is up and running, you can push the initial schema and seed data. Run the following command:

```bash
npx prisma db push
```

This command will apply the Prisma schema to your database.
Now, you can run the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
