# shelly-host

## MongoDB Integration

This stack now includes MongoDB for runtime configuration and JSON-backed data collections.

### Docker service

MongoDB is defined in [docker-compose.yml](docker-compose.yml) as service `mongo` with:
- Port `27017`
- Persistent volume `mongo_data`
- Healthcheck using `mongosh`

The server depends on Mongo health and starts after Mongo is ready.

### Server environment variables

Defined in [server/.env](server/.env):
- `MONGO_URL` (default: `mongodb://mongo:27017`)
- `MONGO_DB_NAME` (default: `shelly_host`)

## Seeded Mongo Collections

On server startup, [server/src/utils/data-store.helper.ts](server/src/utils/data-store.helper.ts) initializes Mongo and seeds data if collections are empty.

### Collections created from JSON files

- `config` from [server/src/assets/json/config.json](server/src/assets/json/config.json)
- `device-list` from [server/src/assets/json/device-list.json](server/src/assets/json/device-list.json)
- `room-list` from [server/src/assets/json/room-list.json](server/src/assets/json/room-list.json)
- `site` from [server/src/assets/json/site.json](server/src/assets/json/site.json)

Each of these collections stores a document keyed as `default` containing the original JSON payload in a `data` field.

### Configuration collection

A separate `configuration` collection is created with document id `ip-addresses`.

Default values:
- `10.10.10.0`
- `10.10.9.0`
- `192.168.1.0`

These values are used as scan prefixes for Shelly discovery.

## Configuration API

Routes are registered under `VHOST_PREFIX` via [server/src/routers/configuration.router.ts](server/src/routers/configuration.router.ts).

Assuming `VHOST_PREFIX=/api`, endpoints are:

1. `GET /api/configuration/ip-addresses`
- Returns all configured IP prefixes.
- Optional query: `search`
- Example: `GET /api/configuration/ip-addresses?search=10.10`

2. `POST /api/configuration/ip-addresses`
- Adds a new IP prefix.
- Body:

```json
{
  "ipAddress": "10.10.8.0"
}
```

3. `DELETE /api/configuration/ip-addresses/:ipAddress`
- Removes an IP prefix.
- Example: `DELETE /api/configuration/ip-addresses/10.10.8.0`

## Discovery behavior

[server/src/routers/shelly.router.ts](server/src/routers/shelly.router.ts) now discovers devices by:

1. Reading IP prefixes from the Mongo `configuration` collection.
2. Scanning each prefix across the DHCP range from Mongo-backed `config` (`discover.dhcp.start` to `discover.dhcp.end`).
3. Falling back to local network prefix only when no configured prefixes exist.

## Quick start

From [docker-compose.yml](docker-compose.yml) directory:

```bash
docker compose up -d
```

Then use the configuration endpoints to manage scan prefixes without changing JSON files.
