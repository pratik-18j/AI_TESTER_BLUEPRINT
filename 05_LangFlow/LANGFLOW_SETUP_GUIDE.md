# Langflow Local Setup & Operations Guide

This guide details the complete workflow for setting up and working with Langflow on your Windows machine using `uv` and Visual Studio Code.

---

## Part 1: One-Time Setup
These are the foundational configuration steps you executed once to establish your isolated project space. You do not need to repeat these steps when returning to work on your project.

### Step 1: Navigate to the Dedicated Project Directory
* **Where to run:** Visual Studio Code Terminal (or standard Command Prompt).
* **Command:**
  ```cmd
  cd 05_LangFlow
  ```
* **Why we do this:** Organizing your learning by topics (e.g., `05_LangFlow`) ensures that your workflows, code files, and environment files stay compartmentalized. Running this command focuses your terminal's operational scope specifically to this subfolder rather than the global `AI_TESTER_BLUEPRINT` root folder.

### Step 2: Create an Isolated Virtual Environment
* **Where to run:** Visual Studio Code Terminal inside the `05_LangFlow` directory.
* **Command:**
  ```cmd
  uv venv
  ```
* **Why we do this:** Python applications often rely on different versions of libraries. Creating a virtual environment (`.venv`) creates a clean, isolated bubble inside your project folder. This prevents dependencies from breaking other projects on your machine and ensures your setups remain stable.

### Step 3: Install Langflow via the Package Installer
* **Where to run:** Visual Studio Code Terminal, **only after activating the environment** (indicated by `(05_LangFlow)` at the start of your terminal line).
* **Command:**
  ```cmd
  uv pip install langflow
  ```
* **Why we do this:** This downloads the Langflow software and links its executable libraries inside your project's local `.venv` environment. By using `uv`, the files are efficiently cross-referenced with your global computer cache, saving disk space while keeping the runtime completely local to this workspace.

---

## Part 2: Daily Operations Workflow
Follow these steps **every single time** you open a new VS Code window and want to start working on your Langflow flows.

### Step 1: Ensure Terminal is in the Correct Folder
* **Where to check:** Look at the directory path displayed in your VS Code terminal. It should end with `\05_LangFlow`. If it doesn't, navigate there using:
  ```cmd
  cd 05_LangFlow
  ```
* **Why we do this:** Your virtual environment configuration files and launch scripts live specifically inside this directory. The terminal must be co-located with these files to find and recognize them.

### Step 2: Activate the Project Virtual Environment
* **Where to run:** Visual Studio Code Terminal inside `05_LangFlow`.
* **Command:**
  ```cmd
  .venv\Scripts\activate
  ```
* **Why we do this:** Windows needs to be told to divert its attention away from your system's global Python installation and start executing tools from your isolated project bubble instead.
* **How to verify success:** Look at the far left edge of your terminal prompt. It must show **`(05_LangFlow)`**. If you do not see this prefix, the environment is not active, and launching Langflow will fail or revert to an unintended environment.

### Step 3: Launch the Langflow Local Server
* **Where to run:** Visual Studio Code Terminal (with active `(05_LangFlow)` prompt).
* **Command:**
  ```cmd
  uv run langflow run
  ```
* **Why we do this:** This command spins up a local web server and database backend directly on your computer hardware. 
* **Important Note:** You **must keep this VS Code terminal open** while you work. If you close the terminal or kill the process, the server shuts down, and your web browser canvas will disconnect.

### Step 4: Open Your Web Browser Dashboard
* **Where to run:** Google Chrome (or your preferred web browser).
* **URL:** Go to the following address:
  ```text
  http://127.0.0.1:7860
  ```
  *(Note: If port 7860 is busy, check your terminal log—it may automatically shift to `http://127.0.0.1:7861` as seen in your browser snippet).*
* **Why we do this:** Since you are running a completely local, developer-centric environment, you do not need an account or an internet-facing login. Navigating to this address connects your browser's visual layout tool directly to the server running inside your terminal.

---

## Part 3: Data Management & Saving Your Work

1. **Autosave Functionality:** Langflow automatically tracks every single structural modification, connection string, and node adjustment on your canvas. These details are written live to a local SQLite database file generated within your system profile. You do not need a manual file layout to prevent progress loss.
2. **Exporting Blueprints:** To safely store your project blueprints directly within your `05_LangFlow` assignment tracking folders, use the **Export** button situated at the top right of your open canvas. Download the workspace configuration as a `.json` file and save it cleanly into your project folder. This enables you to track variations or share specific builds seamlessly.
