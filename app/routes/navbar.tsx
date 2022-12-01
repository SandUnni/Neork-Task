
import { Form } from '@remix-run/react';

export default function NavbarPage() {

    return (
        <div className='navbar'>
            <h1>Welcome to Remix - Superbase application</h1>
            <Form action="/logout" method="post">
                <button
                    type="submit"
                    className="rounded py-2 px-4 bg-black-600"
                >
                    Logout
                </button>
            </Form>

        </div>
    );
}