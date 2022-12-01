import { useLoaderData, Form, useActionData, Link, useTransition } from '@remix-run/react';
import { LoaderFunction, json, redirect } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'
import { ActionFunction } from '@remix-run/node'
import { commitSession, getSession } from "~/utils/session-server";

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  let data = {};
  return json(data);
}

export const action: ActionFunction = async ({
  request
}: {
  request: Request;
}) => {
  const { email, password } = Object.fromEntries(await request.formData());
  const response = new Response();

  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );


  const { data: user, error } = await supabaseClient.auth.signInWithPassword({
    email: String(email),
    password: String(password)
  });



  const {
    data: { session },
  } = await supabaseClient.auth.getSession()

  const access_token = session?.access_token
  if (!error) {

    let session = await getSession(request.headers.get("Cookie"));
    session.set("access_token", access_token);
    // redirect to home page with the cookie set in header
    return redirect("/home", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  else {
    return json(
      { user, error }
    );

  }

};

export default function Index() {
  //const loadData = useLoaderData(); // This will call the loader() function
  const actionData = useActionData(); // This will call the action() when form submit
  var transition = useTransition()

  return (
    <>
      <div className="container-class">
        <div className="section-class">
          <h1 className='signup-header'>Login</h1>
          <Form method="post" className="space-y-6">
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
                  aria-describedby="password-error"
                  className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                />

              </div>
            </div>
            {transition.state === "idle" ? <div className='form_item'>
              <button
                type="submit"
                className="weight-class w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                Log in
              </button>
              {actionData?.error?.message && (
                <div className="pt-1 text-red-700 error-class">
                  {actionData.error.message}
                </div>
              )}
            </div> : null}
          </Form>
          <div className="form_item forget-class">

            <Link
              className="text-blue-500 underline"
              to={{
                pathname: "/forgetpassword",
              }}
            >
              <button>
                Forget password?
              </button>
            </Link>
          </div>
          <div className="form_item">
            <Link
              className="text-blue-500 underline"
              to={{
                pathname: "/signup",
              }}
            >
              <button
                className="button-signup w-full rounded bg-yellow-500  py-2 px-4 text-white btn-text"
              >
                Create New Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
