

import { MongoClient } from 'mongodb';
import { Model } from './model';

enum states {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
}

export interface dbConstrutor {
    url: string,
    username?: string,
    password?: string,
}

export type dbState = states.CONNECTING | states.CONNECTED | states.DISCONNECTED;

export default class Databse {

    url: string;
    state: dbState;
    models: Array<null | Model>;
    plugins: Array<null | Plugin>;
    options: any[];

    _connection: MongoClient | null = null;
    _connectionPromise: Promise<MongoClient> | null = null;;

    constructor({ url = 'localhost', username, password }: dbConstrutor) {
        this.url = `mongodb://${url}`;
        this.state = states.DISCONNECTED;
        this.models = [];
        this.plugins = [];
        this.options = [];
    }

    getConnection() {
        if (this.state === states.CONNECTED) {
            return this._connection;
        }
        return null;
    }

    connect(): Promise<MongoClient> {

        if (this.state === states.CONNECTING) {
            Promise.resolve();
        }

        if (this._connection) {
            return Promise.resolve(this._connection);
        }

        this.state = states.CONNECTING;
        this._connectionPromise = MongoClient.connect(this.url, {})
            .then(db => {
                this.state = states.CONNECTED;
                this._connection = db;
                return db;
            });

        return this._connectionPromise;
    }

    async disconnect(): Promise<void> {
        return this.connect().then(db => {
            db.close();
            this.state = states.DISCONNECTED;
        });
    }

    registerModel(model: Model) {
        this.models.push(model);
        model.database = this;
        model.use(this.plugins);
    }

    registerModels(model: Array<Model>) {
        model.forEach(model => {
            model.database = this;
            model.use(this.plugins);
            this.models.push(model);
        });
    }

    usePlugin(plugin: Plugin) {
        this.plugins.push(plugin);
    }

    usePlugins(plugins: Array<Plugin>) {
        this.plugins.push(...plugins);
    }
}