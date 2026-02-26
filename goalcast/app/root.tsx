import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import Layout from "~/components/Layout";

import "bootstrap/dist/css/bootstrap.min.css";
import "~/styles/styles.scss";

import { type LoaderFunctionArgs, data } from "@remix-run/node";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response();

  const supabase = getSupabaseServerClient({ request, response });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return data({ user }, { headers: response.headers });
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Layout user={user}>
      <Outlet />
    </Layout>
  );
}
