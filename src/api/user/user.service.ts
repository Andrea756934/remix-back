import { NotFoundError } from "../../errors/not-found.error";
import { userExistsError } from "../../errors/user-exists.error";
import { InvalidPasswordError } from "../../errors/invalid-password.error";
import { ActiveOrdersError } from "../../errors/active-orders.error";
import { userIdentityModel } from "../../utils/auth/local/user-identity.model";
import { orderModel } from "../orders/orders.model";
import { productModel } from "../prodotti/prodotti.model";
import { Address, user } from "./user.entity";
import { userModel } from "./user.model";
import { updateProfileDTO, deleteAccountDTO } from "./user.dto";
import * as bcrypt from 'bcrypt';

export class userService {
    async find(): Promise<user[]> {
        const user = await userModel.find();
        return user;
    }

    async findById(id: string): Promise<user> {
        const user = await userModel.findById(id);

        if (!user) {
            throw new NotFoundError();
        }

        return user;
    }

    async add(
        user: Omit<user, 'id' | 'fullname' | 'deletedAt' | 'addresses' | 'email' | 'createdAt'>
            & { addresses?: Omit<Address, 'id'>[] },
        credentials: { username: string, password: string }): Promise<user> {
        const existingIdentity = await userIdentityModel.findOne({ 'credentials.username': credentials.username });
        if (existingIdentity) {
            throw new userExistsError();
        }

        // l'email è lo username usato in registrazione
        const newUser = await userModel.create({ ...user, email: credentials.username });

        const hashedpassword = await bcrypt.hash(credentials.password, 10);

        await userIdentityModel.create({
            provider: 'local',
            user: newUser,
            credentials: {
                username: credentials.username,
                hashedpassword
            }
        });

        return newUser;
    }

    async updateProfile(id: string, data: updateProfileDTO): Promise<user> {
        // +email: la risposta deve contenere l'email dell'utente stesso
        const found = await userModel.findById(id).select('+email');

        if (!found || found.deletedAt) {
            throw new NotFoundError();
        }

        if (data.firstName !== undefined) found.firstName = data.firstName;
        if (data.lastName !== undefined) found.lastName = data.lastName;
        if (data.picture !== undefined) found.picture = data.picture;

        // se arriva l'array sostituisce l'elenco; tengo l'_id solo degli indirizzi che l'utente possiede già
        if (data.addresses !== undefined) {
            const owned = new Set(found.addresses!.map((address: any) => address.id));

            found.addresses = data.addresses.map(({ id: addressId, ...fields }) =>
                addressId && owned.has(addressId) ? { _id: addressId, ...fields } : fields
            ) as any;
        }

        await found.save();
        return found;
    }

    async deleteAccount(id: string, data: deleteAccountDTO): Promise<void> {
        const found = await userModel.findById(id);

        if (!found || found.deletedAt) {
            throw new NotFoundError();
        }

        const identity: any = await userIdentityModel.findOne({ user: id as any, provider: 'local' });
        const validPassword = identity && await bcrypt.compare(data.password, identity.credentials.hashedpassword);

        if (!validPassword) {
            throw new InvalidPasswordError();
        }

        // niente cancellazione con ordini aperti, come compratore o venditore
        const openOrders = await orderModel.exists({
            status: { $in: ['pending', 'paid', 'shipped'] },
            $or: [{ buyer: id }, { seller: id }]
        });

        if (openOrders) {
            throw new ActiveOrdersError();
        }

        // gli annunci attivi non sono più acquistabili
        await productModel.updateMany({ idSeller: id, status: 'active' }, { status: 'paused' });

        // anonimizzo: ordini, chat e recensioni passate restano leggibili
        found.firstName = 'Deleted';
        found.lastName = 'user';
        found.picture = '';
        found.email = undefined;
        found.addresses = [] as any;
        found.deletedAt = new Date();
        await found.save();

        // senza identità il login non è più possibile
        await userIdentityModel.deleteMany({ user: id as any });
    }
}

export default new userService();