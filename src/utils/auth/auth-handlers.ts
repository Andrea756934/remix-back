import { user as appUser } from '../../api/user/user.entity';
import './local/local.strategy';
import './jwt/jwt.strategy';

declare global {
    namespace Express {
        interface user extends appUser {

        }
    }
}