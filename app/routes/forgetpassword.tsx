
import { useLoaderData, Form, useActionData, Link, useTransition } from '@remix-run/react';
import { LoaderFunction, json, redirect, ActionFunction } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'
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
    const { email } = Object.fromEntries(await request.formData());
    const response = new Response();


    const supabaseClient = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { request, response }
    );


    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${process.env.PROJECT_BASE_URL}/resetpassword` }
    )
    return json(
        { data, error }
    );

};
export default function ForgetpasswordPage() {

    const actionData = useActionData();
    var transition = useTransition();

    let formRef = useRef();
    let showMsg = false;
    if (actionData?.data) {
        showMsg = true;
        formRef.current?.reset();

    }
    return (
        <div className="container-class">
            <div className="section-class">
                <h1 className='signup-header'>Forgot your password?</h1>
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

                                aria-describedby="email-error"
                                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                            />
                            {actionData?.errors?.email && (
                                <div className="pt-1 text-red-700" id="email-error">
                                    {actionData.errors.email}
                                </div>
                            )}

                        </div>
                    </div>
                    {transition.state === "idle" ?
                        <div className='form_item'>
                            <button
                                type="submit"
                                className="button-signup w-full rounded bg-yellow-500  py-2 px-4 text-white"
                            >
                                Submit
                            </button>
                        </div> : null}
                    <div className="form_item forget-class">
                        <Link
                            className="text-blue-500 underline"
                            to={{
                                pathname: "/",
                                // search: searchParams.toString(),
                            }}
                        >
                            <button>
                                Back to login
                            </button>
                        </Link>
                    </div>

                </Form>
                {showMsg ?
                    <div className='form_item alert-class'>
                        <p>An email has been sent to you with a password reset link. Make sure to check your spam folder .</p>

                    </div> : null
                }
            </div>
        </div>
    );
}