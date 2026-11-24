export class userExistsError extends Error {
    constructor() {
        super();
        this.name = 'userExists';
        this.message = 'user already in use';
    }
}