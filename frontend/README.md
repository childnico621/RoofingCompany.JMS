This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## estructura del proyecto basado en FSD (https://feature-sliced.design/docs/get-started/overview)

layers -> slices -> segments 

```text
frontend/
│
├── src/
│   │
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        
│   │   ├── layout.tsx
│   │   └── ...
│   │
│   ├── features/           # Capa de negocio (features)
│   │   ├── jobs/           # feature: gestión de empleos
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   ├── ui/
│   │   │   └── index.ts
│   │   │
│   │   └── employees/      # feature: gestión de empleados
│   │       ├── ...
│   │
│   ├── shared/             # Código compartido entre features
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/            # lib/query-builder, lib/event-emitter
│   │   ├── types/
│   │   └── ui/
│   │
│   ├── pages/              # Vistas que usan las features
│   │   ├── index.tsx
│   │   └── ...
│   │
│   ├── providers/          # Context Providers
│   ├── stores/             # Zustand or Redux stores globales
│   ├── styles/             # Global styles y variables
│   ├── utils/              # Utils compartidos
│   ├── index.ts            # Punto de entrada
|   |
|   ├── entities/           # Modelos y interfaces globales de negocio, entidades.
|   |   ├── job/
|   |   └── employee/
|   |   
|   | 
└── next.config.js
```