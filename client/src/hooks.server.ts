import type { Handle } from "@sveltejs/kit";
import { Config } from "./config";
import type { User } from "./types/user.type";

export const handle: Handle = async ({ event, resolve }) => {
    try {
        const session = event.cookies.get("sessionCookie");
        if (!session) {
            console.info("No session cookie");
            event.locals.user = null;
            return await resolve(event);
        }

        const respone = await fetch(Config.VITE_API_URL + "/auth", {
            method: "GET",
            headers: {
                Cookie: `sessionCookie=${session}`,
            },
        });
        if (!respone.ok) {
            throw new Error("Failed to get user");
        }
        const user = await respone.json() as User;

        // const decodedToken = await serverAuth.verifySessionCookie(session);
        event.locals.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            providerId: user.providerId,
        }

        const response = await resolve(event);
        return response;
    } catch (error) {
        console.error(error);
        event.locals.user = null;
        return await resolve(event);
    }
};
