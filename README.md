# Tailormap Starter project

This is a starter project to extend the Tailormap viewer with extra functionality. Fork this repository to get started! Remember to [keep your fork in sync](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork).

See [tailormap-viewer](https://github.com/B3Partners/tailormap-viewer/) for details.

See [GETTING_STARTED](docs/GETTING_STARTED.md) to find an example for adding a component to Tailormap.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Using a Tailormap backend

When running a dev server, the tailormap-api is proxied. See [proxy.config.js](proxy.config.js). You can change the URL to connect to a different tailormap-api instance (you can also run one locally).

## Using Docker Compose

You can run a container with a Nginx webserver serving the Tailormap frontend as follows:

 - Copy `.env.template` to `.env`
 - Set the `NAME` variable to a unique name for your customized frontend
 - Set the `HOSTNAME` variable to the hostname where your frontend will be deployed
 - Run `docker-compose --profile http up --detach`.
 
When you change the `NAME` or `HOSTNAME` variables, build the images again with `docker-compose build --no-cache`.

### Container build time variables

The `NAME` variable is used to tag the webserver image with `tailormap-viewer-${NAME}_web`. 
The `HOSTNAME` variable is used in a Traefik label for an automatic name based virtual hosting 
reverse proxy in Traefik and automatic Let's Encrypt SSL certificate (name your certificate 
resolver in Traefik `letsencrypt`).

### Container runtime variables

The backend API and administration interface can be proxied by setting container runtime 
environment variables (these are picked up from `.env` by referencing them in `docker-compose.yml`).

 - Set `API_PROXY_ENABLE` to `true` to enable reverse proxying of `/api/`
 - Set `API_PROXY_URL` to the URL (reachable from the web container) to the API. You can point 
   this to a container in a full Tailormap stack (`http://api:8080/api/`) or a publicly deployed API
   (for example `https://snapshot.tailormap.nl/api/`).
 - Set `API_PROXY_HOST` to configure the `Host` HTTP header sent to the API backend. Required when the API is
   deployed behind a name-based virtual host and for generating correct absolute URLs.
 - Set these variables starting with `ADMIN_` instead of `API_` to configure the `/admin/` proxy for access
   to the administration interface.

Note that the `admin` container must be started with the hostname it is deployed on configured separately, it does not use
the `Host` HTTP header.
