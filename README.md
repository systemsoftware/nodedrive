# NodeDrive
> Note: this is still in early development.

NodeDrive is a robust, Node.js-powered Network Attached Storage (NAS) server application. It provides a secure web interface and a comprehensive Command Line Interface (CLI) for managing files, users, and connected drives.

## ✨ Key Features

  * **Secure File Management:** Upload, organize, archive, and delete files with built-in rate-limiting and JWT-based authentication.
  * **Custom Database Engine:** Leverages the `dubnium` database for lightweight, high-performance data storage, complete with configurable versioning and trash management.
  * **Integrated CLI:** A powerful command-line interface for direct server management, user creation, and drive mounting.
  * **System Health Monitoring:** Tracks system metrics (like macOS temperature and disk space) and logs system health over time.
  * **Internal Routing Security:** Restricted internal API routes protected by a configurable hostname allowlist.
  * **View in Finder:** Add your NodeDrive Instance to Finder with [systemsoftware/nodedrive-mac](https://github.com/systemsoftware/nodedrive-mac/settings).


## 🛠 Tech Stack

  * **Backend:** Node.js, Express.js
  * **Database:** [Dubnium](https://npmjs.com/dubnium)
  * **Authentication & Security:** JWT (`jsonwebtoken`), `bcrypt`, `express-rate-limit`, `cookie-parser`
  * **File Handling:** `multer`, `archiver`
  * **System Metrics:** `systeminformation`, `check-disk-space`, `macos-temperature-sensor` (can be uninstalled on non-macOS devices, or if you do not need to track CPU temp)

## 🚀 Installation

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

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory.

4.  **Set up the Internal Allowlist:**
    Create a JSON file at `internal/allowlist.json` to define permitted hostnames for internal routes:

    ```json
    [
      "localhost",
      "127.0.0.1"
    ]
    ```

5.  **Link the CLI (Optional but recommended):**
    To use the `nodedrive` command globally:

    ```bash
    npm link
    ```

6.  **Start the server:**

    ```bash
    npm start
    ```

## ⚙️ Configuration

Control NodeDrive's behavior using the following environment variables in your `.env` file:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port the web server runs on. | `80` |
| `JWT_SECRET` | **Required.** Secret key for signing authentication tokens. | `undefined` |
| `DB_PATH` | Directory where Dubnium databases are stored. | `~/.nasdb` |
| `NODE_ENV` | Environment context (e.g., `production`, `development`). | `undefined` |
| `ADVANCED_LOGGING` | Enable detailed console logging (`true`/`false`). | `false` |
| `ROUTE_LIMITING` | Enable rate limits on standard routes (`true`/`false`). | `false` |
| `DB_VERSION_LIMIT` | Global limit for file/document versioning in the DB. | `5` |

*(Note: Granular DB limits like `USERS_DB_VERSION_LIMIT` or `FILES_DB_VERSION_LIMIT` can also be set individually).*

## 💻 Usage

### Web Interface

Once the server is running, navigate to `http://localhost:<PORT>` (or your designated domain). If unauthenticated, you will be redirected to the `/signin` portal.

### CLI Examples

NodeDrive comes with a modular CLI. If you ran `npm link`, you can interact with the server directly from your terminal:

```bash
# General usage structure
nodedrive <command> <subcommand> [options]

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
├── internal/             # Restricted internal routes and server logic
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