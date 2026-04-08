# NodeDrive
> Note: this is still in early development.

NodeDrive is a robust, Node.js-powered Network Attached Storage (NAS) server application. It provides a secure web interface and a comprehensive Command Line Interface (CLI) for managing files, users, and connected drives.

## ✨ Key Features

  * **Secure File Management:** Upload, organize, archive, and delete files with built-in rate-limiting and JWT-based authentication.
  * **Custom Database Engine:** Leverages the `dubnium` database for lightweight, high-performance data storage, complete with configurable versioning and trash management.
  * **Integrated CLI:** A powerful command-line interface for direct server management, user creation, and drive mounting.
  * **System Health Monitoring:** Tracks system metrics (like macOS temperature and disk space) and logs system health over time.
  * **Internal Routing Security:** Restricted internal API routes protected by a configurable hostname allowlist.
  * **View in Finder:** Add your NodeDrive Instance to Finder with [systemsoftware/nodedrive-mac](https://github.com/systemsoftware/nodedrive-mac).


## 🛠 Tech Stack

  * **Backend:** Node.js, Express.js
  * **Database:** [Dubnium](https://npmjs.com/dubnium)
  * **Authentication & Security:** JWT (`jsonwebtoken`), `bcrypt`, `express-rate-limit`, `cookie-parser`
  * **File Handling:** `multer`, `archiver`
  * **System Metrics:** `systeminformation`, `check-disk-space`, `macos-temperature-sensor` (can be uninstalled on non-macOS devices, or if you do not need to track CPU temp)

## 🚀 Installation via npm
> Best for simple set up.

If you prefer to use NodeDrive as a system-wide utility, you can install it directly from the npm registry.

**1. Install the package globally:**
```bash
npm install -g nodedrive
```
*(Note: Depending on your system configuration, you may need to run this with `sudo`.)*

**2. Launch the Server:**
Once installed globally, you can start the NAS server from any directory:
```bash
nodedrive start
```

### 💡 Pro Tip: Persistent Services
For a production NAS setup, it is recommended to run the global `nodedrive` command using a process manager like **PM2** to ensure it restarts automatically after a reboot:
```bash
pm2 start "nodedrive start" --name "my-nodedrive"
```

## 🚀 Installation via GitHub
> Best for bleeding edge. This way is harder to keep up to date but may get more frequent minor updates.

### Prerequisites

  * Node.js (v18 or higher recommended)
  * npm (Node Package Manager)

### Step-by-Step Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/systemsoftware/nodedrive
    cd nodedrive
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Link the CLI (Optional but recommended):**
    To use the `nodedrive` command globally:

    ```bash
    npm link
    ```

4.  **Start the server:**

    ```bash
    npm start # or nodedrive start if linked
    ```

## ⚙️ Configuration

Control NodeDrive's behavior using the following conifg options in `~/.nodedrive/config.json`. Use the `nodedrive config` command to manage.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port the web server runs on. | `80` |
| `JWT_SECRET` | **Required.** Secret key for signing authentication tokens. | `undefined` |
| `DB_PATH` | Directory where Dubnium databases are stored. | `~/.nodedrive/db` |
| `ADVANCED_LOGGING` | Enable detailed console logging (`true`/`false`). | `false` |
| `ROUTE_LIMITING` | Enable rate limits on standard routes (`true`/`false`). | `false` |
| `DB_VERSION_LIMIT` | Global limit for file/document versioning in the DB. | `5` |

*(Note: Granular DB limits like `USERS_DB_VERSION_LIMIT` can also be set individually).*

## 💻 Usage

### Web Interface

Once the server is running, navigate to `http://localhost:<PORT>` (or your designated domain). If unauthenticated, you will be redirected to the `/signin` portal.

### CLI Examples

NodeDrive comes with a modular CLI. If you installed globally via npm or ran `npm link`, you can interact with the server directly from your terminal:

```bash
# General usage structure
nodedrive <command> <subcommand> [options]

# Example: Get help
nodedrive help [search] # ex: nodedrive help user

# Example: Get system info
nodedrive info

# Example: Manage drives
nodedrive drive list
nodedrive drive mount

# Example: Manage users
nodedrive user create
```


## 📂 Project Structure

```text
nodedrive/
├── bin/                  # CLI executable logic and subcommands
├── internal/             # Internal routes and server logic
├── routes/               # Express routing for web pages (UI)
├── static/               # Static assets (HTML, images, client-side JS)
├── db.js                 # Dubnium database initialization & configuration
├── index.js              # Main Express application entry point
├── package.json          # Project metadata and dependencies
└── utils/                # Helper functions and utilities
```

## ⚠️ Known Limitations

  * The application currently relies heavily on local disk storage constraints; mounting external drives requires strict permission management on the host OS.

## 📄 License

This project is licensed under the MIT License.