export type address = {
    id: string,
    fullname: string,
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
    addresses?: address[],
    deletedAt: Date
}