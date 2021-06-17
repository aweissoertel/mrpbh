// @ts-ignore
import * as G from 'grud';
const Grud = G.default;

export class Storage {
    private db: any;
    private config = {
        protocol: "https",           //If not passed, defaults to 'https'
        host: "api.github.com",      //If not passed, defaults to 'api.github.com' | In case of Enterprise-GitHub e.g github.snapcircle.net.
        pathPrefix: "",              //Leave empty if you are using github.com | In case of Enterprise-GitHub e.g api/v3
        owner: process.env.GH_OWNER,           //Your GitHub username
        repo: "mrpbh-store",             //Your repository name where you'd like to have your JSON store hosted
        personalAccessToken: process.env.GH_TOKEN, //Your personal-access-token with write access
        path: ""
    };

    constructor(file: string) {
        this.config.path = `storage/${file}.json`;
        this.db = new Grud(this.config);
    }

    async getItem(key: string): Promise<number | string> {
        const ans = await this.db.find({ "id": key });
        return await ans?.count;
    }

    async setItem(key: string, value: number | string): Promise<number | string> {
        const data = { id: String(key), count: String(value), };
        return await this.db.update({ id: key }, data);
    }

    async createItem(key: string, value: number | string): Promise<number | string> {
        const data = { id: key, count: String(value), };
        return await this.db.save(data);
    }
}
