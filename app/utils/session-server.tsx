import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
    createCookieSessionStorage({
        cookie: {
            name: "superbase-token",
            expires: new Date(Date.now() + 60),
            httpOnly: true,
            maxAge: 60,
            path: "/",
            sameSite: "lax",
            secrets: ["s3cret1"],
            secure: true,
        },
    });

export { getSession, commitSession, destroySession };
