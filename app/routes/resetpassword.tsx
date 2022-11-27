import { useLoaderData, Form, useActionData, Link, useTransition, useParams } from '@remix-run/react';
import { LoaderFunction, json, redirect, ActionFunction } from '@remix-run/node'
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';


export const loader: LoaderFunction = async ({ request }: { request: Request }) => {

    const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env
    return json({
        env: {
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
        },
    })
}

export const action: ActionFunction = async ({
    request
}: {
    request: Request;
}) => {
    const { newPassword, confirmpassword, hashKey } = Object.fromEntries(await request.formData());

    var accessToken: any = "";
    var refreshToken: any = "";
    var type = "";
    if (hashKey) {
        const hashArr: string = hashKey.substring(1)
            .split("&")
            .map((params) => params.split("="));
        for (const [key, value] of hashArr) {
            if (key === "access_token") {
                accessToken = value;
            }
            if (key === "type") {
                type = value;
            }
            if (key === "refresh_token") {
                refreshToken = value;
            }
        }
    }


    let mismatch = false;
    if (newPassword !== confirmpassword) {
        mismatch = true;
    }

    if (type === "recovery" && accessToken !== "") {
        return json(
            { type, accessToken, mismatch, newPassword, refreshToken }
        );

    }
    else {
        return json(
            { mismatch, newPassword, type }
        );
    }



};
export default function resetpasswordPage() {
    const loadData = useLoaderData(); // This will call the loader() function
    const actionData = useActionData(); // This will call the action() when form submit  
    const [hashValue, setHash] = useState<any>('');

    let formRef = useRef();
    var transition = useTransition()
    let showMsg = false;
    let msg = "";
    let msgClass = "";
    useEffect(() => {
        setHash(window.location.hash);
    }, [])


    if (actionData?.newPassword && actionData?.accessToken && !actionData?.mismatch && actionData?.type === "recovery") {
        showMsg = true;
        const supabase = createClient(loadData?.env.SUPABASE_URL,
            loadData?.env.SUPABASE_ANON_KEY);

        supabase.auth.setSession({ access_token: actionData?.accessToken, refresh_token: actionData?.refreshToken })

        try {
            const result = supabase.auth
                .updateUser({ password: actionData?.newPassword })
            msg = "Password updated successfully!";
            msgClass = "form_item alert-class-success";
        }
        catch (error) {
            msg = "Password updatation failed!";
            msgClass = "form_item error-class";
        }

        formRef.current?.reset();

    }




    return (
        <div className="container-class">
            <div className="section-class">
                <h1 className='signup-header'>Reset password</h1>
                <Form ref={formRef} method="post" className="space-y-6">
                    <input type="hidden" id="hashKey" name="hashKey" value={hashValue} />
                    <div className='form_item'>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            New password
                        </label>
                        <div className="mt-1">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                autoFocus={true}
                                required
                                aria-describedby="newPassword-error"
                                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                            />

                        </div>
                    </div>
                    <div className='form_item'>
                        <label
                            htmlFor="confirmpassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirm new password
                        </label>
                        <div className="mt-1">
                            <input
                                id="confirmpassword"
                                name="confirmpassword"
                                type="password"
                                required
                                aria-describedby="confirmpassword-error"
                                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                            />
                            {actionData?.mismatch && (
                                <div className="pt-1 form_item error-class" id="password-error">
                                    {'Password mismatch'}
                                </div>
                            )}
                        </div>
                    </div>
                    {
                        transition.state === "idle" ?
                            <div className='form_item'>
                                <button
                                    type="submit"
                                    className="button-signup w-full rounded bg-yellow-500  py-2 px-4 text-white"
                                >
                                    Submit
                                </button>

                            </div> : null
                    }


                </Form>
                {showMsg ?
                    <div className='form_item'>

                        <div className={msgClass}>
                            <p>{msg}</p>
                        </div>
                    </div> : null
                }

                {showMsg ?
                    <div className='form_item'>
                        <Link
                            className="text-blue-500 underline"
                            to={{
                                pathname: "/",

                            }}
                        >
                            <button
                                className="weight-class w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 "
                            >
                                Login now
                            </button> </Link>

                    </div> : null}



            </div>
        </div>
    );
}