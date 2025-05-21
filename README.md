# ObjectWeb — Modular DataBase

**ObjectWeb** is a full-stack application combining a dynamic frontend built with React and a robust backend built with ASP.NET WebAPI. It supports flexible data structures, dynamic list rendering, user-generated settings, and interactive object management — all powered by JSON configurations and Entity Framework.

## 📚 Overview

- Customizable list views based on settings (`ListViewer`)
- Create new users or events via buttons
- Interactive map integration
- Dynamic object hierarchy and editing
- Data persistence via local SQL database and Entity Framework

---

## 🌟 Key Features

- 🗂️ Dynamic ListViewer rendering based on custom JSON settings
- 👤 "New User" / "New Event" creation via UI buttons
- 🗺️ Map integration to visualize objects
- 🧭 Custom URL routing for object navigation
- 🧱 Parent-child relationship handling for nested objects
- 📝 Edit object properties directly in the UI
- ⚙️ Admin-defined settings structure via API
- 📦 Integrated Swagger documentation

---

## 🏗️ Architecture Overview

### 🔧 Backend (.NET Core WebAPI)

- **Models:**
  - `MyObject`: Base entity with a GUID ID and object properties
  - `ObjectProperties`: Key-value based structure for object metadata
  - `Settings` & `SettingsEntity`: Defines the UI and data structure dynamically
  - `ParentReference`: Links between related objects (parent-child)

- **Data Layer:**
  - `ObjectRepository` & `SettingsRepository`: Manage CRUD operations and database access
  - `AppDbContext`: EF Core context managing migrations and relationships

- **API Features:**
  - RESTful endpoints for objects and settings
  - Custom `GET` routes:
    - Filter by `ObjectType`
    - Search across all fields
  - Swagger UI integration with example data generation
