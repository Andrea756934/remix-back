import { updateProfileDTO, deleteAccountDTO } from "./user.dto";
import { orderModel } from "../orders/orders.model";
import { productModel } from "../prodotti/prodotti.model";
import { InvalidPasswordError } from "../../errors/invalid-password.error";
import { ActiveOrdersError } from "../../errors/active-orders.error";
import { NotFoundError } from "../../errors/not-found.error";
import { userExistsError } from "../../errors/user-exists.error";
import { userIdentityModel } from "../../utils/auth/local/user-identity.model";
import { user } from "./user.entity";
import { userModel } from "./user.model";
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
        user: Omit<user, 'id' | 'fullname' | 'addresses' | 'deletedAt'>,
        credentials: { username: string, password: string }): Promise<user> {
        const existingIdentity = await userIdentityModel.findOne({ 'credentials.username': credentials.username });
        if (existingIdentity) {
            throw new userExistsError();
        }

        const newUser = await userModel.create(user);

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
        const found = await userModel.findById(id);

        if (!found || found.deletedAt) {
            throw new NotFoundError();
        }

        if (data.firstName !== undefined) {
            found.firstName = data.firstName;
        }

        if (data.lastName !== undefined) {
            found.lastName = data.lastName;
        }

        if (data.picture !== undefined) {
            found.picture = data.picture;
        }

        //se arriva l'array sostituisce l'elenco; tengo l'_id solo degli indirizzi che l'utente possiede già
        if (data.addresses !== undefined) {
            const owned = new Set(found.addresses?.map((address: any) => address.id));

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

        const identity = await userIdentityModel.findOne({ user: id as any, provider: 'local' });
        const validPassword = identity && await bcrypt.compare(data.password, identity.credentials.hashedpassword);

        if (!validPassword) {
            throw new InvalidPasswordError();
        }

        //niente cancellazione con ordini aperti, come compratore o venditore
        const openOrders = await orderModel.exists({
            status: { $in: ['pending', 'paid', 'shipped'] },
            $or: [{ buyer: id }, { seller: id }]
        });

        if (openOrders) {
            throw new ActiveOrdersError();
        }

        //gli annunci attivi non sono più acquistabili 
        await productModel.updateMany({ sellerId: id, status: 'active' }, { status: 'paused' });

        //anonimizzo: gli ordini, le chat e le recensioni passate restano leggibili
        found.firstName = 'Deleted';
        found.lastName = 'user';
        found.picture = '';
        found.addresses = [] as any;
        found.deletedAt = new Date();
        await found.save();

        //senza identità il login non è più possibile
        await userIdentityModel.deleteMany({ user: id as any })
    }
}

export default new userService();