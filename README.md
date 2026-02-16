# Coram - Proxmox Billing Aid

Billing Platform for Proxmox. Users can enter their rate card and currencies to generate a usage-based invoice.

## Installation Guide

This is a rough guide on installing Coram. The application is still under development. Thus, it is advised to use it with caution. Please flag all issues that you come across so that the quality of the application can be improved.

### Prerequisites

- Ensure you have **Golang** installed (version > go1.25.5).

### Running the Application

1. **Download the latest release**: Clone or download the repository from GitHub.

2. **Navigate to the server directory**:

   ```bash
   cd dist/
   ```

3. **Run the Go server**:

   ```bash
   ./app
   ```

4. **Access the application**: Open your web browser and go to `http://localhost:5173`.

### Notes

- The `dist` folder contains the latest built files from the React application, so you don't need to set up a development environment.
- Report any issues or feedback via the project's GitHub page.
- **Currently the above steps DO NOT work as there is a known issue with environment variables. Currently there is an ongoing work on creating a CLI tool to handle this.**
