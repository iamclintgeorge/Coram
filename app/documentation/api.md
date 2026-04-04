# Coram Server API Documentation

Base URL will be the URL on which you host the Application

## Proxmox Endpoints

### 1. Fetch Node Statistics

Retrieves performance metrics and VM statuses for a specific Proxmox node.

- **URL:** `/api/proxmox/fetchNodeStats/:nodeName`
- **Method:** `GET`
- **Path Params:**
  - `nodeName` (string): The unique name of the node in your cluster.

#### Success Response (200 OK)

```json
[
  {
    "vmid": 100,
    "name": "vm1",
    "status": "stopped",
    "cpu": 0,
    "cpus": 1,
    "mem": 0,
    "maxmem": 1073741824,
    "diskread": 0,
    "diskwrite": 0,
    "maxdisk": 5368709120,
    "netin": 0,
    "netout": 0,
    "uptime": 0
  }
]
```
