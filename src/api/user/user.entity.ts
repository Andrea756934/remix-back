export type Address = {
    id: string,
    fullName: string,
    street: string,
    city: string,
    country: string,
    phone?: string
}

export type user = {
    id: string,
    firstName: string,
    lastName: string,
    fullname: string,
    picture: string,
    email?: string,        // presente solo quando l'utente guarda sé stesso
    createdAt: Date,
    addresses?: Address[],
    deletedAt?: Date
}