# RFC: XGraph V1 Binary File Format Specification

## Author
W2Inc, Amsterdam 2023-2024

---

## Introduction

This document provides the specification for the XGraph V1 binary file format. The format is designed to represent hierarchical graphs with nodes and goals, ensuring a compact and efficient structure for serialization and deserialization. The specification supports validation to ensure integrity during reading and writing processes.

---

## File Structure Overview

The XGraph V1 binary format consists of two main sections:

1. **Header Section**: Contains metadata for validating and initializing the graph.
2. **Body Section**: Contains hierarchical node data, including goals and relationships.

---

## Data Alignment

- All data fields are aligned to **8-byte** or **16-byte** boundaries where specified.
- Padding bytes (`0x00`) are used to ensure proper alignment.

---

## Header Layout

The header is a fixed-size structure containing the following fields:

| Field         | Offset | Size   | Type       | Description                                    |
|---------------|--------|--------|------------|------------------------------------------------|
| `version`     | 0x00   | 4 bytes | `uint32`   | Version identifier (`0x22446688`)             |
| Padding       | 0x04   | 12 bytes| `padding`  | Reserved for alignment (16 bytes total)       |
| `magic`       | 0x10   | 8 bytes | `uint64`   | Magic number (`0xB0B0BEBAFECA`)               |
| `nodeCount`   | 0x18   | 2 bytes | `uint16`   | Total number of nodes in the graph            |
| `goalCount`   | 0x1A   | 2 bytes | `uint16`   | Total number of goals in the graph            |
| Padding       | 0x1C   | 4 bytes | `padding`  | Reserved for alignment (16 bytes total)       |

---

## Node Layout

Each node represents a single element in the graph hierarchy. Nodes are stored recursively in depth-first order.

| Field            | Offset  | Size   | Type       | Description                                |
|-------------------|---------|--------|------------|--------------------------------------------|
| `id`             | 0x00    | 2 bytes| `int16`    | Unique identifier for the node             |
| `parentId`       | 0x02    | 2 bytes| `int16`    | Identifier of the parent node (`-1` for root) |
| `isRoot`         | 0x04    | 1 byte | `bool`     | `true` if this is the root node            |
| `goalCount`      | 0x05    | 2 bytes| `int16`    | Number of goals associated with this node  |
| `childrenCount`  | 0x07    | 2 bytes| `int16`    | Number of child nodes                      |
| Padding          | 0x09    | 7 bytes| `padding`  | Reserved for alignment (8 bytes total)     |
| Goals            | 0x10+   | N bytes| See below  | List of associated goals                   |
| Children         | N/A     | N bytes| Recursive  | Child node entries (depth-first traversal) |

---

### Goal Layout

Each goal is associated with a node and consists of:

| Field    | Offset | Size   | Type       | Description                   |
|----------|--------|--------|------------|-------------------------------|
| `name`   | 0x00   | N bytes| `cstring`  | Null-terminated string for the goal name |
| `goalId` | N/A    | 16 bytes| `GUID`    | Unique identifier for the goal |

---

## Constraints and Validations

### Header Constraints
- **Version**: Must match the constant `0x22446688`.
- **Magic Number**: Must match the constant `0xB0B0BEBAFECA`.
- **Node Count**: Cannot exceed `MAX_NODES` (4).
- **Goal Count**: Cannot exceed `MAX_GOALS` (3).

### Node Constraints
- **Depth**: Maximum depth is `MAX_DEPTH` (255).
- **Children Count**: A node cannot have more than `MAX_NODES` children.
- **Goal Count**: A node cannot have more than `MAX_GOALS` goals.

---

## Example Binary Layout

### Example Graph

A simple graph with the following structure:

```
Root (ID: 0)
├─ Child1 (ID: 1)
│  ├─ GrandChild1 (ID: 2)
│  └─ GrandChild2 (ID: 3)
└─ Child2 (ID: 4)
```

### Serialized Representation

#### Header
| Offset | Field         | Value        |
|--------|---------------|--------------|
| 0x00   | `version`     | `0x22446688` |
| 0x10   | `magic`       | `0xB0B0BEBAFECA` |
| 0x18   | `nodeCount`   | `5`          |
| 0x1A   | `goalCount`   | `0`          |

#### Body
| Offset | Field           | Value       |
|--------|-----------------|-------------|
| 0x20   | Node 0          | Root Node   |
| 0x40   | Node 1          | Child1      |
| 0x60   | Node 2          | GrandChild1 |
| 0x80   | Node 3          | GrandChild2 |
| 0xA0   | Node 4          | Child2      |

---

## Error Handling

1. **Version Mismatch**: Throw an `Invalid XGraphV1 Version` error if `version` does not match.
2. **Magic Mismatch**: Throw an `Invalid XGraphV1 Magic` error if `magic` does not match.
3. **Invalid Counts**: Validate `nodeCount` and `goalCount` against the specified limits.
4. **Depth Errors**: Throw a `Graph too large` error if `depth > MAX_DEPTH`.

---

## Extensions and Future Versions

- Support for additional node properties (e.g., weights, metadata).
- Increase limits for `MAX_NODES` and `MAX_GOALS`.
- Backward-compatible versioning with a version field in the header.

---

## References

- BaseEndianReader and BaseEndianWriter utility documentation.
- XGraph serialization and deserialization logic.

---

For further information, see the README or contact the W2Inc development team.
