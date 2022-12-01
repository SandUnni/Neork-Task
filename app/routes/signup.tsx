import { LoaderFunction, json } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { ActionFunction, json, redirect } from '@remix-run/node'
import { useLoaderData, Form, useActionData, Link } from '@remix-run/react';
import { commitSession, getSession } from "~/utils/session-server";
import { useTransition } from "@remix-run/react";
import { useRef } from 'react';


export const loader: LoaderFunction = async ({ request }: { request: Request }) => {

    let data = {};
    return json(data);
}

export const action: ActionFunction = async ({
    request
}: {
    request: Request;
}) => {
    const { email, password, first, last } = Object.fromEntries(await request.formData());
    const response = new Response();

    const supabaseClient = createServerClient(
        process.env.SUPABASE_URL ?? '',
        process.env.SUPABASE_ANON_KEY ?? '',
        { request, response }
    );

    const { data: userDet, error: signupError } = await supabaseClient.auth.signUp({
        email: String(email),
        password: String(password)
    });

    if (!signupError) {
        //Check the email already authenticated to avoid duplication
        if (userDet?.user?.role === "authenticated") {
            const authError = true;
            // check the user entry in profiles table. if not then insert
            const { data: profileExist } = await supabaseClient
                .from("profiles")
                .select()
                .eq('email', userDet?.user?.email)
            const ifProfile = profileExist?.length;

            if (profileExist?.length === 0) {
                const { data: profileData, error: profileError } = await supabaseClient
                    .from("profiles")
                    .insert([{ email, first, last, id: userDet?.user?.id }]);
                return json(
                    { userDet, signupError, authError, profileError, profileData },
                    {
                        headers: response.headers
                    }
                );
            }
            else {
                return json(
                    { userDet, signupError, authError, ifProfile },
                    {
                        headers: response.headers
                    }
                );
            }

        }
        else {
            //make an entry in profiles table
            const { data, error: profileError } = await supabaseClient
                .from("profiles")
                .insert([{ email, first, last, id: userDet?.user?.id }]);

            return json(
                { userDet, signupError, profileError },
                {
                    headers: response.headers
                }
            );
        }

    }
    else {
        return json(
            { userDet, signupError },
            {
                headers: response.headers
            }
        );
    }

};

export default function SignupPage() {

    // const loadData = useLoaderData(); // This will call the loader() function
    const actionData = useActionData(); // This will call the action() when form submit
    var transition = useTransition();
    let showMsg: boolean = false;
    let formRef = useRef<any>();

    if (actionData) {
        if (!actionData?.signupError && !actionData?.ifProfile) {
            formRef.current?.reset();
            showMsg = true;
        }

    }
    return (
        <>
            {/* <NavbarPage /> */}
            <div className="container-class">
                <div className="section-class">
                    <h1 className='signup-header'>Sign Up</h1>
                    <span style={{ textAlign: 'center' }}>It's quick and easy.</span>
                    <Form ref={formRef} method="post" className="space-y-6">
                        <div className='form_item'>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    required
                                    autoFocus={true}
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    aria-invalid={actionData?.errors?.email ? true : undefined}
                                    aria-describedby="email-error"
                                    className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                                />
                            </div>
                        </div>
                        <div className='form_item'>
                            <label
                                htmlFor="first"
                                className="block text-sm font-medium text-gray-700"
                            >
                                First name
                            </label>
                            <div className="mt-1">
                                <input

                                    id="first"
                                    required
                                    name="first"
                                    type="text"
                                    autoComplete="first"
                                    aria-invalid={actionData?.errors?.first ? true : undefined}
                                    aria-describedby="first-error"
                                    className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                                />
                            </div>
                        </div>
                        <div className='form_item'>
                            <label
                                htmlFor="last"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Last name
                            </label>
                            <div className="mt-1">
                                <input

                                    id="last"
                                    required
                                    name="last"
                                    type="text"
                                    autoComplete="last"
                                    aria-invalid={actionData?.errors?.last ? true : undefined}
                                    aria-describedby="last-error"
                                    className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                                />
                            </div>
                        </div>


                        <div className='form_item'>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    required
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={actionData?.errors?.password ? true : undefined}
                                    aria-describedby="password-error"
                                    className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                                />
                            </div>
                        </div>
                        {transition.state === "idle" ?
                            <div className='form_item'>
                                <button
                                    type="submit"
                                    className="weight-class w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                                >
                                    Sign Up
                                </button>
                                {(actionData?.authError && actionData?.ifProfile) ?
                                    <div className="pt-1 text-red-700 error-class" >
                                        {'This user already exists'}
                                    </div>
                                    : null}
                            </div> : null
                        }
                        <div className="form_item forget-class">
                            <Link
                                className="text-blue-500 underline"
                                to={{
                                    pathname: "/",
                                }}
                            >
                                <button>
                                    Back to login
                                </button>
                            </Link>
                        </div>
                    </Form>
                    {actionData?.signupError &&
                        <div className='form_item'>
                            <div className="pt-1 text-red-700 error-class" >
                                {'Error when sign up'}
                            </div>
                        </div>
                    }
                    {showMsg && (<div className='form_item alert-class'>
                        <p>Thank you for your signing up. To get you started please confirm your email address by clicking the link sent in your mail.</p>

                    </div>)
                    }

                </div>
            </div>

        </>
    );
}