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
Next, you need to set up the database. This project uses MySQL, and you can run it using Docker. Make sure you have Docker installed and running on your machine.
To start the MySQL database, run the following command:

```bash
docker compose -f .\docker-compose.dev.yml --env-file .env up
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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
