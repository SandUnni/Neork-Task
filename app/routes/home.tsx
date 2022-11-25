import NavbarPage from "./navbar";
import { getSession, destroySession } from "~/utils/session-server";
import { useLoaderData, Form, useActionData, Link } from '@remix-run/react';
import { LoaderFunction, json, redirect } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { ActionFunction } from '@remix-run/node'


export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
    const response = new Response()
    const redirectTo = new URL(request.url).pathname;
    let session = await getSession(request.headers.get("Cookie"));
    const supabaseClient = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { request, response }
    );


    if (!session.has("access_token")) {
        let searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/?${searchParams}`);
    } else {
        const { data: { user }, error: sessionErr } = await supabaseClient.auth.getUser(
            session.get("access_token")
        );

        if (!sessionErr) {
            const userId = user?.id;
            const { data: userDetails } = await supabaseClient.from('profiles').
                select()
                .eq('id', userId)

            return { user, userId, userDetails };
        } else {
            return { error: sessionErr };
        }
    }

};

/**
 * this handles the form submit which destroys the user session
 * and by default logs the user out of application
 * @param {*} param0
 * @returns
 */


export default function homePage() {

    const loadData = useLoaderData();

    return (
        <>
            <NavbarPage />
            <div className="container-class">
                <h1 className="signup-header">Welcome {`${loadData?.userDetails[0]?.first ?? ''}  ${loadData?.userDetails[0]?.last ?? ''}`}</h1>

            </div>

        </>
    );
}