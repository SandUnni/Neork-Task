import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient } from '@supabase/auth-helpers-remix'
import { destroySession, getSession } from "~/utils/session-server";

export async function action({ request }: ActionArgs) {
    const response = new Response();

    const supabaseClient = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { request, response }
    );

    const { error } = await supabaseClient.auth.signOut()

    let session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });


}
export async function loader() {
    return redirect("/");
}

