import { json, MetaFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "~/styles/shared.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-remix'


export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "My Remix App",
  viewport: "width=device-width,initial-scale=1",
});


export function links() {
  return [{ rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: tailwindStylesheetUrl }
  ];
}

export const loader: LoaderFunction = () => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env
  return json({
    env: {
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    },
  })
}

export default function App() {
  const { env } = useLoaderData()
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
