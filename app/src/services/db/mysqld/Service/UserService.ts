import { Pool } from "mysql2/promise";
import { isEmail } from "../../../../utils/validateEmail";
import { UserRepository, User } from "../Repository/UserRepository";

export class UserService {
    private repo: UserRepository;

    constructor(db: Pool) {
        this.repo = new UserRepository(db);
    }

    public async findUser(email: string): Promise<User | null> {
        // 正しいメールアドレスではない場合はnullを返す
        if (!isEmail(email)) return null;

        return this.repo.findByEmail(email);
    }
}