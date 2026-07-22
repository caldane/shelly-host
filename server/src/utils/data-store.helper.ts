import fs from "fs/promises";
import path from "path";
import { Db, MongoClient } from "mongodb";
import { logger } from "../logger";

const mongoUrl = process.env.MONGO_URL || "mongodb://mongo:27017";
const mongoDbName = process.env.MONGO_DB_NAME || "shelly_host";
const jsonAssetsPath = path.resolve(process.cwd(), "src/assets/json");

const jsonCollections = [
    { collection: "config", file: "config.json" },
    { collection: "device-list", file: "device-list.json" },
    { collection: "room-list", file: "room-list.json" },
    { collection: "site", file: "site.json" },
] as const;

const configurationCollectionName = "configuration";
const configurationDocumentId = "ip-addresses";
const defaultIpAddresses = ["10.10.10.0", "10.10.9.0", "192.168.1.0"];

type JsonCollectionName = (typeof jsonCollections)[number]["collection"];
type JsonCache = Record<JsonCollectionName, unknown>;

interface SeededJsonDocument {
    key: string;
    data: unknown;
    sourceFile: string;
    seededAt: Date;
}

interface ConfigurationDocument {
    _id: string;
    ipAddresses: string[];
    updatedAt: Date;
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let initialized = false;

const cache: JsonCache = {
    config: {},
    "device-list": {},
    "room-list": {},
    site: {},
};
let cachedIpAddresses: string[] = [...defaultIpAddresses];

const getDb = async (): Promise<Db> => {
    if (mongoDb) {
        return mongoDb;
    }

    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    mongoDb = mongoClient.db(mongoDbName);
    logger.info(`[server]: Connected to MongoDB at ${mongoUrl} (${mongoDbName})`);
    return mongoDb;
};

const seedJsonCollections = async (db: Db) => {
    for (const entry of jsonCollections) {
        const collection = db.collection<SeededJsonDocument>(entry.collection);
        const existingCount = await collection.countDocuments();

        if (existingCount === 0) {
            const filePath = path.join(jsonAssetsPath, entry.file);
            const content = await fs.readFile(filePath, "utf-8");
            const parsed = JSON.parse(content);
            await collection.insertOne({
                key: "default",
                data: parsed,
                sourceFile: entry.file,
                seededAt: new Date(),
            });
            logger.info(`[server]: Seeded Mongo collection ${entry.collection} from ${entry.file}`);
        }

        const seededDocument = await collection.findOne({ key: "default" })
            || await collection.findOne({});
        cache[entry.collection] = seededDocument?.data || {};
    }
};

const seedConfigurationCollection = async (db: Db) => {
    const collection = db.collection<ConfigurationDocument>(configurationCollectionName);
    const existing = await collection.findOne({ _id: configurationDocumentId });

    if (!existing) {
        await collection.insertOne({
            _id: configurationDocumentId,
            ipAddresses: defaultIpAddresses,
            updatedAt: new Date(),
        });
        cachedIpAddresses = [...defaultIpAddresses];
        logger.info("[server]: Seeded configuration collection with default IP addresses");
        return;
    }

    cachedIpAddresses = Array.isArray(existing.ipAddresses)
        ? existing.ipAddresses.filter((item) => typeof item === "string")
        : [...defaultIpAddresses];
};

const assertInitialized = () => {
    if (!initialized) {
        throw new Error("Data store is not initialized. Call initializeDataStore first.");
    }
};

export const initializeDataStore = async () => {
    const db = await getDb();
    await seedJsonCollections(db);
    await seedConfigurationCollection(db);
    initialized = true;
};

export const getConfigData = () => {
    assertInitialized();
    return cache.config as Record<string, any>;
};

export const getDeviceListData = () => {
    assertInitialized();
    return cache["device-list"] as Record<string, any>;
};

export const getRoomListData = () => {
    assertInitialized();
    return cache["room-list"] as Record<string, any>;
};

export const getSiteData = () => {
    assertInitialized();
    return cache.site as Record<string, any>;
};

export const getIpAddresses = (search?: string) => {
    assertInitialized();
    if (!search) {
        return [...cachedIpAddresses];
    }

    const normalized = search.trim().toLowerCase();
    return cachedIpAddresses.filter((ipAddress) => ipAddress.toLowerCase().includes(normalized));
};

export const addIpAddress = async (ipAddress: string) => {
    assertInitialized();

    const normalized = ipAddress.trim();
    if (!normalized) {
        throw new Error("ipAddress is required");
    }

    if (!cachedIpAddresses.includes(normalized)) {
        cachedIpAddresses = [...cachedIpAddresses, normalized];
        const db = await getDb();
        await db.collection<ConfigurationDocument>(configurationCollectionName).updateOne(
            { _id: configurationDocumentId },
            {
                $set: {
                    ipAddresses: cachedIpAddresses,
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );
    }

    return [...cachedIpAddresses];
};

export const removeIpAddress = async (ipAddress: string) => {
    assertInitialized();

    cachedIpAddresses = cachedIpAddresses.filter((current) => current !== ipAddress);

    const db = await getDb();
    await db.collection<ConfigurationDocument>(configurationCollectionName).updateOne(
        { _id: configurationDocumentId },
        {
            $set: {
                ipAddresses: cachedIpAddresses,
                updatedAt: new Date(),
            },
        },
        { upsert: true }
    );

    return [...cachedIpAddresses];
};
