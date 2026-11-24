import { user } from "../../../api/user/user.entity";

export type userIdentity = {
    id: string,
    provider: string,
    credentials: {
        username: string,
        hashedpassword: string
    },
    user: user
}