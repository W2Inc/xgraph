### **Request for Comments: XGraph Binary File Format Version 1.0**

#### **Abstract**

This document specifies the binary layout for the XGraph data serialization format. XGraph is a compact, extensible format for representing hierarchical node-graph structures with goals and their associated metadata. Version 1.0 incorporates several enhancements over previous designs, including better memory layout, extensibility, and integrity validation via checksum.

---

### **1. File Structure**

The XGraph file format consists of three main sections:

1. **Header**: Metadata describing the file and overall graph.
2. **Body**: Serialized graph data, including nodes and goals.
3. **Footer**: Checksum for integrity validation.

#### **1.1 Layout Overview**

```plaintext
+------------------------+
|       Header           |
+------------------------+
|       Body             |
+------------------------+
|       Footer           |
+------------------------+
```

---

### **2. Header**

The header provides high-level metadata and constraints for the file. All multi-byte fields are stored in **big-endian** format.

| Field             | Offset (Bytes) | Length (Bytes) | Description                                      |
| ----------------- | -------------- | -------------- | ------------------------------------------------ |
| **Version**       | 0              | 2              | XGraph format version (`0x0100` for v1.0).       |
| **Compatibility** | 2              | 2              | Minimum compatible reader version.               |
| **Magic**         | 4              | 8              | Magic number (`0x584752415048`, ASCII "XGRAPH"). |
| **Total Nodes**   | 12             | 2              | Total number of nodes in the graph.              |
| **Total Goals**   | 14             | 2              | Total number of goals in the graph.              |
| **Reserved**      | 16             | 8              | Reserved for future use (set to `0`).            |
| **Padding**       | 24             | 8              | Padding to align to a 32-byte boundary.          |

#### **2.1 Magic Number**

The magic number ensures that the file is recognized as an XGraph file. It is a fixed 64-bit value representing the ASCII string "XGRAPH".

#### **2.2 Compatibility**

The compatibility field specifies the minimum version of the reader required to parse this file, allowing for graceful degradation in future versions.

---

### **3. Body**

The body contains the serialized graph data. It begins with the root node and includes all child nodes recursively. Each node specifies its ID, parent ID, goals, and child nodes.

#### **3.1 Node Layout**

Each node has the following structure:

| Field           | Offset (Bytes) | Length (Bytes) | Description                            |
| --------------- | -------------- | -------------- | -------------------------------------- |
| **Node ID**     | 0              | 2              | Unique identifier for the node.        |
| **Parent ID**   | 2              | 2              | ID of the parent node (`-1` for root). |
| **Is Root**     | 4              | 1              | `1` if root node, otherwise `0`.       |
| **Goal Count**  | 5              | 2              | Number of goals for this node.         |
| **Child Count** | 7              | 2              | Number of child nodes.                 |
| **Goals**       | 9              | Variable       | Serialized list of goals (see below).  |
| **Children**    | N/A            | Variable       | Serialized list of child nodes.        |

#### **3.2 Goal Layout**

Each goal is serialized as follows:

| Field           | Offset (Bytes) | Length (Bytes) | Description                          |
| --------------- | -------------- | -------------- | ------------------------------------ |
| **Name**        | 0              | Variable       | Null-terminated string (UTF-8).      |
| **Goal ID**     | N/A            | 16             | GUID for the goal.                   |
| **Description** | N/A            | Variable       | Null-terminated string (UTF-8).      |
| **State**       | N/A            | 1              | Goal state (`0` = NotStarted, etc.). |

---

### **4. Footer**

The footer contains a checksum for verifying file integrity.

| Field        | Offset (Bytes) | Length (Bytes) | Description                                         |
| ------------ | -------------- | -------------- | --------------------------------------------------- |
| **Checksum** | -4             | 4              | CRC-32 checksum of the entire file (except itself). |

---

### **5. Data Validation**

To ensure robustness, readers must perform the following validations:

1. **Magic Number**: Verify that the magic number matches `0x584752415048`.
2. **Version Compatibility**: Ensure the `Compatibility` field is less than or equal to the reader's version.
3. **Node and Goal Constraints**:
   - Nodes must not exceed `MAX_NODES`.
   - Goals must not exceed `MAX_GOALS`.
   - Depth must not exceed `MAX_DEPTH`.
4. **Checksum Validation**: Compute the CRC-32 checksum of the file and compare it with the footer value.

---

### **6. Example Serialization**

#### **6.1 Sample Graph**

A simple graph with a single root node and one child node.

- **Root Node**:
  - ID: 0, Parent ID: -1, 1 goal, 1 child.
  - Goal: `{ name: "Root Goal", id: "123e4567-e89b-12d3-a456-426614174000", description: "Root goal description", state: InProgress }`.
- **Child Node**:
  - ID: 1, Parent ID: 0, 0 goals, 0 children.

#### **6.2 Serialized Data**

| Section   | Hexadecimal Representation                                    | Description                   |
| --------- | ------------------------------------------------------------- | ----------------------------- |
| Header    | `00 01 00 01 58 47 52 41 50 48 00 00 00 00 00 02 00 01 00`    | Version, magic, total counts. |
| Root Node | `00 00 FF FF 01 00 01 00 01 "Root Goal\0" "..." 01 00 01 ...` | Serialized root node.         |
| Footer    | `DE AD BE EF`                                                 | Checksum (example).           |

---

### **7. Future Enhancements**

To improve scalability and extensibility, the following features are proposed for future versions:

1. **Index Table**: Include an optional index of node offsets for faster access in large graphs.
2. **Compressed Goals**: Add support for compressing the goals section using standard compression algorithms (e.g., zlib).
3. **Optional Metadata**: Add graph-level metadata for description, creation time, and custom properties.

---

### **8. Conclusion**

This updated XGraph format provides a compact, efficient, and extensible solution for serializing hierarchical graph structures. Its checksum validation ensures data integrity, while the version compatibility field guarantees backward compatibility. These features make XGraph suitable for a wide range of use cases, from configuration files to large-scale graph processing.

For questions or suggestions, please contact the authors or submit an issue on the project's repository.

---
