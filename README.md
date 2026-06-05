# Eminent

An Astro + React web app with Clerk authentication and a server-side code runner by [Piston](https://github.com/engineer-man/piston).

## Prerequisites

- Linux server or development machine
- [Bun](https://bun.sh/) for local development
- Node.js `>=22.12.0`
- Docker for the Piston executor
- Nginx for securing and rate-limiting Piston access

## Local app setup

1. Install dependencies:

   ```sh
   bun install
   ```

2. Create your environment file:

   ```sh
   cp .env.example .env
   ```

3. Configure the required environment variables:

   ```env
   # Clerk authentication
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Piston executor
   PISTON_URL=http://localhost:2000
   PISTON_SECRET=change-this-to-a-long-random-secret
   ```

   Notes:

   - `PISTON_URL` must point to the Piston server base URL, without a trailing `/api/v2`.
   - `PISTON_SECRET` must match the secret enforced by the Nginx reverse proxy in front of Piston.

4. Start the development server:

   ```sh
   bun run dev
   ```

5. Open the app at:

   ```text
   http://localhost:4321
   ```

## App commands

Run these from the project root:

| Command | Description |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Start the local Astro dev server |
| `bun run build` | Build the production site |
| `bun run preview` | Preview the production build locally |
| `bun run astro ...` | Run Astro CLI commands |

## Piston executor setup

The code runner calls `/api/piston/evaluate`, which forwards submissions to Piston using `PISTON_URL` and `PISTON_SECRET`.

### 1. Install Docker

On Ubuntu/Debian:

```sh
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify Docker is installed:

```sh
docker --version
docker ps
```

If `docker ps` requires `sudo`, log out and back in so the Docker group change takes effect.

### 2. Start Piston

Create a persistent data directory:

```sh
sudo mkdir -p /piston
```

Run Piston bound to localhost only. Nginx will be the public entry point and will enforce the shared secret and rate limit.

```sh
docker run -d \
  --name piston \
  --restart unless-stopped \
  -p 127.0.0.1:2000:2000 \
  --privileged \
  -v /piston:/piston \
  ghcr.io/engineer-man/piston
```

Check that it is running:

```sh
docker ps
docker logs piston
curl http://localhost:2000/api/v2/runtimes
```

### 3. Install supported runtimes

This project currently allows these runtime/version pairs:

| Language | Piston language | Version |
| --- | --- | --- |
| JavaScript | `javascript` | `18.15.0` |
| TypeScript | `typescript` | `5.0.3` |
| Python | `python` | `3.10.0` |
| C++ | `c++` | `10.2.0` |
| C | `c` | `10.2.0` |
| Java | `java` | `15.0.2` |
| Rust | `rust` | `1.50.0` |

Install them into Piston:

```sh
curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"javascript","version":"18.15.0"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"typescript","version":"5.0.3"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"python","version":"3.10.0"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"c++","version":"10.2.0"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"c","version":"10.2.0"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"java","version":"15.0.2"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"rust","version":"1.50.0"}'
```

Verify the installed runtimes:

```sh
curl http://localhost:2000/api/v2/runtimes
```

### 4. Test execution

Python test:

```sh
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"python","version":"3.10.0","files":[{"content":"print(\"hello from python\")"}]}'
```

JavaScript test:

```sh
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"javascript","version":"18.15.0","files":[{"content":"console.log(\"hello from node\")"}]}'
```

C++ test with stdin:

```sh
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c++",
    "version": "10.2.0",
    "files": [{"content": "#include <iostream>\nusing namespace std;\nint main() {\n  int n;\n  cin >> n;\n  int sum = 0;\n  for (int i = 1; i < n; i++) {\n    if (i % 3 == 0 || i % 5 == 0) sum += i;\n  }\n  cout << sum << endl;\n  return 0;\n}"}],
    "stdin": "10"
  }'
```

Expected C++ output includes `23`.

## Secure Piston with Nginx

Install Nginx:

```sh
sudo apt install nginx -y
```

Create a strong shared secret. This must match the app's `PISTON_SECRET` value:

```sh
openssl rand -hex 32
```

Create `/etc/nginx/sites-available/piston`:

```nginx
limit_req_zone $binary_remote_addr zone=piston:10m rate=30r/m;

server {
    listen 80;
    server_name your-domain.example.com;

    location /api/v2/execute {
        if ($http_x_piston_secret != "replace-with-your-generated-secret") {
            return 403;
        }

        limit_req zone=piston burst=10 nodelay;
        limit_req_status 429;

        proxy_pass http://127.0.0.1:2000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        return 403;
    }
}
```

This config is required for the deployed app. It only exposes `/api/v2/execute`, blocks all other Piston endpoints publicly, enforces `x-piston-secret`, and rate-limits execution requests to `30r/m` per client IP with a burst of `10`.

Enable the site and restart Nginx:

```sh
sudo ln -s /etc/nginx/sites-available/piston /etc/nginx/sites-enabled/piston
sudo nginx -t
sudo systemctl restart nginx
```

If the default Nginx site conflicts with your Piston site, remove it:

```sh
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Set your deployed app environment variables to match:

```env
PISTON_URL=http://192.168.0.1
PISTON_SECRET=replace-with-your-generated-secret
```

Test through Nginx:

```sh
curl -X POST http://192.168.0.1/api/v2/execute \
  -H "Content-Type: application/json" \
  -H "x-piston-secret: replace-with-your-generated-secret" \
  -d '{"language":"python","version":"3.10.0","files":[{"content":"print(\"hello from python\")"}]}'
```

## Deployment notes

This project uses the Vercel adapter with server output enabled in `astro.config.mjs`, so API routes and Clerk middleware run server-side.

When deploying, configure these environment variables in the hosting provider:

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
PISTON_URL=https://your-piston-domain.example.com
PISTON_SECRET=your-production-piston-secret
```

For production, use HTTPS in front of Piston if possible.

## Troubleshooting

### `EXECUTOR_NOT_CONFIGURED`

`PISTON_URL` or `PISTON_SECRET` is missing from the app environment.

### `Unsupported runtime`

The submitted language/version is not listed in `src/hooks/languages.ts`, or the matching Piston runtime has not been installed.

### `403` from Piston/Nginx

The `x-piston-secret` sent by the app does not match the secret configured in Nginx.

### Docker permission denied

Add your user to the Docker group and start a new shell:

```sh
sudo usermod -aG docker $USER
newgrp docker
```

### View Piston logs

```sh
docker logs piston -f
```
